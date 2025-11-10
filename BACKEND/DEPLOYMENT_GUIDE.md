# 🚀 DEPLOYMENT GUIDE - EVILENT BACKEND

## 📋 Tabla de Contenidos
1. [Requisitos Previos](#requisitos-previos)
2. [Configuración Inicial](#configuración-inicial)
3. [Deployment Manual](#deployment-manual)
4. [Deployment Automático (CI/CD)](#deployment-automático-cicd)
5. [Verificación Post-Deploy](#verificación-post-deploy)
6. [Rollback](#rollback)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Requisitos Previos

### Software Necesario
```bash
# Node.js 20.x
node --version  # v20.x.x

# AWS CLI configurado
aws --version  # aws-cli/2.x.x

# CDK instalado globalmente
npm install -g aws-cdk
cdk --version  # 2.x.x

# Git configurado
git --version
```

### Credenciales AWS
```bash
# Configurar AWS CLI
aws configure

# Verificar credenciales
aws sts get-caller-identity
```

### Variables de Entorno
```bash
# Cognito (obligatorio)
export COGNITO_POOL_ID="eu-central-1_xxxxx"
export COGNITO_APP_CLIENT_ID="xxxxxxxxx"

# Database (para tests)
export DB_PASSWORD_TEST="your-test-password"
export MONGODB_URI_TEST="mongodb://..."
```

---

## ⚙️ Configuración Inicial

### 1. Clonar Repositorio
```bash
git clone https://github.com/Skynet-IA/evilent-backend-microservices-cdk.git
cd evilent-backend-microservices-cdk/BACKEND
```

### 2. Instalar Dependencias

#### IAM Policies (primero)
```bash
cd iam-policies
npm install
npm run build
```

#### User Service
```bash
cd ../user-service
npm install
npm run build
```

#### Product Service
```bash
cd ../product-service
npm install
npm run build
```

### 3. Bootstrap CDK (solo primera vez)
```bash
# Desde cualquier servicio
cdk bootstrap aws://ACCOUNT-ID/eu-central-1

# Verificar
aws cloudformation describe-stacks --stack-name CDKToolkit
```

---

## 🚀 Deployment Manual

### PASO 1: Deploy IAM Policies
```bash
cd BACKEND/iam-policies

# Verificar cambios
make validate

# Deploy
make deploy

# Verificar outputs
aws cloudformation describe-stacks \
  --stack-name IamPoliciesStack \
  --query 'Stacks[0].Outputs'
```

**Outputs esperados:**
- `UserServicePolicyArn`
- `ProductServicePolicyArn`
- `SharedMonitoringPolicyArn`

### PASO 2: Deploy User Service
```bash
cd BACKEND/user-service

# Preparar Lambda
make prepare-lambda

# Verificar sintaxis CDK
npm run cdk:synth

# Deploy
COGNITO_POOL_ID=eu-central-1_xxxxx \
COGNITO_APP_CLIENT_ID=xxxxxxxxx \
npm run cdk:deploy

# Verificar
aws cloudformation describe-stacks --stack-name UserServiceStack
```

**Outputs esperados:**
- `UserServiceApiUrl`
- `UserServiceFunctionArn`
- `UserServiceLogGroupName`

### PASO 3: Deploy Product Service
```bash
cd BACKEND/product-service

# Preparar Lambda
make prepare-lambda

# Deploy
COGNITO_POOL_ID=eu-central-1_xxxxx \
COGNITO_APP_CLIENT_ID=xxxxxxxxx \
npm run cdk:deploy

# Verificar
aws cloudformation describe-stacks --stack-name ProductServiceStack
```

**Outputs esperados:**
- `ProductServiceApiUrl`
- `ProductServiceFunctionArn`
- `ProductServiceLogGroupName`

---

## 🤖 Deployment Automático (CI/CD)

### Configuración GitHub Actions

#### 1. Configurar Secrets en GitHub
```
Settings → Secrets and variables → Actions → New repository secret

Secrets requeridos:
├─ AWS_ACCESS_KEY_ID
├─ AWS_SECRET_ACCESS_KEY
├─ AWS_REGION (eu-central-1)
├─ COGNITO_POOL_ID
├─ COGNITO_APP_CLIENT_ID
├─ DB_PASSWORD_TEST
├─ MONGODB_URI_TEST
├─ API_URL (opcional, para smoke tests)
└─ TEST_TOKEN (opcional, para smoke tests)
```

#### 2. Triggers Automáticos

**User Service CI/CD:**
```yaml
# Se ejecuta cuando:
- Push a main/develop en BACKEND/user-service/**
- Pull request a main/develop
- Manual: workflow_dispatch
```

**Product Service CI/CD:**
```yaml
# Se ejecuta cuando:
- Push a main/develop en BACKEND/product-service/**
- Pull request a main/develop
- Manual: workflow_dispatch
```

**Security Scan:**
```yaml
# Se ejecuta cuando:
- Push a main/develop (cualquier archivo)
- Pull request a main/develop
- Scheduled: Domingos a las 2 AM UTC
```

#### 3. Workflow Steps

Cada workflow ejecuta:
```
1. ✅ Checkout code
2. ✅ Setup Node.js 20
3. ✅ Install dependencies
4. ✅ Type check
5. ✅ Build
6. ✅ Unit tests
7. ✅ Integration tests
8. ✅ Prepare Lambda deployment
9. ✅ Configure AWS credentials
10. ✅ Install AWS CDK
11. ✅ CDK Bootstrap (if needed)
12. ✅ CDK Synth
13. ✅ CDK Deploy
14. ✅ Verify deployment
15. ✅ Smoke tests
16. ✅ Security tests
17. ✅ Summary
```

#### 4. Ejecutar Workflow Manualmente
```
1. Ir a GitHub → Actions
2. Seleccionar workflow (User Service CI/CD o Product Service CI/CD)
3. Click "Run workflow"
4. Seleccionar branch (main/develop)
5. Click "Run workflow"
```

---

## ✅ Verificación Post-Deploy

### 1. Verificar Stacks en AWS
```bash
# Listar todos los stacks
aws cloudformation list-stacks \
  --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE

# Verificar stack específico
aws cloudformation describe-stacks --stack-name UserServiceStack
aws cloudformation describe-stacks --stack-name ProductServiceStack
aws cloudformation describe-stacks --stack-name IamPoliciesStack
```

### 2. Verificar API Gateway
```bash
# Obtener URL de API
USER_API_URL=$(aws cloudformation describe-stacks \
  --stack-name UserServiceStack \
  --query 'Stacks[0].Outputs[?OutputKey==`UserServiceApiUrl`].OutputValue' \
  --output text)

PRODUCT_API_URL=$(aws cloudformation describe-stacks \
  --stack-name ProductServiceStack \
  --query 'Stacks[0].Outputs[?OutputKey==`ProductServiceApiUrl`].OutputValue' \
  --output text)

# Test health endpoint
curl $USER_API_URL/health
curl $PRODUCT_API_URL/health
```

### 3. Verificar Lambda Functions
```bash
# Listar funciones
aws lambda list-functions \
  --query 'Functions[?contains(FunctionName, `UserService`) || contains(FunctionName, `ProductService`)].FunctionName'

# Invocar función de prueba
aws lambda invoke \
  --function-name UserServiceStack-ServiceUserServiceFunction-xxxxx \
  --payload '{"httpMethod":"GET","path":"/health"}' \
  response.json

cat response.json
```

### 4. Verificar CloudWatch Logs
```bash
# Listar log groups
aws logs describe-log-groups \
  --log-group-name-prefix /aws/lambda/UserServiceStack

# Ver logs recientes
aws logs tail /aws/lambda/UserServiceStack-ServiceUserServiceFunction-xxxxx --follow
```

### 5. Smoke Tests Locales
```bash
# User Service
cd BACKEND/user-service
API_URL=$USER_API_URL npm run test:smoke

# Product Service
cd BACKEND/product-service
API_URL=$PRODUCT_API_URL npm run test:smoke
```

---

## 🔄 Rollback

### Opción 1: Rollback Automático (CDK)
```bash
# CDK mantiene snapshot del estado anterior
cd BACKEND/user-service

# Ver historial de cambios
aws cloudformation describe-stack-events \
  --stack-name UserServiceStack \
  --max-items 20

# Rollback a versión anterior
aws cloudformation rollback-stack --stack-name UserServiceStack
```

### Opción 2: Rollback Manual (Git)
```bash
# 1. Identificar commit anterior funcional
git log --oneline

# 2. Revertir a ese commit
git revert <commit-hash>

# 3. Push para trigger CI/CD
git push origin main

# 4. CI/CD desplegará versión anterior automáticamente
```

### Opción 3: Rollback de Lambda (Versiones)
```bash
# Listar versiones de Lambda
aws lambda list-versions-by-function \
  --function-name UserServiceStack-ServiceUserServiceFunction-xxxxx

# Actualizar alias a versión anterior
aws lambda update-alias \
  --function-name UserServiceStack-ServiceUserServiceFunction-xxxxx \
  --name live \
  --function-version 2  # Versión anterior
```

---

## 🔧 Troubleshooting

### Error: "Stack already exists"
```bash
# Verificar estado del stack
aws cloudformation describe-stacks --stack-name UserServiceStack

# Si está en ROLLBACK_COMPLETE, eliminar y recrear
aws cloudformation delete-stack --stack-name UserServiceStack
aws cloudformation wait stack-delete-complete --stack-name UserServiceStack
npm run cdk:deploy
```

### Error: "Cannot find asset at lambda-deploy"
```bash
# Asegurarse de ejecutar prepare-lambda primero
make prepare-lambda

# Verificar que existe
ls -la lambda-deploy/

# Luego deploy
npm run cdk:deploy
```

### Error: "Insufficient permissions"
```bash
# Verificar credenciales AWS
aws sts get-caller-identity

# Verificar políticas IAM del usuario
aws iam list-attached-user-policies --user-name your-username

# Necesitas al menos:
# - CloudFormation full access
# - Lambda full access
# - IAM limited access
# - API Gateway full access
# - CloudWatch Logs full access
```

### Error: "CDK Bootstrap required"
```bash
# Bootstrap CDK en la región
cdk bootstrap aws://ACCOUNT-ID/eu-central-1

# Verificar
aws cloudformation describe-stacks --stack-name CDKToolkit
```

### Error: "COGNITO_POOL_ID not set"
```bash
# Exportar variables de entorno
export COGNITO_POOL_ID="eu-central-1_xxxxx"
export COGNITO_APP_CLIENT_ID="xxxxxxxxx"

# Verificar
echo $COGNITO_POOL_ID
echo $COGNITO_APP_CLIENT_ID

# Deploy
npm run cdk:deploy
```

### Logs de Debugging
```bash
# Ver logs de CloudFormation
aws cloudformation describe-stack-events \
  --stack-name UserServiceStack \
  --max-items 50

# Ver logs de Lambda
aws logs tail /aws/lambda/UserServiceStack-ServiceUserServiceFunction-xxxxx \
  --follow \
  --format short

# Ver métricas de Lambda
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Errors \
  --dimensions Name=FunctionName,Value=UserServiceStack-ServiceUserServiceFunction-xxxxx \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum
```

---

## 📊 Checklist de Deployment

Antes de cada deployment:
- [ ] ✅ Tests pasando localmente (`npm test`)
- [ ] ✅ Build exitoso (`npm run build`)
- [ ] ✅ Type-check sin errores (`npm run type-check`)
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ AWS credentials válidas
- [ ] ✅ CDK bootstrap ejecutado
- [ ] ✅ IAM policies desplegadas primero

Después de cada deployment:
- [ ] ✅ Stack en estado `CREATE_COMPLETE` o `UPDATE_COMPLETE`
- [ ] ✅ API Gateway responde (`/health`)
- [ ] ✅ Lambda functions ejecutándose
- [ ] ✅ CloudWatch logs sin errores críticos
- [ ] ✅ Smoke tests pasando
- [ ] ✅ Documentar cambios en CHANGELOG

---

## 🎯 Best Practices

1. **Siempre deploy IAM policies primero**
   - Evita errores de permisos en servicios

2. **Usar CI/CD para producción**
   - Deployment manual solo para desarrollo/testing

3. **Verificar antes de deploy**
   - `npm run cdk:synth` para ver cambios
   - `npm run cdk:diff` para comparar con stack actual

4. **Monitorear después de deploy**
   - CloudWatch Logs por 10-15 minutos
   - Verificar métricas de errores

5. **Documentar cambios**
   - Actualizar CHANGELOG.md
   - Commit descriptivo en Git

6. **Mantener versiones**
   - Tag en Git para cada release
   - `git tag v1.0.0 && git push --tags`

---

## 📚 Referencias

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [CloudFormation Documentation](https://docs.aws.amazon.com/cloudformation/)

---

**Última actualización:** 2025-11-10  
**Mantenedor:** Skynet-IA  
**Status:** ✅ DOCUMENTACIÓN COMPLETA

