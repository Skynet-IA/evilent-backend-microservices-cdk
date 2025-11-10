# 🚀 Guía de Deploy AWS CDK - Product Service

## 💡 Lo Que Logramos

Con **~500 líneas de código TypeScript** desplegamos:

```
✅ 5 Lambda Functions (products, categories, deals, images, queue)
✅ API Gateway (REST API con rate limiting)
✅ Cognito Authorizer (autenticación enterprise)
✅ IAM Roles (permisos automáticos)
✅ CloudWatch Logs (monitoreo en tiempo real)
```

**Costo:** ~$0-5/mes en desarrollo (dentro del free tier)

---

## 📋 Prerequisitos

### 1. Herramientas Instaladas

```bash
# Verificar instalaciones
node --version  # v18+
aws --version   # v2.x
aws sts get-caller-identity  # Debe mostrar tu cuenta
```

Si `aws sts get-caller-identity` falla:
```bash
aws configure
# Ingresa: Access Key ID, Secret Access Key, region (us-east-1), format (json)
```

### 2. Cognito User Pool

Necesitas crear un User Pool en AWS Cognito:

**Pasos rápidos:**
1. Ve a AWS Console → Cognito → User Pools
2. Click "Create user pool"
3. Configuración básica:
   - Sign-in: Email
   - Password: Defaults (o personaliza)
   - MFA: Opcional
   - Self-registration: Enabled
4. App client: Crea uno (sin secret para apps móviles)
5. Guarda estos valores:
   ```
   User Pool ID: us-east-1_abc123XYZ
   App Client ID: xyz789abc123
   Region: us-east-1
   ```

**⚠️ Importante:** Necesitas el **User Pool ID** para el deploy.

---

## 🎯 Deploy en 5 Pasos

### 1. Setup Inicial (Solo Primera Vez)

```bash
cd /Users/clay404/Documents/EVILENT/BACKEND/product-service

# Instalar dependencias
npm install

# Bootstrap CDK (prepara tu cuenta AWS)
npx cdk bootstrap
```

**¿Qué hace bootstrap?**
- Crea bucket S3 para assets
- Crea roles IAM necesarios
- Solo se hace UNA VEZ por cuenta/región

---

### 2. Compilar TypeScript

```bash
npm run build
```

**¿Qué hace?** Convierte `.ts` → `.js` para ejecutar en Lambda

---

### 3. Ver Cambios (Opcional)

```bash
npx cdk diff
```

**¿Qué hace?** Preview de lo que se va a crear/modificar (sin hacer cambios reales)

---

### 4. Deploy 🚀

```bash
npx cdk deploy --parameters CognitoPoolId=us-east-1_abc123XYZ --require-approval never
```

**🔄 Reemplaza `us-east-1_abc123XYZ` con tu Cognito Pool ID real**

**¿Dónde obtener el Pool ID?**
AWS Console → Cognito → User Pools → Copia el ID

**Tiempo:** 3-5 minutos primera vez, 30-60 segundos después

**Output importante:**
```
ProductServiceStack.ProductsApiGatewayEndpoint = https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod/
```

**Guarda esta URL** ⭐

---

### 5. Configurar Frontend

Edita: `/Users/clay404/Documents/EVILENT/FRONTEND/evilent_app/prod.env`

```env
API_BASE_URL=https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod
COGNITO_POOL_ID=us-east-1_abc123XYZ
COGNITO_APP_CLIENT_ID=tu-client-id
COGNITO_REGION=us-east-1
```

---

## 🔄 Actualizar Después de Cambios

```bash
npm run build && npx cdk deploy --require-approval never
```

**Tiempo:** 30-60 segundos

---

## 📜 Ver Logs en Tiempo Real

```bash
# Obtener nombre de la función
FUNCTION_NAME=$(aws cloudformation describe-stack-resources \
  --stack-name ProductServiceStack \
  --region us-east-1 \
  --query "StackResources[?ResourceType=='AWS::Lambda::Function'].PhysicalResourceId" \
  --output text)

# Ver logs
aws logs tail /aws/lambda/$FUNCTION_NAME --follow --region us-east-1
```

**O con Makefile:**
```bash
make logs
```

---

## 🧪 Testing del API

### Obtener Token desde Flutter

```dart
final session = await Amplify.Auth.fetchAuthSession();
final token = session.userPoolTokensResult.value.idToken.raw;
print('Token: $token');
```

### Probar Endpoints

```bash
export TOKEN="eyJraWQiOiJabG..."

# GET Products
curl -H "Authorization: Bearer $TOKEN" \
  https://tu-api-url.amazonaws.com/prod/product

# POST Product
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"iPhone 15","price":999}' \
  https://tu-api-url.amazonaws.com/prod/product
```

---

## 🏗️ Arquitectura

```
Flutter App
    ↓ (JWT Token)
API Gateway + Cognito Authorizer
    ↓ (Verifica token automáticamente)
Lambda Function
    ↓ (Recibe userId y email verificados)
Business Logic
```

**Ventaja:** Sin código de verificación JWT en Lambda, todo lo hace API Gateway

---

## 🐛 Troubleshooting Común

### Error: "Unable to resolve AWS account"
```bash
aws configure
```

### Error: "This stack uses assets"
```bash
npx cdk bootstrap
```

### Error: "Unauthorized" (401)
- Token expirado → Obtener nuevo token
- Usar `idToken` (no `accessToken`)
- Verificar header: `Authorization: Bearer TOKEN`

### Error: Permisos IAM

Si ves errores de permisos durante bootstrap o deploy, necesitas estas políticas en tu usuario IAM:

```
✅ AWSCloudFormationFullAccess
✅ IAMFullAccess
✅ AmazonS3FullAccess
✅ AWSLambda_FullAccess
✅ AmazonAPIGatewayAdministrator
✅ CloudWatchFullAccess
✅ AmazonEC2ContainerRegistryFullAccess (para Docker/Lambda)
✅ AmazonSSMFullAccess (para CDK parameters)
```

**Si el stack queda en `ROLLBACK_COMPLETE`:**
```bash
# Eliminar stack fallido
aws cloudformation delete-stack --stack-name CDKToolkit
# Esperar 2-3 minutos
# Reintentar bootstrap
npx cdk bootstrap
```

### Deploy muy lento
- Verifica eventos en AWS Console → CloudFormation
- Presiona Ctrl+C y reintenta

---

## 📊 Comandos Útiles

```bash
# Ver URL del API
aws cloudformation describe-stacks \
  --stack-name ProductServiceStack \
  --query 'Stacks[0].Outputs[?OutputKey==`UserApiGatewayEndpoint`].OutputValue' \
  --output text

# Ver recursos creados
aws cloudformation describe-stack-resources --stack-name ProductServiceStack

# Ver eventos recientes
aws cloudformation describe-stack-events \
  --stack-name ProductServiceStack \
  --max-items 10

# Destruir todo (⚠️ CUIDADO)
npx cdk destroy
```

---

## 🎓 Lo Que Aprendiste

1. **AWS CDK** - Infraestructura como código
2. **Lambda** - Serverless computing (sin servidores que mantener)
3. **API Gateway** - REST APIs escalables automáticamente
4. **Cognito Authorizer** - Autenticación sin código
5. **CloudFormation** - Orquestación de recursos
6. **IAM** - Gestión de permisos
7. **CloudWatch** - Monitoreo y logs en tiempo real
8. **ES Modules** - TypeScript moderno (`"type": "module"`)

---

## 💪 Ventajas vs Desarrollo Local

### Local:
```
❌ Solo tú puedes probarlo
❌ Configuración diferente en cada máquina
❌ No escala
❌ Sin monitoreo real
```

### AWS CDK:
```
✅ Cualquiera puede probarlo (con URL)
✅ Ambiente consistente
✅ Escala automáticamente (0 a millones)
✅ Logs y métricas en tiempo real
✅ Costos mínimos ($0-5/mes desarrollo)
✅ Deploy en 30 segundos
```

---

## 🔥 Workflow Diario

```bash
# 1. Hacer cambios en src/
vim src/user-service.ts

# 2. Deploy en 30 segundos
npm run build && npx cdk deploy --require-approval never

# 3. Ver logs inmediatamente
make logs

# 4. Probar desde Flutter
# Ya funciona con la misma URL
```

---

## 📦 Archivos Clave del Proyecto

```
user-service/
├── bin/user-service.ts          # Entry point CDK
├── lib/
│   ├── user-service-stack.ts    # Stack principal (Cognito + orchestration)
│   ├── api-gateway-stack.ts     # API Gateway + Authorizer
│   └── service-stack.ts         # Lambda Function
├── src/
│   ├── user-api.ts              # Handler Lambda (routing)
│   ├── service/user-service.ts  # Business logic
│   └── repository/              # Data access (futuro: DB)
├── package.json                 # "type": "module" (ES Modules)
└── tsconfig.json                # "module": "NodeNext"
```

---

## 🎯 Cambios Importantes que Hicimos

### 1. ES Modules Support
```json
// package.json
{
  "type": "module"
}
```

### 2. Imports con .js Extension
```typescript
// Antes
import { UserRepository } from "./repository";

// Después
import { UserRepository } from "./repository/index.js";
```

### 3. __dirname en ES Modules
```typescript
// lib/service-stack.ts
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

### 4. Bucket Name Único
```typescript
// lib/user-service-stack.ts
bucket: 'evilent-user-service-211125636157-eu-central-1'
```

---

## 🚀 Próximos Niveles

### Nivel 2: Base de Datos
```typescript
const table = new dynamodb.Table(this, 'UsersTable', {
  partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING }
});
```

### Nivel 3: Múltiples Ambientes
```bash
cdk deploy --context env=dev
cdk deploy --context env=staging
cdk deploy --context env=prod
```

### Nivel 4: CI/CD
```yaml
# GitHub Actions
on: push
  branches: [main]
run: npx cdk deploy --require-approval never
```

---

## 🎉 Resumen

**Lo que logramos:**
- ✅ Deploy completo en AWS en 5 minutos
- ✅ API REST con autenticación Cognito
- ✅ Logs en tiempo real
- ✅ Auto-escalable de 0 a millones
- ✅ Costos mínimos ($0-5/mes)
- ✅ Integración Flutter funcionando

**Con solo:**
- 📝 ~400 líneas de código
- ⏱️ 5 comandos principales
- 💰 $0-5/mes en desarrollo

**Eso es el poder de AWS CDK + Serverless** 🚀

---

## 🏭 Para Producción

### Cambios Necesarios Antes de Producción

#### 1. Implementar Lógica Real en UserRepository

**Actual (mock para testing):**
```typescript
// src/repository/user-repository.ts
async upsertAccount() {
  return { user_id: "mock-user-id", email: "user@example.com" };
}
```

**Para producción (conectar a base de datos):**
```typescript
async upsertAccount(userId: string, email: string, data: any) {
  // Conectar a DynamoDB, RDS, etc.
  const result = await dynamoDB.put({
    TableName: 'Users',
    Item: { userId, email, ...data }
  }).promise();
  return result;
}
```

#### 2. Agregar Validación de Datos

```bash
npm install zod
```

```typescript
// src/service/user-service.ts
import { z } from 'zod';

const ProfileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional()
});

// Validar antes de guardar
const validatedData = ProfileSchema.parse(JSON.parse(event.body));
```

#### 3. Configurar Variables de Entorno

```typescript
// lib/service-stack.ts
environment: {
  BUCKET_NAME: props.bucket,
  STAGE: 'prod',
  LOG_LEVEL: 'info',
  TABLE_NAME: 'UsersTable'
}
```

#### 4. Ajustar Rate Limiting

```typescript
// lib/api-gateway-stack.ts
throttlingBurstLimit: 500,   // Ajustar según tráfico esperado
throttlingRateLimit: 100     // Requests por segundo
```

#### 5. Agregar CORS (si es necesario)

```typescript
// lib/api-gateway-stack.ts
defaultCorsPreflightOptions: {
  allowOrigins: ['https://tu-dominio.com'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}
```

### Checklist Pre-Producción

- [ ] Lógica real implementada en UserRepository
- [ ] Validación de datos agregada
- [ ] Manejo de errores completo
- [ ] Variables de entorno configuradas
- [ ] Rate limiting ajustado
- [ ] CORS configurado (si aplica)
- [ ] Tests escritos y pasando
- [ ] Logs configurados apropiadamente
- [ ] Bucket S3 con nombre único
- [ ] Cognito Pool ID correcto

---

## 📚 Recursos

- [AWS CDK Docs](https://docs.aws.amazon.com/cdk/)
- [Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [Cognito Docs](https://docs.aws.amazon.com/cognito/)
- [DynamoDB con CDK](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_dynamodb-readme.html)

---

**Última actualización:** Octubre 22, 2025  
**Tu primer deploy exitoso:** ✅ Completado

**¡Bienvenido al mundo serverless!** 🌟

