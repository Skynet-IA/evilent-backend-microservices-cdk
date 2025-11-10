#!/bin/bash

# 🗄️ SETUP DATABASE TEST ENVIRONMENT
# Script para configurar automáticamente las variables de entorno necesarias
# para ejecutar los Database Integration Tests

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🗄️  CONFIGURACIÓN DE ENTORNO PARA DATABASE TESTS${NC}"
echo ""

# Función para obtener output de CloudFormation
get_cf_output() {
    local stack_name="$1"
    local output_key="$2"
    aws cloudformation describe-stacks \
        --stack-name "$stack_name" \
        --query "Stacks[0].Outputs[?OutputKey=='$output_key'].OutputValue" \
        --output text 2>/dev/null || echo ""
}

# Función para verificar si variable está configurada
check_var() {
    local var_name="$1"
    local var_value="$2"
    if [ -n "$var_value" ] && [ "$var_value" != "None" ]; then
        echo -e "${GREEN}✅ $var_name: $var_value${NC}"
        return 0
    else
        echo -e "${RED}❌ $var_name: NO CONFIGURADO${NC}"
        return 1
    fi
}

# Verificar que estemos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -f "cdk.json" ]; then
    echo -e "${RED}❌ Error: Ejecutar desde el directorio raíz del proyecto user-service${NC}"
    exit 1
fi

echo -e "${YELLOW}🔍 Verificando infraestructura desplegada...${NC}"

# Verificar que UserServiceStack esté desplegado
USER_STACK_EXISTS=$(aws cloudformation describe-stacks --stack-name UserServiceStack --query 'Stacks[0].StackStatus' --output text 2>/dev/null || echo "NOT_FOUND")

if [ "$USER_STACK_EXISTS" = "NOT_FOUND" ]; then
    echo -e "${RED}❌ Error: UserServiceStack no está desplegado${NC}"
    echo -e "${YELLOW}💡 Ejecutar primero: make deploy COGNITO_POOL_ID=tu_pool_id${NC}"
    exit 1
fi

echo -e "${GREEN}✅ UserServiceStack encontrado${NC}"

# Obtener valores de CloudFormation outputs
echo ""
echo -e "${YELLOW}📋 Obteniendo configuración de CloudFormation...${NC}"

DB_SECRET_ARN=$(get_cf_output "UserServiceStack" "DatabaseDatabaseSecretArn884B6F93" 2>/dev/null || echo "")
DB_ENDPOINT=$(get_cf_output "UserServiceStack" "DatabaseDatabaseEndpoint55DA5326" 2>/dev/null || echo "")
# DB_NAME es fijo para este proyecto (usamos la base de datos 'postgres' por defecto de RDS)
DB_NAME="postgres"

# Extraer credenciales del secret para tests directos
if [ -n "$DB_SECRET_ARN" ]; then
    SECRET_JSON=$(aws secretsmanager get-secret-value --secret-id "$DB_SECRET_ARN" --query 'SecretString' --output text 2>/dev/null || echo "")
    if [ -n "$SECRET_JSON" ]; then
        DB_USER=$(echo "$SECRET_JSON" | jq -r '.username' 2>/dev/null || echo "")
        DB_PASSWORD=$(echo "$SECRET_JSON" | jq -r '.password' 2>/dev/null || echo "")
    fi
fi

# Si no tenemos DB_NAME, usar valor por defecto
if [ -z "$DB_NAME" ] || [ "$DB_NAME" = "None" ]; then
    DB_NAME="evilent_users"
fi

echo ""
echo -e "${BLUE}📊 VARIABLES DE ENTORNO NECESARIAS:${NC}"

# Verificar cada variable
check_var "DB_SECRET_ARN" "$DB_SECRET_ARN"
check_var "DB_ENDPOINT" "$DB_ENDPOINT"
check_var "DB_NAME" "$DB_NAME"
check_var "DB_USER" "$DB_USER"
check_var "DB_PASSWORD" "$DB_PASSWORD"

echo ""

# Verificar si todas las variables están configuradas
MISSING_VARS=0
check_var "DB_SECRET_ARN" "$DB_SECRET_ARN" > /dev/null || MISSING_VARS=$((MISSING_VARS+1))
check_var "DB_ENDPOINT" "$DB_ENDPOINT" > /dev/null || MISSING_VARS=$((MISSING_VARS+1))
check_var "DB_NAME" "$DB_NAME" > /dev/null || MISSING_VARS=$((MISSING_VARS+1))
check_var "DB_USER" "$DB_USER" > /dev/null || MISSING_VARS=$((MISSING_VARS+1))
check_var "DB_PASSWORD" "$DB_PASSWORD" > /dev/null || MISSING_VARS=$((MISSING_VARS+1))

if [ $MISSING_VARS -gt 0 ]; then
    echo -e "${RED}❌ Faltan $MISSING_VARS variables de entorno${NC}"
    echo ""
    echo -e "${YELLOW}🔧 Soluciones:${NC}"
    echo "1. Asegurarse de que la infraestructura esté completamente desplegada"
    echo "2. Verificar outputs de CloudFormation: make outputs"
    echo "3. Si faltan outputs, redeploy: make deploy COGNITO_POOL_ID=tu_pool_id"
    echo ""
    echo -e "${BLUE}💡 Una vez que tengas los valores, configurar manualmente:${NC}"
    echo "export DB_SECRET_ARN=\"$DB_SECRET_ARN\""
    echo "export DB_ENDPOINT=\"$DB_ENDPOINT\""
    echo "export DB_NAME=\"$DB_NAME\""
    exit 1
fi

echo -e "${GREEN}✅ Todas las variables están configuradas correctamente${NC}"

# Verificar conectividad básica (opcional)
echo ""
echo -e "${YELLOW}🌐 Verificando conectividad básica...${NC}"

if ping -c 1 -W 2 "$DB_ENDPOINT" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Endpoint reachable: $DB_ENDPOINT${NC}"
else
    echo -e "${YELLOW}⚠️  Endpoint no reachable desde aquí (esperado en VPC privada)${NC}"
    echo -e "${YELLOW}   Los tests conectarán via Bastion Host${NC}"
fi

# NO modificar .env automáticamente (contiene variables personales)
echo ""
echo -e "${YELLOW}💡 Para configurar variables permanentemente:${NC}"
echo -e "${BLUE}   1. Copia .env.example a .env: cp .env.example .env${NC}"
echo -e "${BLUE}   2. Agrega estas líneas a tu .env:${NC}"
echo ""
echo -e "${GREEN}   # Variables para Database Tests${NC}"
echo -e "${GREEN}   export DB_SECRET_ARN=\"$DB_SECRET_ARN\"${NC}"
echo -e "${GREEN}   export DB_ENDPOINT=\"$DB_ENDPOINT\"${NC}"
echo -e "${GREEN}   export DB_NAME=\"$DB_NAME\"${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE: .env contiene variables personales - NO commitear${NC}"

# Configurar variables en la sesión actual
echo ""
echo -e "${GREEN}🚀 Configurando variables en la sesión actual...${NC}"

export DB_SECRET_ARN="$DB_SECRET_ARN"
export DB_ENDPOINT="$DB_ENDPOINT"
export DB_NAME="$DB_NAME"
export DB_USER="$DB_USER"
export DB_PASSWORD="$DB_PASSWORD"

echo -e "${GREEN}✅ Variables configuradas en la sesión actual:${NC}"
echo "DB_SECRET_ARN=$DB_SECRET_ARN"
echo "DB_ENDPOINT=$DB_ENDPOINT"
echo "DB_NAME=$DB_NAME"
echo "DB_USER=$DB_USER"
echo "DB_PASSWORD=***"

echo ""
echo -e "${BLUE}💾 Guardando variables en .db-env.tmp para Make...${NC}"

# Guardar variables en archivo temporal para que Make las pueda usar
cat > .db-env.tmp << EOF
export DB_SECRET_ARN="$DB_SECRET_ARN"
export DB_ENDPOINT="$DB_ENDPOINT"
export DB_NAME="$DB_NAME"
export DB_USER="$DB_USER"
export DB_PASSWORD="$DB_PASSWORD"
EOF

echo ""
echo -e "${BLUE}🎯 Listo para ejecutar Database Integration Tests!${NC}"
echo ""
echo -e "${YELLOW}Ejecutar:${NC}"
echo "make test-database"
echo ""
echo -e "${GREEN}🎉 Configuración completada exitosamente!${NC}"

# Salir con éxito
exit 0
