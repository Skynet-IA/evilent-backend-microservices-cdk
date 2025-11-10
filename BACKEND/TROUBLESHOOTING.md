# 🔧 TROUBLESHOOTING GUIDE - EVILENT BACKEND

## 📋 Tabla de Contenidos
1. [Problemas de Deployment](#problemas-de-deployment)
2. [Problemas de API](#problemas-de-api)
3. [Problemas de Base de Datos](#problemas-de-base-de-datos)
4. [Problemas de Autenticación](#problemas-de-autenticación)
5. [Problemas de CI/CD](#problemas-de-cicd)
6. [Problemas de Performance](#problemas-de-performance)
7. [Debugging Avanzado](#debugging-avanzado)

---

## 🚀 Problemas de Deployment

### ❌ Error: "Stack already exists in ROLLBACK_COMPLETE"

**Síntoma:**
```
Error: Stack UserServiceStack already exists in ROLLBACK_COMPLETE state
```

**Causa:** Deployment anterior falló y dejó el stack en estado inconsistente.

**Solución:**
```bash
# 1. Eliminar stack
aws cloudformation delete-stack --stack-name UserServiceStack

# 2. Esperar a que se elimine completamente
aws cloudformation wait stack-delete-complete --stack-name UserServiceStack

# 3. Volver a desplegar
cd BACKEND/user-service
npm run cdk:deploy
```

---

### ❌ Error: "Cannot find asset at lambda-deploy"

**Síntoma:**
```
ValidationError: Cannot find asset at /path/to/lambda-deploy
```

**Causa:** No se ejecutó `make prepare-lambda` antes del deploy.

**Solución:**
```bash
# 1. Compilar TypeScript
npm run build

# 2. Preparar Lambda
make prepare-lambda

# 3. Verificar que existe
ls -la lambda-deploy/

# 4. Deploy
npm run cdk:deploy
```

---

### ❌ Error: "CDK Bootstrap required"

**Síntoma:**
```
Error: This stack uses assets, so the toolkit stack must be deployed
```

**Causa:** CDK no está inicializado en la cuenta/región.

**Solución:**
```bash
# Bootstrap CDK
cdk bootstrap aws://ACCOUNT-ID/eu-central-1

# Verificar
aws cloudformation describe-stacks --stack-name CDKToolkit
```

---

### ❌ Error: "Insufficient IAM permissions"

**Síntoma:**
```
User: arn:aws:iam::123456789:user/developer is not authorized to perform: cloudformation:CreateStack
```

**Causa:** Usuario no tiene permisos necesarios.

**Solución:**
```bash
# Verificar permisos actuales
aws iam list-attached-user-policies --user-name your-username

# Solicitar a admin que agregue políticas:
# - CloudFormationFullAccess
# - AWSLambda_FullAccess
# - IAMReadOnlyAccess
# - AmazonAPIGatewayAdministrator
# - CloudWatchLogsFullAccess
```

---

### ❌ Error: "Resource limit exceeded"

**Síntoma:**
```
Error: Maximum number of Lambda functions exceeded
```

**Causa:** Cuenta AWS alcanzó límite de recursos.

**Solución:**
```bash
# 1. Ver límites actuales
aws service-quotas get-service-quota \
  --service-code lambda \
  --quota-code L-9FEE3D26

# 2. Eliminar funciones no usadas
aws lambda list-functions --query 'Functions[*].FunctionName'

# 3. Solicitar aumento de límite en AWS Console
# Service Quotas → AWS Lambda → Request quota increase
```

---

## 🌐 Problemas de API

### ❌ Error: 401 Unauthorized

**Síntoma:**
```json
{
  "message": "Unauthorized"
}
```

**Causa:** Token JWT inválido o expirado.

**Solución:**
```bash
# 1. Verificar que el token es válido
echo $TEST_TOKEN | base64 -d

# 2. Obtener nuevo token de Cognito
aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id $COGNITO_APP_CLIENT_ID \
  --auth-parameters USERNAME=test@example.com,PASSWORD=Test123!

# 3. Usar el IdToken en Authorization header
curl -H "Authorization: Bearer <IdToken>" \
  https://api-url/user
```

---

### ❌ Error: 403 Forbidden

**Síntoma:**
```json
{
  "message": "Forbidden"
}
```

**Causa:** Usuario autenticado pero sin permisos para el recurso.

**Solución:**
```bash
# 1. Verificar claims del token JWT
# Decodificar en https://jwt.io

# 2. Verificar que el usuario tiene el rol correcto
aws cognito-idp admin-list-groups-for-user \
  --user-pool-id $COGNITO_POOL_ID \
  --username test@example.com

# 3. Agregar usuario a grupo si es necesario
aws cognito-idp admin-add-user-to-group \
  --user-pool-id $COGNITO_POOL_ID \
  --username test@example.com \
  --group-name Admins
```

---

### ❌ Error: 500 Internal Server Error

**Síntoma:**
```json
{
  "message": "Internal server error"
}
```

**Causa:** Error no manejado en Lambda.

**Solución:**
```bash
# 1. Ver logs de CloudWatch
aws logs tail /aws/lambda/UserServiceStack-ServiceUserServiceFunction-xxxxx \
  --follow \
  --filter-pattern "ERROR"

# 2. Buscar stack trace
aws logs filter-log-events \
  --log-group-name /aws/lambda/UserServiceStack-ServiceUserServiceFunction-xxxxx \
  --filter-pattern "Error" \
  --start-time $(date -u -d '1 hour ago' +%s)000

# 3. Reproducir localmente
cd BACKEND/user-service
npm run test:debug
```

---

### ❌ Error: Timeout

**Síntoma:**
```
Task timed out after 30.00 seconds
```

**Causa:** Lambda excedió timeout configurado.

**Solución:**
```bash
# 1. Verificar timeout actual
aws lambda get-function-configuration \
  --function-name UserServiceStack-ServiceUserServiceFunction-xxxxx \
  --query 'Timeout'

# 2. Aumentar timeout en CDK (lib/service-stack.ts)
timeout: cdk.Duration.seconds(60),  // Cambiar de 30 a 60

# 3. Redeploy
npm run cdk:deploy

# 4. Optimizar código si persiste
# - Agregar índices en BD
# - Cachear queries frecuentes
# - Paginar resultados grandes
```

---

## 🗄️ Problemas de Base de Datos

### ❌ Error: "Connection timeout"

**Síntoma:**
```
Error: Connection to database timed out
```

**Causa:** Lambda no puede conectar a BD (VPC/Security Groups).

**Solución:**
```bash
# 1. Verificar que Lambda está en VPC correcta
aws lambda get-function-configuration \
  --function-name UserServiceStack-ServiceUserServiceFunction-xxxxx \
  --query 'VpcConfig'

# 2. Verificar Security Groups
aws ec2 describe-security-groups \
  --group-ids sg-xxxxx

# 3. Verificar que BD acepta conexiones desde Lambda SG
# RDS Console → Security Groups → Inbound rules
# Debe permitir: PostgreSQL (5432) desde Lambda SG

# 4. Test de conectividad desde Bastion
ssh -i bastion-key.pem ec2-user@bastion-ip
psql -h db-endpoint -U postgres -d evilent_user_service
```

---

### ❌ Error: "Too many connections"

**Síntoma:**
```
Error: FATAL: sorry, too many clients already
```

**Causa:** Límite de conexiones PostgreSQL excedido.

**Solución:**
```bash
# 1. Ver conexiones actuales
psql -h db-endpoint -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# 2. Matar conexiones idle
psql -h db-endpoint -U postgres -c "
  SELECT pg_terminate_backend(pid)
  FROM pg_stat_activity
  WHERE state = 'idle'
  AND state_change < current_timestamp - INTERVAL '5 minutes';
"

# 3. Aumentar max_connections en RDS
# RDS Console → Parameter Groups → Modify
# max_connections = 200 (default 100)

# 4. Implementar connection pooling en código
# src/database/connection.ts
const pool = new Pool({
  max: 10,  // Máximo 10 conexiones por Lambda
  idleTimeoutMillis: 30000,
});
```

---

### ❌ Error: MongoDB "Authentication failed"

**Síntoma:**
```
MongoServerError: Authentication failed
```

**Causa:** Credenciales incorrectas o usuario no existe.

**Solución:**
```bash
# 1. Verificar MONGODB_URI
echo $MONGODB_URI_TEST

# 2. Conectar manualmente
mongosh "$MONGODB_URI_TEST"

# 3. Crear usuario si no existe
use admin
db.createUser({
  user: "evilent_product",
  pwd: "secure-password",
  roles: [{ role: "readWrite", db: "evilent_product_service" }]
})

# 4. Actualizar secret en GitHub Actions
# Settings → Secrets → MONGODB_URI_TEST
```

---

## 🔐 Problemas de Autenticación

### ❌ Error: "User pool does not exist"

**Síntoma:**
```
UserPoolIdNotFoundException: User pool eu-central-1_xxxxx does not exist
```

**Causa:** COGNITO_POOL_ID incorrecto o no existe.

**Solución:**
```bash
# 1. Listar user pools existentes
aws cognito-idp list-user-pools --max-results 10

# 2. Verificar que existe
aws cognito-idp describe-user-pool --user-pool-id eu-central-1_xxxxx

# 3. Actualizar variable de entorno
export COGNITO_POOL_ID="eu-central-1_correct_id"

# 4. Redeploy
npm run cdk:deploy
```

---

### ❌ Error: "Invalid JWT signature"

**Síntoma:**
```
JsonWebTokenError: invalid signature
```

**Causa:** Token firmado con clave diferente.

**Solución:**
```bash
# 1. Verificar que usas token de Cognito correcto
# Decodificar token en https://jwt.io
# Verificar "iss" (issuer) coincide con tu Cognito Pool

# 2. Obtener nuevo token
aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id $COGNITO_APP_CLIENT_ID \
  --auth-parameters USERNAME=test@example.com,PASSWORD=Test123!

# 3. Usar IdToken (no AccessToken)
```

---

## 🤖 Problemas de CI/CD

### ❌ Error: "Workflow not triggering"

**Síntoma:** Push a main pero workflow no se ejecuta.

**Causa:** Cambios no están en paths configurados.

**Solución:**
```yaml
# Verificar paths en .github/workflows/user-service-ci-cd.yml
on:
  push:
    paths:
      - 'BACKEND/user-service/**'  # Solo cambios aquí disparan workflow

# Si cambias otro archivo, workflow no se ejecuta
# Solución: Hacer cambio en BACKEND/user-service/ o ejecutar manualmente
```

---

### ❌ Error: "Secrets not found"

**Síntoma:**
```
Error: AWS_ACCESS_KEY_ID not found
```

**Causa:** Secret no configurado en GitHub.

**Solución:**
```bash
# 1. Ir a GitHub → Settings → Secrets and variables → Actions
# 2. Click "New repository secret"
# 3. Agregar:
#    - Name: AWS_ACCESS_KEY_ID
#    - Secret: tu-access-key
# 4. Repetir para todos los secrets necesarios
# 5. Re-run workflow
```

---

### ❌ Error: "npm audit vulnerabilities"

**Síntoma:**
```
found 5 vulnerabilities (2 moderate, 3 high)
```

**Causa:** Dependencias con vulnerabilidades conocidas.

**Solución:**
```bash
# 1. Ver detalles
npm audit

# 2. Intentar fix automático
npm audit fix

# 3. Si no funciona, actualizar manualmente
npm update package-name

# 4. Si es dependencia transitiva, forzar resolución
# package.json
{
  "overrides": {
    "vulnerable-package": "^safe-version"
  }
}

# 5. Commit y push
git add package.json package-lock.json
git commit -m "fix: Update vulnerable dependencies"
git push
```

---

## ⚡ Problemas de Performance

### ❌ Lambda Cold Start Lento

**Síntoma:** Primera invocación tarda 3-5 segundos.

**Causa:** Lambda cold start (inicialización).

**Solución:**
```typescript
// 1. Mover imports fuera del handler
import { Pool } from 'pg';

const pool = new Pool({...});  // Inicializar fuera

export const handler = async (event) => {
  // Handler usa pool ya inicializado
  const result = await pool.query('SELECT 1');
};

// 2. Configurar Provisioned Concurrency (costo adicional)
// lib/service-stack.ts
function.addAlias('live', {
  provisionedConcurrentExecutions: 1,  // Siempre 1 instancia caliente
});

// 3. Usar Lambda SnapStart (Java only)
// O considerar migrar a containers (ECS/Fargate)
```

---

### ❌ API Gateway Throttling

**Síntoma:**
```
{
  "message": "Too Many Requests"
}
```

**Causa:** Excediste límite de requests (10,000 req/s default).

**Solución:**
```bash
# 1. Ver límites actuales
aws apigateway get-account

# 2. Solicitar aumento
# AWS Console → Service Quotas → API Gateway
# Request quota increase

# 3. Implementar rate limiting en código
// src/middleware/rate-limit.ts
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 100  // 100 requests por IP
});
```

---

## 🔍 Debugging Avanzado

### Habilitar X-Ray Tracing

```typescript
// lib/service-stack.ts
import * as lambda from 'aws-cdk-lib/aws-lambda';

const fn = new lambda.Function(this, 'Function', {
  tracing: lambda.Tracing.ACTIVE,  // Habilitar X-Ray
  // ...
});
```

```bash
# Ver traces en AWS Console
# X-Ray → Service map → Traces
```

### Logs Estructurados

```typescript
// src/utility/logger.ts
import { Logger } from '@aws-lambda-powertools/logger';

const logger = new Logger({ serviceName: 'user-service' });

export const handler = async (event) => {
  logger.info('Processing request', {
    requestId: event.requestContext.requestId,
    path: event.path,
    method: event.httpMethod,
  });
  
  try {
    // ...
  } catch (error) {
    logger.error('Error processing request', {
      error: error.message,
      stack: error.stack,
    });
  }
};
```

### CloudWatch Insights Queries

```sql
-- Errores en última hora
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc
| limit 100

-- Requests más lentos
fields @timestamp, @duration
| filter @type = "REPORT"
| sort @duration desc
| limit 20

-- Tasa de errores por endpoint
fields @timestamp, path, statusCode
| filter statusCode >= 400
| stats count() by path
```

---

## 📊 Checklist de Debugging

Cuando algo falla:
- [ ] ✅ Ver logs de CloudWatch (últimos 15 min)
- [ ] ✅ Verificar métricas de Lambda (Errors, Duration, Throttles)
- [ ] ✅ Revisar eventos de CloudFormation
- [ ] ✅ Probar endpoint manualmente con curl
- [ ] ✅ Reproducir localmente con tests
- [ ] ✅ Verificar variables de entorno
- [ ] ✅ Revisar Security Groups y VPC
- [ ] ✅ Comprobar IAM permissions
- [ ] ✅ Ver X-Ray traces (si habilitado)
- [ ] ✅ Consultar documentación AWS

---

## 📞 Soporte

Si el problema persiste:
1. Documentar el error completo (logs, stack trace)
2. Incluir pasos para reproducir
3. Abrir issue en GitHub con label `bug`
4. Contactar al equipo en Slack #backend-support

---

**Última actualización:** 2025-11-10  
**Mantenedor:** Skynet-IA  
**Status:** ✅ DOCUMENTACIÓN COMPLETA

