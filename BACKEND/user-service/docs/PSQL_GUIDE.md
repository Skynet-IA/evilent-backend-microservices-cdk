# 🐘 Guía Completa de PostgreSQL - Acceso a Base de Datos

## 📖 Índice

1. [¿Qué problema resuelve este sistema?](#-qué-problema-resuelve-este-sistema)
2. [Arquitectura: ¿Cómo funciona?](#-arquitectura-cómo-funciona)
3. [Método 1: Comandos Automatizados (Recomendado para principiantes)](#-método-1-comandos-automatizados-recomendado-para-principiantes)
4. [Método 2: Conexión Interactiva (Para usuarios avanzados)](#-método-2-conexión-interactiva-para-usuarios-avanzados)
5. [Ejemplos Reales Paso a Paso](#-ejemplos-reales-paso-a-paso)
6. [Troubleshooting](#-troubleshooting)

---

## 🤔 ¿Qué problema resuelve este sistema?

### El Problema

Cuando ejecutas `make bastion-migrate`, las migraciones se ejecutan automáticamente y crean la tabla `users` en PostgreSQL. Pero después de eso:

- ❓ **¿Cómo sé si la tabla se creó correctamente?**
- ❓ **¿Cómo veo qué usuarios hay en la base de datos?**
- ❓ **¿Cómo busco un usuario específico por email o ID?**
- ❓ **¿Cómo edito o elimino datos de prueba?**

### La Solución

Este sistema te da **DOS FORMAS** de acceder a tu base de datos PostgreSQL:

| Método | Cuándo Usarlo | Ventajas |
|--------|---------------|----------|
| **Comandos Automatizados** (`./psql-commands.sh`) | Consultas rápidas específicas | ✅ Rápido<br>✅ No requiere conocer SQL<br>✅ Un solo comando |
| **Conexión Interactiva** (`make bastion-psql`) | Exploración libre, edición compleja | ✅ Control total<br>✅ Múltiples queries<br>✅ Como usar pgAdmin |

---

## 🏗️ Arquitectura: ¿Cómo funciona?

### Diagrama del Sistema

```
┌─────────────────┐
│  Tu Computadora │
│   (Terminal)    │
└────────┬────────┘
         │
         │ 1. Ejecutas: ./psql-commands.sh list-tables
         │
         ▼
┌─────────────────────────┐
│  AWS CloudFormation     │
│  (Información del stack)│
└────────┬────────────────┘
         │
         │ 2. Obtiene: Instance ID del Bastion
         │            ARN del Secret
         │
         ▼
┌─────────────────────────┐
│  AWS Secrets Manager    │
│  (Credenciales seguras) │
└────────┬────────────────┘
         │
         │ 3. Obtiene: DB_ENDPOINT, DB_USER, DB_PASSWORD
         │
         ▼
┌─────────────────────────┐
│  Bastion Host (EC2)     │
│  - PostgreSQL client    │
│  - En red privada       │
└────────┬────────────────┘
         │
         │ 4. Ejecuta: psql -h $DB_ENDPOINT -U $DB_USER -c "SELECT * FROM users;"
         │
         ▼
┌─────────────────────────┐
│  PostgreSQL RDS         │
│  (Base de datos)        │
│  - Tabla: users         │
└─────────────────────────┘
```

### ¿Por qué es seguro?

- 🔐 **Credenciales nunca quedan en tu máquina** - Se obtienen dinámicamente de AWS Secrets Manager
- 🔒 **Bastion sin IP pública** - Solo accesible via AWS SSM (Systems Manager)
- 🔑 **Acceso basado en IAM** - Usa tus permisos de AWS
- 📝 **Auditoría completa** - Todos los comandos quedan registrados en CloudWatch Logs

---

## ❓ Preguntas Frecuentes ANTES de Empezar

### "¿Cómo obtengo la contraseña de la base de datos?"

**Respuesta corta:** NO necesitas obtenerla manualmente.

**Explicación:**
- ✅ Los comandos automatizados (`./psql-commands.sh`) la obtienen automáticamente
- ✅ El comando `make bastion-psql` te muestra el comando completo con la contraseña incluida
- ❌ NO necesitas ir a AWS Secrets Manager
- ❌ NO necesitas recordar ninguna contraseña

**Ejemplo:**
```bash
# Ejecutas esto:
make bastion-psql

# Te muestra esto (con la contraseña incluida):
PGPASSWORD='<YOUR_DB_PASSWORD>' psql -h '<YOUR_RDS_ENDPOINT>' -U 'postgres' -d 'evilent_users'

# Solo copias y pegas ese comando completo
```

### "¿La contraseña cambia cada deploy?"

**Sí**, pero no importa porque:
- Los scripts la obtienen automáticamente de AWS Secrets Manager
- Nunca necesitas escribirla manualmente
- El sistema siempre usa la contraseña actual

### "¿Cuál es la diferencia entre Shell y PostgreSQL?"

```
┌─────────────────────────────────────────────────────────┐
│ Shell del Bastion (sh-5.2$)                            │
│ - Es la terminal del servidor EC2                       │
│ - Aquí ejecutas comandos de Linux (ls, cd, exit, etc.) │
│ - NO puedes ejecutar SQL aquí                          │
└─────────────────────────────────────────────────────────┘
                        ↓
            Ejecutas: psql -h ... -U ... -d ...
                        ↓
┌─────────────────────────────────────────────────────────┐
│ PostgreSQL (evilent_users=#)                           │
│ - Es el cliente de base de datos                       │
│ - Aquí ejecutas SQL (SELECT, UPDATE, DELETE, etc.)     │
│ - Aquí ejecutas comandos de psql (\dt, \d, \q, etc.)   │
└─────────────────────────────────────────────────────────┘
```

**Ejemplo Visual del Flujo Completo:**

```bash
# 1. Tu computadora
$ make bastion-psql
🐘 Conectando al Bastion...
   Una vez dentro, ejecuta:
   PGPASSWORD='<YOUR_DB_PASSWORD>' psql -h '<YOUR_RDS_ENDPOINT>' -U 'postgres' -d 'evilent_users'
   ↑↑↑ COPIA ESTE COMANDO COMPLETO ↑↑↑

# 2. Shell del Bastion (después de conectar)
sh-5.2$ PGPASSWORD='<YOUR_DB_PASSWORD>' psql -h '<YOUR_RDS_ENDPOINT>' -U 'postgres' -d 'evilent_users'
        ↑↑↑ PEGA EL COMANDO AQUÍ ↑↑↑

# 3. PostgreSQL (después de ejecutar el comando anterior)
evilent_users=# SELECT * FROM users LIMIT 5;
                ↑↑↑ AHORA SÍ PUEDES EJECUTAR SQL ↑↑↑

# 4. Salir de PostgreSQL
evilent_users=# \q

# 5. Vuelves a la Shell del Bastion
sh-5.2$ exit

# 6. Vuelves a tu computadora
$
```

---

## 🚀 Método 1: Comandos Automatizados (Recomendado para principiantes)

### ¿Qué es `psql-commands.sh`?

Es un script que ejecuta consultas SQL específicas **sin necesidad de conectarte interactivamente**. Perfecto para:
- Ver rápidamente qué hay en la base de datos
- Buscar un usuario específico
- Obtener estadísticas
- Verificar que las migraciones funcionaron

### Comandos Disponibles

| Comando | Qué hace | Ejemplo |
|---------|----------|---------|
| `list-tables` | Muestra todas las tablas | `./psql-commands.sh list-tables` |
| `table-structure <tabla>` | Muestra columnas y tipos de datos | `./psql-commands.sh table-structure users` |
| `count-records <tabla>` | Cuenta cuántos registros hay | `./psql-commands.sh count-records users` |
| `view-data <tabla> [limite]` | Muestra los primeros N registros | `./psql-commands.sh view-data users 10` |
| `find-by-id <tabla> <id>` | Busca un registro por ID | `./psql-commands.sh find-by-id users 123` |
| `users-summary` | Estadísticas de usuarios | `./psql-commands.sh users-summary` |
| `recent-users [limite]` | Últimos usuarios registrados | `./psql-commands.sh recent-users 5` |
| `search-email <patron>` | Busca usuarios por email | `./psql-commands.sh search-email gmail` |
| `db-info` | Información del sistema | `./psql-commands.sh db-info` |
| `backup-table <tabla>` | Crea backup de una tabla | `./psql-commands.sh backup-table users` |

### Ejemplo Real 1: Verificar que las migraciones funcionaron

**Situación:** Acabas de ejecutar `make bastion-migrate` y quieres verificar que la tabla `users` se creó correctamente.

```bash
# Paso 1: Ver qué tablas existen
./psql-commands.sh list-tables
```

**Salida esperada:**
```
🔐 Obteniendo credenciales...
✅ Credenciales obtenidas
   📍 Servidor: <YOUR_RDS_ENDPOINT>
   👤 Usuario: postgres
📊 Listando todas las tablas

                List of relations
 Schema |         Name          | Type  |  Owner   
--------+-----------------------+-------+----------
 public | migrations            | table | postgres
 public | users                 | table | postgres
(2 rows)
```

**Interpretación:**
- ✅ La tabla `users` existe
- ✅ La tabla `migrations` existe (db-migrate la crea automáticamente)

```bash
# Paso 2: Ver la estructura de la tabla users
./psql-commands.sh table-structure users
```

**Salida esperada:**
```
📊 Estructura de la tabla 'users'

                                            Table "public.users"
     Column      |           Type           | Collation | Nullable |              Default              
-----------------+--------------------------+-----------+----------+-----------------------------------
 id              | bigint                   |           | not null | nextval('users_id_seq'::regclass)
 cognito_user_id | character varying(255)   |           | not null | 
 email           | citext                   |           | not null | 
 phone           | character varying(20)    |           |          | 
 first_name      | character varying(100)   |           |          | 
 last_name       | character varying(100)   |           |          | 
 profile_pic     | text                     |           |          | 
 user_type       | character varying(20)    |           | not null | 'BUYER'::character varying
 verified        | boolean                  |           | not null | false
 created_at      | timestamp with time zone |           | not null | now()
 updated_at      | timestamp with time zone |           | not null | now()
```

**Interpretación:**
- ✅ Todas las columnas están creadas correctamente
- ✅ Los tipos de datos son correctos
- ✅ Los valores por defecto están configurados

```bash
# Paso 3: Contar cuántos usuarios hay (probablemente 0 al inicio)
./psql-commands.sh count-records users
```

**Salida esperada:**
```
📊 Contando registros en 'users'

 count 
-------
     0
(1 row)
```

**Interpretación:**
- ✅ La tabla está vacía (normal después de las migraciones)

### Ejemplo Real 2: Después de que un usuario se registre en la app

**Situación:** Un usuario se registró en tu app Flutter. Quieres verificar que se guardó correctamente en la base de datos.

```bash
# Paso 1: Ver resumen de usuarios
./psql-commands.sh users-summary
```

**Salida esperada:**
```
📊 Resumen de usuarios:
📊 Usuarios por tipo (BUYER/SELLER)

 user_type | total 
-----------+-------
 BUYER     |     3
 SELLER    |     1
(2 rows)

📊 Usuarios verificados (true) vs no verificados (false)

 verified | total 
----------+-------
 f        |     3
 t        |     1
(2 rows)

📊 Total de usuarios en el sistema

 total_users 
-------------
           4
(1 row)
```

**Interpretación:**
- ✅ Hay 4 usuarios en total
- ✅ 3 son BUYER, 1 es SELLER
- ✅ 1 usuario está verificado, 3 no

```bash
# Paso 2: Ver los últimos 5 usuarios registrados
./psql-commands.sh recent-users 5
```

**Salida esperada:**
```
📊 Últimos 5 usuarios registrados

 id |          email          | user_type | verified |         created_at         
----+-------------------------+-----------+----------+----------------------------
  4 | maria@example.com       | BUYER     | f        | 2025-10-27 15:30:22.123456
  3 | juan@gmail.com          | SELLER    | t        | 2025-10-27 14:20:10.654321
  2 | pedro@hotmail.com       | BUYER     | f        | 2025-10-27 13:15:45.987654
  1 | ana@outlook.com         | BUYER     | f        | 2025-10-27 12:05:30.456789
(4 rows)
```

**Interpretación:**
- ✅ El usuario más reciente es maria@example.com (ID: 4)
- ✅ Se registró a las 15:30
- ✅ Es tipo BUYER y no está verificado

```bash
# Paso 3: Buscar un usuario específico por email
./psql-commands.sh search-email gmail
```

**Salida esperada:**
```
📊 Usuarios con email que contiene 'gmail'

 id |      email      | user_type | verified 
----+-----------------+-----------+----------
  3 | juan@gmail.com  | SELLER    | t
(1 row)
```

**Interpretación:**
- ✅ Encontró 1 usuario con "gmail" en el email
- ✅ Es juan@gmail.com con ID 3

```bash
# Paso 4: Ver datos completos de un usuario específico por ID
./psql-commands.sh find-by-id users 3
```

**Salida esperada:**
```
📊 Buscando registro con ID '3' en 'users'

 id | cognito_user_id |      email      | phone | first_name | last_name | profile_pic | user_type | verified |         created_at         |         updated_at         
----+-----------------+-----------------+-------+------------+-----------+-------------+-----------+----------+----------------------------+----------------------------
  3 | abc123-def456   | juan@gmail.com  | +5491 | Juan       | Pérez     | https://... | SELLER    | t        | 2025-10-27 14:20:10.654321 | 2025-10-27 14:20:10.654321
(1 row)
```

**Interpretación:**
- ✅ Usuario completo con todos sus datos
- ✅ Tiene cognito_user_id: abc123-def456
- ✅ Tiene teléfono: +5491...
- ✅ Nombre completo: Juan Pérez

### Ejemplo Real 3: Debugging - Un usuario reporta que no puede iniciar sesión

**Situación:** Un usuario dice que se registró con el email "test@example.com" pero no puede iniciar sesión.

```bash
# Paso 1: Buscar el usuario por email
./psql-commands.sh search-email test@example
```

**Salida esperada (si existe):**
```
📊 Usuarios con email que contiene 'test@example'

 id |        email        | user_type | verified 
----+---------------------+-----------+----------
  5 | test@example.com    | BUYER     | f
(1 row)
```

**Interpretación:**
- ✅ El usuario existe en la base de datos
- ⚠️ **NO está verificado** (verified = f)
- 💡 **Problema identificado:** El usuario necesita verificar su email

```bash
# Paso 2: Ver todos los datos del usuario
./psql-commands.sh find-by-id users 5
```

**Salida esperada:**
```
 id | cognito_user_id |       email       | phone | first_name | last_name | profile_pic | user_type | verified |         created_at         
----+-----------------+-------------------+-------+------------+-----------+-------------+-----------+----------+----------------------------
  5 | xyz789-uvw012   | test@example.com  |       |            |           |             | BUYER     | f        | 2025-10-27 16:00:00.000000
(1 row)
```

**Interpretación:**
- ✅ Usuario registrado hace poco
- ⚠️ No tiene nombre, apellido ni teléfono (campos opcionales)
- ⚠️ No está verificado
- 💡 **Solución:** Reenviar email de verificación o verificarlo manualmente

---

## 🖥️ Método 2: Conexión Interactiva (Para usuarios avanzados)

### ¿Cuándo usar este método?

- ✅ Necesitas ejecutar múltiples consultas seguidas
- ✅ Quieres explorar la base de datos libremente
- ✅ Necesitas hacer cambios complejos (UPDATE, DELETE, INSERT)
- ✅ Quieres ejecutar queries personalizadas

### Diferencia CRÍTICA: Shell vs psql

**⚠️ IMPORTANTE:** Hay DOS niveles de conexión:

1. **Shell del Bastion** (`sh-5.2$`) - Es la terminal del servidor EC2
2. **PostgreSQL** (`evilent_users=#`) - Es el cliente de base de datos

```
Tu Computadora
    ↓
make bastion-psql
    ↓
Shell del Bastion (sh-5.2$)  ← Aquí NO puedes ejecutar SQL
    ↓
psql -h ... -U ... -d ...
    ↓
PostgreSQL (evilent_users=#)  ← Aquí SÍ puedes ejecutar SQL
```

### Ejemplo Real 4: Conexión Interactiva Completa

**Situación:** Quieres explorar la base de datos libremente y hacer varios cambios.

```bash
# Paso 1: Conectar al Bastion
make bastion-psql
```

**Salida esperada:**
```
🐘 Conectando a PostgreSQL via Bastion...
   Una vez conectado podrás:
   • Ver tablas: \dt
   • Ver estructura: \d tabla
   • Ver datos: SELECT * FROM tabla LIMIT 10;
   • Buscar por ID: SELECT * FROM users WHERE id = '123';
   • Editar: UPDATE users SET ... WHERE id = ...;
   • Salir: \q

📋 Instancia: i-07b745c1f949b8e05
✅ Credenciales obtenidas
🐘 Conectando al Bastion...
   Una vez dentro, ejecuta:
   PGPASSWORD='<YOUR_DB_PASSWORD>' psql -h '<YOUR_RDS_ENDPOINT>' -U 'postgres' -d 'evilent_users'
   Para salir: exit


Starting session with SessionId: skynet-developer-xxx
sh-5.2$ 
```

**⚠️ IMPORTANTE:** Ahora estás en la **Shell del Bastion** (sh-5.2$), NO en PostgreSQL todavía.

**💡 TRUCO:** El comando `make bastion-psql` ya te mostró el comando completo con la contraseña. Solo tienes que:
1. **Seleccionar** el comando que empieza con `PGPASSWORD=`
2. **Copiar** (Cmd+C o Ctrl+C)
3. **Pegar** en la terminal del Bastion (Cmd+V o Ctrl+V)
4. **Enter**

```bash
# Paso 2: Copiar y pegar el comando PGPASSWORD que te mostró arriba
# ⚠️ NO escribas la contraseña manualmente, cópiala del comando anterior
sh-5.2$ PGPASSWORD='<YOUR_DB_PASSWORD>' psql -h '<YOUR_RDS_ENDPOINT>' -U 'postgres' -d 'evilent_users'
```

**🔑 NOTA SOBRE LA CONTRASEÑA:**
- ❌ NO necesitas recordar la contraseña
- ❌ NO necesitas buscarla en AWS
- ✅ El comando `make bastion-psql` te la muestra automáticamente
- ✅ Solo copia y pega el comando completo

**Salida esperada:**
```
psql (15.4)
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, bits: 256, compression: off)
Type "help" for help.

evilent_users=# 
```

**✅ AHORA SÍ:** Estás dentro de PostgreSQL. El prompt cambió de `sh-5.2$` a `evilent_users=#`

```sql
-- Paso 3: Ejecutar comandos SQL
evilent_users=# \dt
```

**Salida esperada:**
```
                List of relations
 Schema |         Name          | Type  |  Owner   
--------+-----------------------+-------+----------
 public | migrations            | table | postgres
 public | users                 | table | postgres
(2 rows)
```

```sql
-- Ver estructura de la tabla users
evilent_users=# \d users
```

**Salida esperada:**
```
                                            Table "public.users"
     Column      |           Type           | Collation | Nullable |              Default              
-----------------+--------------------------+-----------+----------+-----------------------------------
 id              | bigint                   |           | not null | nextval('users_id_seq'::regclass)
 cognito_user_id | character varying(255)   |           | not null | 
 email           | citext                   |           | not null | 
 ...
```

```sql
-- Ver primeros 5 usuarios
evilent_users=# SELECT * FROM users LIMIT 5;
```

**Salida esperada:**
```
 id | cognito_user_id |          email          | user_type | verified |         created_at         
----+-----------------+-------------------------+-----------+----------+----------------------------
  1 | abc123          | ana@outlook.com         | BUYER     | f        | 2025-10-27 12:05:30.456789
  2 | def456          | pedro@hotmail.com       | BUYER     | f        | 2025-10-27 13:15:45.987654
  3 | ghi789          | juan@gmail.com          | SELLER    | t        | 2025-10-27 14:20:10.654321
  4 | jkl012          | maria@example.com       | BUYER     | f        | 2025-10-27 15:30:22.123456
  5 | mno345          | test@example.com        | BUYER     | f        | 2025-10-27 16:00:00.000000
(5 rows)
```

```sql
-- Buscar usuario específico
evilent_users=# SELECT * FROM users WHERE email = 'juan@gmail.com';
```

**Salida esperada:**
```
 id | cognito_user_id |      email      | phone | first_name | last_name | user_type | verified 
----+-----------------+-----------------+-------+------------+-----------+-----------+----------
  3 | ghi789          | juan@gmail.com  | +5491 | Juan       | Pérez     | SELLER    | t
(1 row)
```

```sql
-- Contar usuarios por tipo
evilent_users=# SELECT user_type, COUNT(*) as total FROM users GROUP BY user_type;
```

**Salida esperada:**
```
 user_type | total 
-----------+-------
 BUYER     |     4
 SELLER    |     1
(2 rows)
```

```sql
-- Salir de PostgreSQL
evilent_users=# \q
```

**Salida esperada:**
```
sh-5.2$ 
```

**✅ Volviste a la Shell del Bastion**

```bash
# Paso 4: Salir del Bastion
sh-5.2$ exit
```

**Salida esperada:**
```
Exiting session with sessionId: skynet-developer-xxx


Exited
```

**✅ Volviste a tu computadora**

### Ejemplo Real 5: Editar datos de un usuario

**Situación:** Necesitas verificar manualmente el email de un usuario de prueba.

```bash
# Paso 1: Conectar al Bastion
make bastion-psql
```

```bash
# Paso 2: Conectar a PostgreSQL (copiar comando que te muestra)
sh-5.2$ PGPASSWORD='...' psql -h '...' -U 'postgres' -d 'evilent_users'
```

```sql
-- Paso 3: Buscar el usuario
evilent_users=# SELECT id, email, verified FROM users WHERE email = 'test@example.com';
```

**Salida esperada:**
```
 id |       email        | verified 
----+--------------------+----------
  5 | test@example.com   | f
(1 row)
```

```sql
-- Paso 4: Verificar el usuario (cambiar verified a true)
evilent_users=# UPDATE users SET verified = true WHERE id = 5;
```

**Salida esperada:**
```
UPDATE 1
```

**Interpretación:** Se actualizó 1 fila

```sql
-- Paso 5: Verificar que el cambio se aplicó
evilent_users=# SELECT id, email, verified FROM users WHERE id = 5;
```

**Salida esperada:**
```
 id |       email        | verified 
----+--------------------+----------
  5 | test@example.com   | t
(1 row)
```

**✅ El usuario ahora está verificado**

```sql
-- Paso 6: Salir
evilent_users=# \q
sh-5.2$ exit
```

### Ejemplo Real 6: Eliminar usuarios de prueba

**Situación:** Creaste varios usuarios de prueba y quieres limpiar la base de datos.

```bash
# Conectar al Bastion y PostgreSQL
make bastion-psql
sh-5.2$ PGPASSWORD='...' psql -h '...' -U 'postgres' -d 'evilent_users'
```

```sql
-- Ver usuarios de prueba
evilent_users=# SELECT id, email FROM users WHERE email LIKE '%test%' OR email LIKE '%example%';
```

**Salida esperada:**
```
 id |       email        
----+--------------------
  5 | test@example.com
  8 | test2@example.com
 12 | testuser@gmail.com
(3 rows)
```

```sql
-- Eliminar usuarios de prueba
evilent_users=# DELETE FROM users WHERE email LIKE '%test%' OR email LIKE '%example%';
```

**Salida esperada:**
```
DELETE 3
```

**Interpretación:** Se eliminaron 3 usuarios

```sql
-- Verificar que se eliminaron
evilent_users=# SELECT COUNT(*) FROM users;
```

**Salida esperada:**
```
 count 
-------
     2
(1 row)
```

**✅ Solo quedan 2 usuarios (los reales)**

---

## 📊 Comandos SQL Útiles de Referencia

### Comandos de PostgreSQL (\comandos)

| Comando | Descripción | Ejemplo |
|---------|-------------|---------|
| `\dt` | Listar todas las tablas | `\dt` |
| `\d tabla` | Ver estructura de una tabla | `\d users` |
| `\dn` | Listar schemas | `\dn` |
| `\l` | Listar bases de datos | `\l` |
| `\du` | Listar usuarios de PostgreSQL | `\du` |
| `\q` | Salir de psql | `\q` |
| `\?` | Ver ayuda de comandos | `\?` |
| `\h SELECT` | Ayuda de un comando SQL | `\h SELECT` |

### Consultas SQL Comunes

```sql
-- CONTAR REGISTROS
SELECT COUNT(*) FROM users;

-- VER PRIMEROS N REGISTROS
SELECT * FROM users LIMIT 10;

-- BUSCAR POR ID
SELECT * FROM users WHERE id = 5;

-- BUSCAR POR EMAIL (exacto)
SELECT * FROM users WHERE email = 'juan@gmail.com';

-- BUSCAR POR EMAIL (contiene)
SELECT * FROM users WHERE email ILIKE '%gmail%';

-- USUARIOS MÁS RECIENTES
SELECT * FROM users ORDER BY created_at DESC LIMIT 5;

-- CONTAR POR TIPO
SELECT user_type, COUNT(*) as total 
FROM users 
GROUP BY user_type;

-- USUARIOS VERIFICADOS
SELECT * FROM users WHERE verified = true;

-- USUARIOS NO VERIFICADOS
SELECT * FROM users WHERE verified = false;

-- ACTUALIZAR USUARIO
UPDATE users 
SET verified = true, updated_at = NOW() 
WHERE id = 5;

-- ELIMINAR USUARIO
DELETE FROM users WHERE id = 5;

-- INSERTAR USUARIO (para pruebas)
INSERT INTO users (cognito_user_id, email, user_type, verified) 
VALUES ('test-123', 'test@example.com', 'BUYER', false);
```

---

## 🆘 Troubleshooting

### Error 1: "No se encontró instancia Bastion desplegada"

**Causa:** El stack no está desplegado o el Bastion no existe.

**Solución:**
```bash
# Verificar estado del stack
make bastion-status

# Si no existe, desplegar
make deploy COGNITO_POOL_ID=tu_pool_id
```

### Error 2: "database 'evilent_users' does not exist"

**Causa:** Las migraciones no se ejecutaron o fallaron.

**Solución:**
```bash
# Ejecutar migraciones
make bastion-migrate

# Verificar que funcionó
./psql-commands.sh list-tables
```

### Error 3: "psql: command not found" dentro del Bastion

**Causa:** PostgreSQL client no está instalado en el Bastion.

**Solución:**
```bash
# Conectar al bastion
make bastion-connect

# Ver logs de instalación
sudo cat /var/log/user-data.log | grep -i postgres

# Verificar si psql está instalado
which psql
psql --version
```

### Error 4: "SELECT: command not found" en el Bastion

**Causa:** Estás ejecutando comandos SQL en la **Shell del Bastion** en lugar de dentro de **PostgreSQL**.

**Problema:**
```bash
sh-5.2$ SELECT * FROM users;  # ❌ ERROR: Estás en la shell, no en psql
```

**Solución:**
```bash
# Primero conectar a PostgreSQL
sh-5.2$ PGPASSWORD='...' psql -h '...' -U 'postgres' -d 'evilent_users'

# Ahora sí ejecutar SQL
evilent_users=# SELECT * FROM users;  # ✅ FUNCIONA
```

### Error 5: Script psql-commands.sh no ejecuta

**Causa:** No tiene permisos de ejecución.

**Solución:**
```bash
chmod +x psql-commands.sh
./psql-commands.sh help
```

### Error 6: "Connection refused" o timeout

**Causa:** Problemas de red o Security Groups.

**Solución:**
```bash
# Verificar que el Bastion esté corriendo
make bastion-status

# Verificar conectividad desde el bastion
make bastion-connect
ping google.com

# Verificar que las credenciales sean correctas
./psql-commands.sh db-info
```

---

## 📝 Resumen: ¿Qué método usar?

| Situación | Método Recomendado | Comando |
|-----------|-------------------|---------|
| Verificar que las migraciones funcionaron | Comandos Automatizados | `./psql-commands.sh list-tables` |
| Ver cuántos usuarios hay | Comandos Automatizados | `./psql-commands.sh users-summary` |
| Buscar un usuario específico | Comandos Automatizados | `./psql-commands.sh search-email gmail` |
| Explorar la base de datos libremente | Conexión Interactiva | `make bastion-psql` |
| Hacer cambios complejos (UPDATE/DELETE) | Conexión Interactiva | `make bastion-psql` |
| Ejecutar múltiples queries seguidas | Conexión Interactiva | `make bastion-psql` |
| Debugging rápido | Comandos Automatizados | `./psql-commands.sh find-by-id users 5` |

---

**Última actualización:** 2025-10-27
