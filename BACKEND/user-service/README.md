# User Service - AWS CDK

Servicio de usuarios serverless con autenticación Cognito en AWS Lambda + API Gateway.

## 🚀 Setup Inicial (ejecutar en orden)

```bash
# 0️⃣ Desplegar políticas IAM (proyecto separado - una sola vez)
cd ../iam-policies
make install
make deploy
make apply-all
cd ../user-service

# 1️⃣ Instalar dependencias
make install

# 2️⃣ Desplegar servicio completo
make deploy COGNITO_POOL_ID=eu-central-1_xxx COGNITO_APP_CLIENT_ID=yyy
```

**Tiempo:** ~10-15 minutos primera vez (incluye RDS)

---

## 📊 Uso Diario

```bash
# Actualizar código
make update COGNITO_POOL_ID=xxx

# Ver logs
make logs

# Ver estado
make status

# Ver API URL y endpoints
make outputs

# Detener Bastion para ahorrar costos
make bastion-stop
```

---

## 📖 Documentación

**[GUIA_DEPLOY_AWS.md](./GUIA_DEPLOY_AWS.md)** - Todo lo que necesitas saber

---

## 🏗️ Lo Que Logramos

Con **~400 líneas de código TypeScript**:

```
✅ Lambda Function (serverless, auto-escalable)
✅ API Gateway (REST API con rate limiting)
✅ Cognito Authorizer (autenticación enterprise)
✅ IAM Roles (permisos automáticos)
✅ CloudWatch Logs (monitoreo en tiempo real)
```

**Costo:** $0-5/mes en desarrollo (free tier)

---

## 🖥️ Gestión de Bastion (ahorro de costos)

```bash
# Ver estado del Bastion
make bastion-status

# Detener Bastion (ahorra ~$6/mes)
make bastion-stop

# Iniciar cuando lo necesites
make bastion-start

# Conectar via SSM
make bastion-connect

# Acceso directo a PostgreSQL
make bastion-psql

# Ejecutar migraciones
make bastion-migrate
```

---

## 🗑️ Limpieza

```bash
# Eliminar solo el servicio (mantiene políticas IAM - RECOMENDADO)
make destroy

# Limpiar archivos compilados
make clean
```

### 💡 ¿Qué se elimina y qué se mantiene?

**`make destroy`** (Recomendado):
- ❌ Elimina: UserServiceStack (RDS, EC2, Lambda, API Gateway, VPC)
- ✅ Mantiene: IamPoliciesStack (políticas IAM en proyecto separado)
- ✅ Mantiene: Permisos del usuario desarrollador
- 💰 Ahorra: ~$18-27/mes (recursos con costo)
- 💰 Costo políticas: $0/mes (gratuitas)
- 🎯 **Uso típico**: Ciclo de desarrollo frecuente

**Para eliminar políticas IAM** (opcional):
```bash
cd ../iam-policies
make detach-all  # Primero detach del usuario
make destroy     # Luego eliminar stack
```

⚠️ **IMPORTANTE:** Las políticas IAM están en proyecto separado (`../iam-policies/`) y persisten independientemente del estado del servicio. Esto es intencional para:
- Acelerar redeploys (políticas ya existen)
- Compartir políticas entre servicios
- Costo $0/mes (políticas IAM son gratuitas)

---

## 🧪 Testing

```bash
# Obtener token desde Flutter
final token = session.userPoolTokensResult.value.idToken.raw;

# Probar API
curl -H "Authorization: Bearer $TOKEN" \
  https://tu-api-url.amazonaws.com/prod/user
```

---

## 📂 Estructura

```
user-service/
├── bin/user-service.ts          # Entry point CDK
├── lib/
│   ├── user-service-stack.ts    # Stack principal
│   ├── api-gateway-stack.ts     # API Gateway + Cognito
│   └── service-stack.ts         # Lambda
├── src/
│   ├── api/
│   │   ├── handlers/
│   │   │   └── user-handler.ts  # Main Lambda handler
│   │   ├── middleware/          # Auth, CORS, body parsing
│   │   └── routes/              # HTTP routing
│   ├── service/                 # Business logic
│   └── repository/              # Data access
└── package.json                 # "type": "module"
```

---

## 🔐 Permisos IAM

Los permisos IAM se gestionan en un **proyecto CDK separado** (`../iam-policies/`):

```bash
# 1. Desplegar políticas IAM (proyecto independiente)
cd ../iam-policies
make deploy

# 2. Aplicar permisos al usuario desarrollador
make apply-all  # Aplica todas las políticas
# O aplicar solo User Service:
make apply-user-service

# Esto crea políticas compartidas:
# - EvilentUserServiceDeveloperPolicy (User Service específico)
# - EvilentProductServiceDeveloperPolicy (Product Service específico)
# - EvilentSharedMonitoringPolicy (Monitoreo compartido)
```

**Permisos incluidos para User Service:**
- ✅ EC2 Start/Stop/Describe (instancias Bastion con tags)
- ✅ Secrets Manager (solo secretos `evilent/user-service/*`)
- ✅ CloudWatch Logs (logs de Lambda y SSM)
- ✅ CloudFormation (estado de stacks UserService*)

**¿Por qué proyecto separado?** 
- Ciclo de vida independiente (políticas persisten entre deploys/destroys)
- Costo $0/mes (políticas IAM son gratuitas)
- Compartidas entre múltiples servicios (User, Product, etc.)
- Least Privilege con conditions cuando es posible

---

## 💡 Comandos Útiles

```bash
# Ver ayuda completa con todos los comandos organizados
make help

# Ver logs en tiempo real
make logs-follow

# Ver diferencias antes de deployar
make diff

# Sintetizar template de CloudFormation
make synth
```

---

## 🎯 Endpoints

```
GET  /user  - Obtener perfil
POST /user  - Crear/actualizar perfil
```

Requieren header: `Authorization: Bearer TOKEN`

---

## 💡 Ventajas vs Local

```
✅ Cualquiera puede probarlo (con URL)
✅ Escala automáticamente (0 a millones)
✅ Deploy en 30 segundos
✅ Logs en tiempo real
✅ $0-5/mes en desarrollo
```

---

**Lee [GUIA_DEPLOY_AWS.md](./GUIA_DEPLOY_AWS.md) para más detalles** 📚
// Trigger: Force user-service workflow - Testing FASE 4
