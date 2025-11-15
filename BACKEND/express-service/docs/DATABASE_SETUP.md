# 🗄️ DATABASE SETUP - PostgreSQL

**Guía completa para configurar y usar PostgreSQL en express-service**

---

## 📋 REQUISITOS PREVIOS

- Docker Desktop instalado y corriendo
- Node.js 18+
- `psql` CLI (PostgreSQL client) - [Descargar](https://www.postgresql.org/download/)

---

## 🚀 INICIO RÁPIDO

### 1️⃣ **Configurar Variables de Entorno**

```bash
cd /BACKEND/express-service

# Copiar archivo de ejemplo (si existe) o crear .env.local
cat > .env.local << 'EOF'
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=evilent_user
DB_PASSWORD=secure_password_change_in_prod
DB_NAME=express_service_db

# Database - Test
TEST_DB_HOST=localhost
TEST_DB_PORT=5432
TEST_DB_USER=evilent_user
TEST_DB_PASSWORD=secure_password_change_in_prod
TEST_DB_NAME=express_service_test_db

# JWT
JWT_SECRET=local_development_jwt_secret_change_in_prod
JWT_EXPIRE_IN=24h
REFRESH_TOKEN_SECRET=local_development_refresh_secret_change_in_prod
REFRESH_TOKEN_EXPIRE_IN=7d

# Other
CORS_ORIGIN=http://localhost:3000,http://localhost:8000
LOG_LEVEL=debug
EOF
```

⚠️ **IMPORTANTE:** `.env.local` está en `.gitignore` - NUNCA commitear credenciales reales

---

### 2️⃣ **Iniciar PostgreSQL con Docker**

```bash
# Crear y ejecutar containers
docker-compose up -d

# Verificar que está corriendo
docker-compose ps

# Ver logs
docker-compose logs postgres
```

**Salida esperada:**
```
✅ postgres running on port 5432
✅ adminer running on port 8080
```

---

### 3️⃣ **Verificar Conexión a la Base de Datos**

```bash
# Conectar con psql
psql -h localhost -U evilent_user -d express_service_db

# En el prompt de psql:
\dt                    # Listar todas las tablas (debe mostrar "users" y "refresh_tokens")
\l                     # Listar todas las bases de datos
SELECT version();      # Ver versión de PostgreSQL
\q                     # Salir

# O hacer query directamente
psql -h localhost -U evilent_user -d express_service_db -c "SELECT * FROM users;"
```

---

### 4️⃣ **Acceder a UI Web (Adminer)**

```
Abrir en navegador: http://localhost:8080

Login:
- System: PostgreSQL
- Server: postgres
- Username: evilent_user
- Password: secure_password_change_in_prod
- Database: express_service_db
```

---

## 🧪 **TESTING CON BASE DE DATOS**

### Crear Test Database

```bash
# Crear BD de test automáticamente
npm run test

# O crear manualmente
psql -h localhost -U evilent_user -d postgres -c \
  "CREATE DATABASE express_service_test_db;"
```

### Ejecutar Tests de Integración

```bash
# Con DB de test existente
NODE_ENV=test npm run test:integration

# Ver coverage
npm run test:integration -- --coverage
```

---

## 🔄 **OPERACIONES COMUNES**

### Resetear Base de Datos

```bash
# OPCIÓN 1: Eliminar y recrear container
docker-compose down -v
docker-compose up -d
# Esto ejecutará init.sql nuevamente

# OPCIÓN 2: Limpiar datos (mantener schema)
psql -h localhost -U evilent_user -d express_service_db -c \
  "DELETE FROM refresh_tokens; DELETE FROM users; DELETE FROM audit_logs;"

# OPCIÓN 3: Drop y recrear BD
psql -h localhost -U evilent_user -d postgres -c \
  "DROP DATABASE IF EXISTS express_service_db;"
psql -h localhost -U evilent_user -d postgres -c \
  "CREATE DATABASE express_service_db;"
# Luego ejecutar init.sql manualmente
```

### Ver Estructura de Tablas

```bash
# Descripcin de tabla users
psql -h localhost -U evilent_user -d express_service_db -c "\d users"

# Ver índices de una tabla
psql -h localhost -U evilent_user -d express_service_db -c "\di"

# Ver triggers
psql -h localhost -U evilent_user -d express_service_db -c "\dT"
```

### Datos de Ejemplo (Manual Insert)

```bash
psql -h localhost -U evilent_user -d express_service_db << 'EOF'
INSERT INTO users (email, password_hash, first_name, last_name)
VALUES (
  'test@example.com',
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/DJG', -- bcrypt hash
  'Test',
  'User'
);

SELECT * FROM users;
EOF
```

---

## 🛠️ **TROUBLESHOOTING**

### Error: "FATAL: remaining connection slots are reserved"

```bash
# Conexiones al pool están saturadas
# Solución 1: Reiniciar container
docker-compose restart postgres

# Solución 2: Reducir max connections en .env.local
# Y recrear container
```

### Error: "password authentication failed"

```bash
# Verificar credenciales en .env.local
# Deben coincidir con docker-compose.yml

# Resetear container
docker-compose down -v
docker-compose up -d
```

### Error: "database does not exist"

```bash
# Crear BD manualmente
psql -h localhost -U evilent_user -d postgres -c \
  "CREATE DATABASE express_service_db;"

# O reset completo
docker-compose down -v
docker-compose up -d
```

---

## 📊 **PERFORMANCE TIPS**

### Índices

```sql
-- Ver índices existentes
SELECT * FROM pg_indexes WHERE tablename = 'users';

-- Crear índice en email (queries frecuentes)
CREATE INDEX idx_users_email ON users(email);

-- Crear índice compuesto
CREATE INDEX idx_users_email_created_at ON users(email, created_at);
```

### Connection Pooling

Configurado en `src/db/connection.ts`:
- **Pool size:** 20 conexiones (5 en test)
- **Idle timeout:** 30 segundos
- **Connection timeout:** 2 segundos

---

## 🔐 **SEGURIDAD**

### Nunca Hardcodear Credenciales

✅ **CORRECTO:**
```typescript
const password = process.env.DB_PASSWORD;
```

❌ **INCORRECTO:**
```typescript
const password = "secure_password_change_in_prod";
```

### Usar SSL en Producción

```env
# .env.production
DB_SSL=require
DB_CA_CERT=/path/to/ca-cert.pem
```

---

## 📚 **ARQUITECTURA**

```
User Service                Connection.ts              PostgreSQL
    ↓                            ↓                          ↓
UserService.create() ----→ queryWithRetry() ----→ users table
                         (connection pooling)
                         (error handling)
                         (logging)
```

---

## 🎯 **PRÓXIMOS PASOS**

1. ✅ Setup PostgreSQL (COMPLETADO)
2. 👉 Crear UserRepository real (próxima actividad)
3. 👉 Migrations framework
4. 👉 Tests de integración con DB

---

**Última actualización:** 2024-11-15  
**Versión:** 1.0.0

