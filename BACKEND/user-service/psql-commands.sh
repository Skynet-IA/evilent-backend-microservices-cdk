#!/bin/bash
# ============================================
# psql-commands.sh - COMANDOS AUTOMATIZADOS PARA POSTGRESQL
# ============================================
#
# 📖 ¿QUÉ HACE ESTE SCRIPT?
# --------------------------
# Este script ejecuta consultas SQL específicas en tu base de datos PostgreSQL
# conectándose DIRECTAMENTE desde tu máquina local (sin Bastion Host).
#
# 🎯 ¿CUÁNDO USARLO?
# -------------------
# - Verificar que las migraciones funcionaron
# - Ver rápidamente cuántos usuarios hay
# - Buscar un usuario específico por email o ID
# - Obtener estadísticas de la base de datos
# - Crear backups de tablas
# - Debugging rápido
#
# 🔧 REQUISITOS:
# --------------
# - psql instalado localmente (PostgreSQL client)
# - Credenciales AWS configuradas (aws configure)
# - jq instalado (para parsear JSON)
#
# 🚀 EJEMPLOS DE USO REALES:
# ---------------------------
# 1. Verificar que la tabla users existe:
#    ./psql-commands.sh list-tables
#
# 2. Ver cuántos usuarios hay en total:
#    ./psql-commands.sh count-records users
#
# 3. Buscar un usuario por email:
#    ./psql-commands.sh search-email gmail
#
# 4. Ver los últimos 10 usuarios registrados:
#    ./psql-commands.sh recent-users 10
#
# 5. Obtener estadísticas completas de usuarios:
#    ./psql-commands.sh users-summary
#
# 6. Ver datos de un usuario específico por ID:
#    ./psql-commands.sh find-by-id users 5
#
# 7. Ver la estructura de la tabla users:
#    ./psql-commands.sh table-structure users
#
# 8. Ver información del sistema:
#    ./psql-commands.sh db-info
#
# 💡 PARA VER TODOS LOS COMANDOS:
#    ./psql-commands.sh help
#
# ============================================

set -e  # Si algún comando falla, el script se detiene inmediatamente

# ===== CONFIGURACIÓN DE COLORES =====
# Estos códigos ANSI hacen que el texto se vea colorido en la terminal
RED='\033[0;31m'     # Rojo para errores
GREEN='\033[0;32m'   # Verde para éxito
YELLOW='\033[1;33m'  # Amarillo para advertencias
BLUE='\033[0;34m'    # Azul para información
NC='\033[0m'         # No Color - vuelve al color normal

# ===== CONFIGURACIÓN DEL SISTEMA =====
# Estos valores están hardcodeados porque siempre son los mismos para tu proyecto
STACK_NAME="UserServiceStack"    # Nombre del stack en AWS CloudFormation
AWS_REGION="eu-central-1"         # Región de AWS donde está desplegado tu sistema
DB_NAME="postgres"               # Nombre de la base de datos PostgreSQL (por defecto en RDS)

# ===== NOTA IMPORTANTE =====
# Este script ahora se conecta DIRECTAMENTE a la base de datos RDS desde tu máquina local.
# Antes usaba el Bastion Host, pero ahora que la Lambda está fuera de la VPC,
# podemos conectarnos directamente. La base de datos es públicamente accesible para desarrollo.

# ============================================
# FUNCIÓN: get_credentials()
# ============================================
# 📋 PROPÓSITO:
#    Obtiene automáticamente las credenciales de la base de datos desde AWS
#    sin que tengas que recordarlas o escribirlas manualmente.
#
# 🔄 FLUJO:
#    1. Busca el ARN del secreto en CloudFormation
#    2. Obtiene las credenciales desde AWS Secrets Manager
#    3. Extrae: DB_ENDPOINT, DB_USER, DB_PASSWORD
#    4. Verifica que psql esté instalado localmente
#
# 💾 VARIABLES QUE CREA:
#    - SECRET_ARN: ARN del secreto en Secrets Manager
#    - DB_ENDPOINT: Dirección del servidor PostgreSQL (ej: xxx.rds.amazonaws.com)
#    - DB_USER: Usuario de la base de datos (ej: postgres)
#    - DB_PASSWORD: Contraseña de la base de datos
#
# ❌ ERRORES POSIBLES:
#    - "No se pudo obtener el Secret ARN" → Problema con el stack
#    - "psql no está instalado" → Instalar PostgreSQL client
# ============================================
get_credentials() {
    echo -e "${BLUE}🔐 Obteniendo credenciales desde AWS...${NC}"

    # ===== PASO 1: VERIFICAR QUE PSQL ESTÁ INSTALADO =====
    if ! command -v psql &> /dev/null; then
        echo -e "${RED}❌ ERROR: psql no está instalado${NC}"
        echo -e "${YELLOW}💡 SOLUCIONES:${NC}"
        echo -e "${YELLOW}   macOS: brew install postgresql${NC}"
        echo -e "${YELLOW}   Ubuntu/Debian: sudo apt install postgresql-client${NC}"
        echo -e "${YELLOW}   CentOS/RHEL: sudo yum install postgresql${NC}"
        exit 1
    fi

    # ===== PASO 2: ENCONTRAR EL SECRETO =====
    # Las credenciales de la base de datos están guardadas de forma segura en AWS Secrets Manager.
    # Necesitamos el ARN (Amazon Resource Name) del secreto para poder obtenerlo.

    SECRET_ARN=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --region $AWS_REGION \
        --query 'Stacks[0].Outputs[?contains(OutputKey, `SecretArn`)].OutputValue' \
        --output text 2>/dev/null)

    # Verificar que encontramos el secreto
    if [ -z "$SECRET_ARN" ]; then
        echo -e "${RED}❌ ERROR: No se pudo obtener el Secret ARN${NC}"
        echo -e "${YELLOW}💡 SOLUCIÓN: Verifica que el stack esté desplegado correctamente: make status${NC}"
        exit 1
    fi

    # ===== PASO 3: OBTENER LAS CREDENCIALES =====
    # El secreto está en formato JSON con la estructura:
    # {
    #   "host": "xxx.rds.amazonaws.com",
    #   "username": "postgres",
    #   "password": "abc123...",
    #   "dbname": "postgres"
    # }

    SECRET_JSON=$(aws secretsmanager get-secret-value \
        --secret-id "$SECRET_ARN" \
        --region $AWS_REGION \
        --query 'SecretString' \
        --output text)

    # ===== PASO 4: EXTRAER VALORES DEL JSON =====
    # Usamos 'jq' (JSON query) para extraer cada valor del JSON

    DB_ENDPOINT=$(echo "$SECRET_JSON" | jq -r '.host')      # Dirección del servidor PostgreSQL
    DB_USER=$(echo "$SECRET_JSON" | jq -r '.username')      # Usuario de la base de datos
    DB_PASSWORD=$(echo "$SECRET_JSON" | jq -r '.password')   # Contraseña de la base de datos

    # ===== CONFIRMACIÓN =====
    echo -e "${GREEN}✅ Credenciales obtenidas exitosamente${NC}"
    echo -e "${BLUE}   📍 Servidor: $DB_ENDPOINT${NC}"
    echo -e "${BLUE}   👤 Usuario: $DB_USER${NC}"
    echo -e "${BLUE}   🗄️  Base de datos: $DB_NAME${NC}"
    echo ""
}

# ============================================
# FUNCIÓN: execute_query()
# ============================================
# 📋 PROPÓSITO:
#    Ejecuta una consulta SQL directamente en PostgreSQL desde tu máquina local
#    y muestra el resultado en tu terminal.
#
# 🔄 FLUJO:
#    1. Ejecuta psql localmente con las credenciales obtenidas
#    2. Conecta directamente a la base de datos RDS (públicamente accesible)
#    3. Muestra el resultado en la terminal
#
# 📥 PARÁMETROS:
#    $1 (query): La consulta SQL a ejecutar (ej: "SELECT * FROM users LIMIT 5;")
#    $2 (description): Descripción de lo que hace la consulta (ej: "Listando usuarios")
#
# 📤 EJEMPLO DE USO:
#    execute_query "SELECT COUNT(*) FROM users;" "Contando usuarios"
#
# 🔍 QUÉ HACE INTERNAMENTE:
#    PGPASSWORD='xxx' psql -h xxx.rds.amazonaws.com -U postgres -d postgres -c "SELECT COUNT(*) FROM users;"
#
# ❌ ERRORES POSIBLES:
#    - Error de conexión si las credenciales son incorrectas
#    - Error de sintaxis SQL si la query está mal escrita
#    - Timeout si la consulta tarda mucho
# ============================================
execute_query() {
    local query="$1"        # La consulta SQL que quieres ejecutar
    local description="$2"  # Una descripción amigable de lo que hace

    echo -e "${BLUE}📊 $description${NC}"

    # ===== PASO 1: EJECUTAR CONSULTA DIRECTAMENTE =====
    # Conectamos directamente a la base de datos RDS usando psql local
    # La base de datos es públicamente accesible para desarrollo

    PGPASSWORD="$DB_PASSWORD" psql \
        -h "$DB_ENDPOINT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        -c "$query"

    # ===== PASO 2: VERIFICAR SI HUBO ERROR =====
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Error ejecutando la consulta SQL${NC}"
        echo -e "${YELLOW}💡 Verifica la sintaxis de la query o el estado de la base de datos${NC}"
        return 1
    fi

    echo ""  # Línea en blanco para separar visualmente
}

# ============================================
# FUNCIÓN PRINCIPAL: main()
# ============================================
# 📋 PROPÓSITO:
#    Es el "menú principal" del script. Decide qué hacer basado en
#    el primer argumento que le pases al script.
#
# 🔄 FLUJO:
#    ./psql-commands.sh list-tables
#                       ↑
#                    Este argumento ($1) determina qué comando ejecutar
#
# 📚 COMANDOS DISPONIBLES:
#    Ver la sección "help" más abajo para la lista completa
# ============================================
main() {
    case "$1" in
        # ========================================
        # COMANDO: list-tables
        # ========================================
        # 🎯 PROPÓSITO: Mostrar todas las tablas que existen en la base de datos
        # 
        # 📖 CUÁNDO USARLO:
        #    - Después de ejecutar migraciones para verificar que se crearon las tablas
        #    - Para ver qué tablas tienes disponibles
        #
        # 💻 EJEMPLO DE USO:
        #    ./psql-commands.sh list-tables
        #
        # 📤 SALIDA ESPERADA:
        #                 List of relations
        #  Schema |         Name          | Type  |  Owner   
        # --------+-----------------------+-------+----------
        #  public | migrations            | table | postgres
        #  public | users                 | table | postgres
        # (2 rows)
        #
        # 🔍 QUÉ EJECUTA INTERNAMENTE:
        #    \dt (comando interno de PostgreSQL para "describe tables")
        # ========================================
        "list-tables")
            get_credentials
            execute_query "\\dt" "Listando todas las tablas de la base de datos"
            ;;

        # ========================================
        # COMANDO: table-structure
        # ========================================
        # 🎯 PROPÓSITO: Mostrar la estructura completa de una tabla específica
        #              (columnas, tipos de datos, constraints, índices)
        # 
        # 📖 CUÁNDO USARLO:
        #    - Para ver qué columnas tiene una tabla
        #    - Para verificar los tipos de datos
        #    - Para ver qué constraints existen (NOT NULL, UNIQUE, etc.)
        #
        # 💻 EJEMPLO DE USO:
        #    ./psql-commands.sh table-structure users
        #
        # 📤 SALIDA ESPERADA:
        #                                         Table "public.users"
        #      Column      |           Type           | Collation | Nullable |              Default              
        # -----------------+--------------------------+-----------+----------+-----------------------------------
        #  id              | bigint                   |           | not null | nextval('users_id_seq'::regclass)
        #  cognito_user_id | character varying(255)   |           | not null | 
        #  email           | citext                   |           | not null | 
        #  ...
        #
        # 🔍 QUÉ EJECUTA INTERNAMENTE:
        #    \d users (comando interno de PostgreSQL para "describe table")
        # ========================================
        "table-structure")
            if [ -z "$2" ]; then
                echo -e "${RED}❌ ERROR: Falta el nombre de la tabla${NC}"
                echo -e "${YELLOW}💡 USO CORRECTO: $0 table-structure <nombre_tabla>${NC}"
                echo -e "${YELLOW}   EJEMPLO: $0 table-structure users${NC}"
                exit 1
            fi
            get_credentials
            execute_query "\\d $2" "Mostrando estructura de la tabla '$2'"
            ;;

        # ========================================
        # COMANDO: count-records
        # ========================================
        # 🎯 PROPÓSITO: Contar cuántos registros (filas) hay en una tabla
        # 
        # 📖 CUÁNDO USARLO:
        #    - Para saber si una tabla tiene datos o está vacía
        #    - Para verificar cuántos usuarios hay en total
        #    - Para debugging rápido
        #
        # 💻 EJEMPLO DE USO:
        #    ./psql-commands.sh count-records users
        #
        # 📤 SALIDA ESPERADA:
        #  count 
        # -------
        #      4
        # (1 row)
        #
        # 🔍 QUÉ EJECUTA INTERNAMENTE:
        #    SELECT COUNT(*) FROM users;
        # ========================================
        "count-records")
            if [ -z "$2" ]; then
                echo -e "${RED}❌ ERROR: Falta el nombre de la tabla${NC}"
                echo -e "${YELLOW}💡 USO CORRECTO: $0 count-records <nombre_tabla>${NC}"
                echo -e "${YELLOW}   EJEMPLO: $0 count-records users${NC}"
                exit 1
            fi
            get_credentials
            execute_query "SELECT COUNT(*) FROM $2;" "Contando registros en la tabla '$2'"
            ;;

        # ========================================
        # COMANDO: view-data
        # ========================================
        # 🎯 PROPÓSITO: Ver los primeros N registros de una tabla
        # 
        # 📖 CUÁNDO USARLO:
        #    - Para ver qué datos hay en una tabla
        #    - Para verificar que los datos se guardaron correctamente
        #    - Para explorar el contenido de una tabla
        #
        # 💻 EJEMPLO DE USO:
        #    ./psql-commands.sh view-data users 10    # Ver primeros 10 usuarios
        #    ./psql-commands.sh view-data users       # Ver primeros 10 (default)
        #
        # 📤 SALIDA ESPERADA:
        #  id | cognito_user_id |          email          | user_type | verified |         created_at         
        # ----+-----------------+-------------------------+-----------+----------+----------------------------
        #   1 | abc123          | ana@outlook.com         | BUYER     | f        | 2025-10-27 12:05:30.456789
        #   2 | def456          | pedro@hotmail.com       | BUYER     | f        | 2025-10-27 13:15:45.987654
        #   ...
        #
        # 🔍 QUÉ EJECUTA INTERNAMENTE:
        #    SELECT * FROM users LIMIT 10;
        # ========================================
        "view-data")
            if [ -z "$2" ]; then
                echo -e "${RED}❌ ERROR: Falta el nombre de la tabla${NC}"
                echo -e "${YELLOW}💡 USO CORRECTO: $0 view-data <nombre_tabla> [limite]${NC}"
                echo -e "${YELLOW}   EJEMPLO: $0 view-data users 20${NC}"
                exit 1
            fi
            local limit=${3:-10}  # Si no se especifica límite, usar 10 por defecto
            get_credentials
            execute_query "SELECT * FROM $2 LIMIT $limit;" "Mostrando primeros $limit registros de '$2'"
            ;;

        # ========================================
        # COMANDO: find-by-id
        # ========================================
        # 🎯 PROPÓSITO: Buscar un registro específico por su ID
        # 
        # 📖 CUÁNDO USARLO:
        #    - Para ver todos los datos de un usuario específico
        #    - Para debugging cuando tienes el ID de un registro
        #    - Para verificar que un registro existe
        #
        # 💻 EJEMPLO DE USO:
        #    ./psql-commands.sh find-by-id users 5
        #
        # 📤 SALIDA ESPERADA:
        #  id | cognito_user_id |       email       | phone | first_name | last_name | user_type | verified 
        # ----+-----------------+-------------------+-------+------------+-----------+-----------+----------
        #   5 | xyz789          | test@example.com  | +5491 | Test       | User      | BUYER     | f
        # (1 row)
        #
        # 🔍 QUÉ EJECUTA INTERNAMENTE:
        #    SELECT * FROM users WHERE id = '5';
        # ========================================
        "find-by-id")
            if [ -z "$2" ] || [ -z "$3" ]; then
                echo -e "${RED}❌ ERROR: Faltan parámetros${NC}"
                echo -e "${YELLOW}💡 USO CORRECTO: $0 find-by-id <tabla> <id>${NC}"
                echo -e "${YELLOW}   EJEMPLO: $0 find-by-id users 5${NC}"
                exit 1
            fi
            get_credentials
            execute_query "SELECT * FROM $2 WHERE id = '$3';" "Buscando registro con ID '$3' en tabla '$2'"
            ;;

        # ========================================
        # COMANDO: users-summary
        # ========================================
        # 🎯 PROPÓSITO: Obtener estadísticas completas de la tabla users
        # 
        # 📖 CUÁNDO USARLO:
        #    - Para obtener un overview rápido de todos los usuarios
        #    - Para ver cuántos BUYER vs SELLER hay
        #    - Para ver cuántos usuarios están verificados
        #    - Para reportes o debugging general
        #
        # 💻 EJEMPLO DE USO:
        #    ./psql-commands.sh users-summary
        #
        # 📤 SALIDA ESPERADA:
        #  📊 Usuarios por tipo (BUYER/SELLER)
        #  user_type | total 
        # -----------+-------
        #  BUYER     |     3
        #  SELLER    |     1
        #
        #  📊 Usuarios verificados vs no verificados
        #  verified | total 
        # ----------+-------
        #  f        |     3
        #  t        |     1
        #
        #  📊 Total de usuarios
        #  total_users 
        # -------------
        #            4
        #
        # 🔍 QUÉ EJECUTA INTERNAMENTE:
        #    1. SELECT user_type, COUNT(*) FROM users GROUP BY user_type;
        #    2. SELECT verified, COUNT(*) FROM users GROUP BY verified;
        #    3. SELECT COUNT(*) FROM users;
        # ========================================
        "users-summary")
            get_credentials
            echo -e "${BLUE}📊 Resumen completo de usuarios:${NC}"
            echo ""
            execute_query "SELECT user_type, COUNT(*) as total FROM users GROUP BY user_type;" "Usuarios por tipo (BUYER/SELLER)"
            execute_query "SELECT verified, COUNT(*) as total FROM users GROUP BY verified;" "Usuarios verificados (true) vs no verificados (false)"
            execute_query "SELECT COUNT(*) as total_users FROM users;" "Total de usuarios en el sistema"
            ;;

        # ========================================
        # COMANDO: recent-users
        # ========================================
        # 🎯 PROPÓSITO: Ver los últimos N usuarios registrados
        # 
        # 📖 CUÁNDO USARLO:
        #    - Para ver la actividad reciente
        #    - Para verificar que los nuevos registros funcionan
        #    - Para debugging de usuarios recién creados
        #
        # 💻 EJEMPLO DE USO:
        #    ./psql-commands.sh recent-users 10   # Últimos 10 usuarios
        #    ./psql-commands.sh recent-users      # Últimos 5 (default)
        #
        # 📤 SALIDA ESPERADA:
        #  id | cognito_user_id |          email          | first_name | last_name | user_type | verified |         created_at
        # ----+-----------------+-------------------------+------------+-----------+-----------+----------+----------------------------
        #   4 | abc123def456    | maria@example.com       | Maria      | Garcia    | BUYER     | f        | 2025-10-27 15:30:22.123456
        #   3 | xyz789ghi012    | juan@gmail.com          | Juan       | Lopez     | SELLER    | t        | 2025-10-27 14:20:10.654321
        #   ...
        #
        # 🔍 QUÉ EJECUTA INTERNAMENTE:
        #    SELECT id, cognito_user_id, email, first_name, last_name, user_type, verified, created_at
        #    FROM users
        #    ORDER BY created_at DESC
        #    LIMIT 5;
        # ========================================
        "recent-users")
            local limit=${2:-5}  # Si no se especifica límite, usar 5 por defecto
            get_credentials
            execute_query "SELECT id, cognito_user_id, email, first_name, last_name, user_type, verified, created_at FROM users ORDER BY created_at DESC LIMIT $limit;" "Últimos $limit usuarios registrados (más recientes primero)"
            ;;

        # ========================================
        # COMANDO: search-email
        # ========================================
        # 🎯 PROPÓSITO: Buscar usuarios por patrón de email
        # 
        # 📖 CUÁNDO USARLO:
        #    - Para encontrar todos los usuarios de un dominio (ej: gmail)
        #    - Para buscar un usuario cuando no recuerdas el email completo
        #    - Para debugging cuando un usuario reporta problemas
        #
        # 💻 EJEMPLO DE USO:
        #    ./psql-commands.sh search-email gmail      # Todos los emails con "gmail"
        #    ./psql-commands.sh search-email test       # Todos los emails con "test"
        #    ./psql-commands.sh search-email @outlook   # Todos los emails de Outlook
        #
        # 📤 SALIDA ESPERADA:
        #  id |      email      | user_type | verified 
        # ----+-----------------+-----------+----------
        #   3 | juan@gmail.com  | SELLER    | t
        #   7 | ana@gmail.com   | BUYER     | f
        # (2 rows)
        #
        # 🔍 QUÉ EJECUTA INTERNAMENTE:
        #    SELECT id, email, user_type, verified 
        #    FROM users 
        #    WHERE email ILIKE '%gmail%';
        #    (ILIKE = case-insensitive LIKE)
        # ========================================
        "search-email")
            if [ -z "$2" ]; then
                echo -e "${RED}❌ ERROR: Falta el patrón de búsqueda${NC}"
                echo -e "${YELLOW}💡 USO CORRECTO: $0 search-email <patron>${NC}"
                echo -e "${YELLOW}   EJEMPLO: $0 search-email gmail${NC}"
                echo -e "${YELLOW}   EJEMPLO: $0 search-email test${NC}"
                exit 1
            fi
            get_credentials
            execute_query "SELECT id, email, user_type, verified FROM users WHERE email ILIKE '%$2%';" "Buscando usuarios con email que contiene '$2'"
            ;;

        # ========================================
        # COMANDO: db-info
        # ========================================
        # 🎯 PROPÓSITO: Mostrar información general del sistema de base de datos
        # 
        # 📖 CUÁNDO USARLO:
        #    - Para verificar la versión de PostgreSQL
        #    - Para confirmar a qué base de datos estás conectado
        #    - Para ver qué usuario está conectado
        #    - Para debugging general del sistema
        #
        # 💻 EJEMPLO DE USO:
        #    ./psql-commands.sh db-info
        #
        # 📤 SALIDA ESPERADA:
        #  📊 Versión de PostgreSQL
        #   PostgreSQL 15.4 on x86_64-pc-linux-gnu...
        #
        #  📊 Base de datos actual
        #   evilent_users
        #
        #  📊 Usuario actual
        #   postgres
        #
        #  📊 Tablas disponibles
        #   migrations
        #   users
        #
        # 🔍 QUÉ EJECUTA INTERNAMENTE:
        #    1. SELECT version();
        #    2. SELECT current_database();
        #    3. SELECT current_user;
        #    4. \dt
        # ========================================
        "db-info")
            get_credentials
            echo -e "${BLUE}ℹ️  Información del sistema de base de datos:${NC}"
            echo ""
            execute_query "SELECT version();" "Versión de PostgreSQL"
            execute_query "SELECT current_database();" "Base de datos actual"
            execute_query "SELECT current_user;" "Usuario conectado"
            execute_query "\\dt" "Tablas disponibles"
            ;;

        # ========================================
        # COMANDO: backup-table
        # ========================================
        # 🎯 PROPÓSITO: Crear un backup (respaldo) de una tabla completa
        # 
        # 📖 CUÁNDO USARLO:
        #    - Antes de hacer cambios importantes (UPDATE, DELETE)
        #    - Para exportar datos
        #    - Para tener un respaldo de seguridad
        #
        # 💻 EJEMPLO DE USO:
        #    ./psql-commands.sh backup-table users
        #
        # 📤 SALIDA ESPERADA:
        #  💾 Creando backup de tabla 'users'...
        #  Backup creado: /tmp/users_backup_20251027_153022.sql
        #  -rw-r--r-- 1 ssm-user ssm-user 4523 Oct 27 15:30 /tmp/users_backup_20251027_153022.sql
        #
        # 🔍 QUÉ EJECUTA INTERNAMENTE:
        #    pg_dump -h $DB_ENDPOINT -U $DB_USER -d $DB_NAME -t users > /tmp/users_backup_TIMESTAMP.sql
        #
        # 📝 NOTA: El backup se crea en el Bastion Host, no en tu computadora
        # ========================================
        "backup-table")
            if [ -z "$2" ]; then
                echo -e "${RED}❌ ERROR: Falta el nombre de la tabla${NC}"
                echo -e "${YELLOW}💡 USO CORRECTO: $0 backup-table <nombre_tabla>${NC}"
                echo -e "${YELLOW}   EJEMPLO: $0 backup-table users${NC}"
                exit 1
            fi
            get_credentials
            local timestamp=$(date +%Y%m%d_%H%M%S)
            local backup_file="${2}_backup_${timestamp}.sql"

            echo -e "${BLUE}💾 Creando backup de tabla '$2'...${NC}"

            # Crear el backup directamente usando pg_dump local
            PGPASSWORD="$DB_PASSWORD" pg_dump \
                -h "$DB_ENDPOINT" \
                -U "$DB_USER" \
                -d "$DB_NAME" \
                -t "$2" \
                --no-owner \
                --no-privileges \
                --clean \
                --if-exists \
                > "$backup_file"

            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ Backup creado exitosamente${NC}"
                ls -lh "$backup_file"
                echo ""
                echo -e "${YELLOW}📝 NOTA: El backup está guardado en tu máquina local: $backup_file${NC}"
                echo -e "${YELLOW}💡 Para restaurar: PGPASSWORD='$DB_PASSWORD' psql -h $DB_ENDPOINT -U $DB_USER -d $DB_NAME < $backup_file${NC}"
            else
                echo -e "${RED}❌ Error creando el backup${NC}"
                rm -f "$backup_file" 2>/dev/null
                exit 1
            fi
            ;;

        # ========================================
        # COMANDO: interactive
        # ========================================
        # 🎯 PROPÓSITO: Conectar interactivamente a PostgreSQL
        #
        # 💻 EJEMPLO DE USO:
        #    ./psql-commands.sh interactive
        #
        # 🔍 QUÉ HACE INTERNAMENTE:
        #    PGPASSWORD='xxx' psql -h xxx.rds.amazonaws.com -U postgres -d postgres
        # ========================================
        "interactive")
            get_credentials
            echo -e "${BLUE}🔗 Conectando interactivamente a PostgreSQL...${NC}"
            echo -e "${YELLOW}💡 Presiona Ctrl+D para salir${NC}"
            echo ""

            PGPASSWORD="$DB_PASSWORD" psql \
                -h "$DB_ENDPOINT" \
                -U "$DB_USER" \
                -d "$DB_NAME"

            echo ""
            echo -e "${GREEN}✅ Sesión interactiva terminada${NC}"
            ;;

        # ========================================
        # COMANDO: help (o cualquier otro comando no reconocido)
        # ========================================
        # 🎯 PROPÓSITO: Mostrar la ayuda completa con todos los comandos disponibles
        # 
        # 💻 EJEMPLO DE USO:
        #    ./psql-commands.sh help
        #    ./psql-commands.sh
        #    ./psql-commands.sh cualquier-cosa-no-reconocida
        # ========================================
        "help"|*)
            echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
            echo -e "${GREEN}║  🐘 COMANDOS AUTOMATIZADOS PARA POSTGRESQL               ║${NC}"
            echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
            echo ""
            echo -e "${YELLOW}📖 USO: $0 <comando> [parametros]${NC}"
            echo ""
            echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
            echo -e "${YELLOW}📋 COMANDOS BÁSICOS DE EXPLORACIÓN:${NC}"
            echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
            echo ""
            echo "  list-tables"
            echo "    └─ Listar todas las tablas de la base de datos"
            echo "    └─ Ejemplo: $0 list-tables"
            echo ""
            echo "  table-structure <tabla>"
            echo "    └─ Ver estructura completa de una tabla (columnas, tipos, constraints)"
            echo "    └─ Ejemplo: $0 table-structure users"
            echo ""
            echo "  count-records <tabla>"
            echo "    └─ Contar cuántos registros hay en una tabla"
            echo "    └─ Ejemplo: $0 count-records users"
            echo ""
            echo "  view-data <tabla> [limite]"
            echo "    └─ Ver los primeros N registros de una tabla (default: 10)"
            echo "    └─ Ejemplo: $0 view-data users 20"
            echo ""
            echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
            echo -e "${YELLOW}🔍 COMANDOS DE BÚSQUEDA:${NC}"
            echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
            echo ""
            echo "  find-by-id <tabla> <id>"
            echo "    └─ Buscar un registro específico por su ID"
            echo "    └─ Ejemplo: $0 find-by-id users 5"
            echo ""
            echo "  search-email <patron>"
            echo "    └─ Buscar usuarios por patrón de email"
            echo "    └─ Ejemplo: $0 search-email gmail"
            echo "    └─ Ejemplo: $0 search-email test"
            echo ""
            echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
            echo -e "${YELLOW}📊 COMANDOS DE ESTADÍSTICAS (específicos para users):${NC}"
            echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
            echo ""
            echo "  users-summary"
            echo "    └─ Resumen completo de usuarios (tipos, verificados, total)"
            echo "    └─ Ejemplo: $0 users-summary"
            echo ""
            echo "  recent-users [limite]"
            echo "    └─ Ver los últimos N usuarios registrados (default: 5)"
            echo "    └─ Ejemplo: $0 recent-users 10"
            echo ""
            echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
            echo -e "${YELLOW}🛠️  COMANDOS DE SISTEMA:${NC}"
            echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
            echo ""
            echo "  db-info"
            echo "    └─ Información del sistema (versión, base de datos, usuario, tablas)"
            echo "    └─ Ejemplo: $0 db-info"
            echo ""
            echo "  backup-table <tabla>"
            echo "    └─ Crear backup de una tabla (se guarda localmente)"
            echo "    └─ Ejemplo: $0 backup-table users"
            echo ""
            echo "  interactive"
            echo "    └─ Conectar interactivamente a PostgreSQL"
            echo "    └─ Ejemplo: $0 interactive"
            echo ""
            echo "  help"
            echo "    └─ Mostrar esta ayuda"
            echo "    └─ Ejemplo: $0 help"
            echo ""
            echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
            echo -e "${YELLOW}💡 EJEMPLOS DE USO REAL:${NC}"
            echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
            echo ""
            echo -e "${GREEN}# Verificar que las migraciones funcionaron:${NC}"
            echo "  $0 list-tables"
            echo "  $0 table-structure users"
            echo ""
            echo -e "${GREEN}# Ver cuántos usuarios hay:${NC}"
            echo "  $0 count-records users"
            echo "  $0 users-summary"
            echo ""
            echo -e "${GREEN}# Buscar un usuario específico:${NC}"
            echo "  $0 search-email juan@gmail.com"
            echo "  $0 find-by-id users 5"
            echo ""
            echo -e "${GREEN}# Ver actividad reciente:${NC}"
            echo "  $0 recent-users 10"
            echo "  $0 view-data users 20"
            echo ""
            echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
            echo -e "${YELLOW}🔗 PARA CONEXIÓN INTERACTIVA COMPLETA:${NC}"
            echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
            echo ""
            echo "  ./psql-commands.sh interactive"
            echo "    └─ Conectar directamente a PostgreSQL interactivamente"
            echo "    └─ Útil para: Múltiples queries, UPDATE, DELETE, exploración libre"
            echo ""
            echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
            echo ""
            ;;
    esac
}

# ============================================
# PUNTO DE ENTRADA DEL SCRIPT
# ============================================
# Cuando ejecutas ./psql-commands.sh list-tables
# Bash llama a: main "list-tables"
# Y "$@" pasa todos los argumentos que recibió el script
# ============================================
main "$@"
