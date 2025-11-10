#!/bin/bash

# ============================================
# 🗄️ DATABASE TUNNEL - SSM Port Forwarding
# ============================================
# Crea un túnel seguro desde localhost:5432 al RDS PostgreSQL
# usando AWS SSM Session Manager y el Bastion Host
#
# Uso: ./create-db-tunnel.sh
# ============================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔒 ESTABLECIENDO TÚNEL DE BASE DE DATOS VIA SSM${NC}"
echo ""

# Función para verificar que AWS CLI esté configurado
check_aws_config() {
    if ! aws sts get-caller-identity >/dev/null 2>&1; then
        echo -e "${RED}❌ ERROR: AWS CLI no configurado o credenciales inválidas${NC}"
        echo -e "${YELLOW}💡 Ejecuta: aws configure${NC}"
        exit 1
    fi
}

# Función para obtener el ID del Bastion Host
get_bastion_id() {
    local bastion_id
    bastion_id=$(aws cloudformation describe-stack-resources \
        --stack-name UserServiceStack \
        --query 'StackResources[?ResourceType==`AWS::EC2::Instance`].PhysicalResourceId' \
        --output text 2>/dev/null)

    if [ -z "$bastion_id" ] || [ "$bastion_id" = "None" ]; then
        echo -e "${RED}❌ ERROR: No se encontró instancia Bastion en el stack${NC}"
        echo -e "${YELLOW}💡 Verifica que UserServiceStack esté desplegado${NC}"
        exit 1
    fi

    echo "$bastion_id"
}

# Función para verificar que la instancia esté ejecutándose
check_instance_state() {
    local instance_id="$1"
    local state

    state=$(aws ec2 describe-instances \
        --instance-ids "$instance_id" \
        --query 'Reservations[0].Instances[0].State.Name' \
        --output text 2>/dev/null)

    if [ "$state" != "running" ]; then
        echo -e "${RED}❌ ERROR: Instancia Bastion no está ejecutándose (estado: $state)${NC}"
        echo -e "${YELLOW}💡 Ejecuta: make bastion-start${NC}"
        exit 1
    fi
}

# Función para verificar conectividad local
check_local_port() {
    local port=5432
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Puerto $port ya está en uso localmente${NC}"
        echo -e "${YELLOW}💡 Cerrando proceso existente...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Función para verificar que el túnel esté funcionando
verify_tunnel() {
    local max_attempts=15
    local attempt=1

    echo -e "${BLUE}🔍 Verificando túnel SSM...${NC}"

    while [ $attempt -le $max_attempts ]; do
        echo -e "${YELLOW}Intento $attempt/$max_attempts: Probando conexión local...${NC}"

        # Intentar conectar al puerto local usando nc (netcat)
        if nc -z localhost 5432 2>/dev/null; then
            echo -e "${GREEN}✅ Túnel SSM operativo en localhost:5432${NC}"
            return 0
        fi

        echo -e "${YELLOW}⏳ Esperando túnel... ($attempt/$max_attempts)${NC}"
        sleep 1
        ((attempt++))
    done

    echo -e "${RED}❌ Túnel SSM no se estableció después de $max_attempts intentos${NC}"
    return 1
}

# Función principal para crear el túnel
create_tunnel() {
    local bastion_id="$1"

    echo -e "${GREEN}✅ Configuración validada${NC}"
    echo -e "${BLUE}🚀 Creando túnel SSM...${NC}"
    echo ""

    # Comando SSM para port forwarding
    aws ssm start-session \
        --target "$bastion_id" \
        --document-name AWS-StartPortForwardingSession \
        --parameters '{"portNumber":["5432"],"localPortNumber":["5432"]}' \
        --region eu-central-1 &

    # Guardar PID del proceso SSM
    SSM_PID=$!

    echo -e "${BLUE}🔍 Verificando que el túnel esté operativo...${NC}"

    # Verificar que el túnel esté funcionando
    if verify_tunnel; then
        echo ""
        echo -e "${GREEN}✅ Túnel SSM completamente operativo${NC}"
        echo -e "${BLUE}🚀 Ejecutando tests de base de datos...${NC}"
        echo ""

        # Ejecutar los tests mientras el túnel está activo
        if npm run test:database; then
            echo ""
            echo -e "${GREEN}✅ Tests completados exitosamente${NC}"
        else
            echo ""
            echo -e "${RED}❌ Tests fallaron${NC}"
            kill $SSM_PID 2>/dev/null || true
            exit 1
        fi
    else
        echo -e "${RED}❌ No se pudo establecer el túnel SSM${NC}"
        kill $SSM_PID 2>/dev/null || true
        exit 1
    fi

    # Esperar a que el proceso SSM termine
    wait $SSM_PID

    echo ""
    echo -e "${GREEN}✅ Túnel cerrado exitosamente${NC}"
}

# Función para crear túnel en modo automático (desde make)
create_tunnel_auto() {
    local bastion_id="$1"

    echo -e "${GREEN}✅ Configuración validada${NC}"
    echo -e "${BLUE}🚀 Creando túnel SSM...${NC}"
    echo ""

    # Comando SSM para port forwarding en background
    # Nota: El endpoint RDS se obtiene automáticamente de las variables de entorno o AWS
    aws ssm start-session \
        --target "$bastion_id" \
        --document-name AWS-StartPortForwardingSessionToRemoteHost \
        --parameters "{\"host\":[\"${DB_ENDPOINT}\"],\"portNumber\":[\"5432\"],\"localPortNumber\":[\"5432\"]}" &
    SSM_PID=$!

    echo -e "${BLUE}🔍 Verificando que el túnel esté operativo...${NC}"

    # Verificar que el túnel esté funcionando
    if verify_tunnel; then
        echo ""
        echo -e "${GREEN}✅ Túnel SSM operativo - Ejecutando tests...${NC}"

        # Ejecutar los tests
        if npm run test:database; then
            echo ""
            echo -e "${GREEN}✅ Tests completados exitosamente${NC}"
            EXIT_CODE=0
        else
            echo ""
            echo -e "${RED}❌ Tests fallaron${NC}"
            EXIT_CODE=1
        fi
    else
        echo -e "${RED}❌ Túnel SSM no se pudo establecer${NC}"
        EXIT_CODE=1
    fi

    # Limpiar túnel
    echo ""
    echo -e "${BLUE}🧹 Cerrando túnel...${NC}"
    kill $SSM_PID 2>/dev/null || true

    echo ""
    echo -e "${GREEN}✅ Proceso completado${NC}"
    exit $EXIT_CODE
}

# Función principal
main() {
    echo "Verificando configuración..."

    # Verificar AWS CLI
    check_aws_config

    # Obtener ID del Bastion
    BASTION_ID=$(get_bastion_id)
    echo -e "${GREEN}✅ Bastion Host encontrado: $BASTION_ID${NC}"

    # Verificar estado de la instancia
    check_instance_state "$BASTION_ID"
    echo -e "${GREEN}✅ Instancia ejecutándose${NC}"

    # Verificar puerto local
    check_local_port

    # Verificar si estamos en modo automático (desde make)
    if [ "${TUNNEL_AUTO_MODE}" = "true" ]; then
        echo ""
        echo -e "${BLUE}🔒 Creando túnel SSM automático...${NC}"
        create_tunnel_auto "$BASTION_ID"
    else
        echo ""
        echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
        echo -e "${BLUE}🎯 TÚNEL LISTO - Ejecuta tests en otra terminal:${NC}"
        echo -e "${GREEN}   make test-database${NC}"
        echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
        echo ""

        # Crear el túnel (esta función se ejecuta hasta que se cierre)
        create_tunnel "$BASTION_ID"
    fi
}

# Ejecutar función principal
main "$@"
