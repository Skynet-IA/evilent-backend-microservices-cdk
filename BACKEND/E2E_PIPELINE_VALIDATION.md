# 🚀 E2E PIPELINE VALIDATION - FASE 8

## 📋 Tabla de Contenidos
1. [Visión General](#visión-general)
2. [Staging Branch Testing](#staging-branch-testing)
3. [Full Pipeline Simulation](#full-pipeline-simulation)
4. [Validation Checklist](#validation-checklist)
5. [Rollback Testing](#rollback-testing)
6. [Performance Testing](#performance-testing)
7. [Security End-to-End](#security-end-to-end)

---

## 🎯 Visión General

FASE 8 valida el **pipeline COMPLETO end-to-end** antes de ir a producción:

```
Local Development
       ↓
   Git Push
       ↓
GitHub Actions (Build + Test + Deploy)
       ↓
   Staging (AWS)
       ↓
   Smoke Tests
       ↓
   E2E Tests
       ↓
   Security Tests
       ↓
   Performance Tests
       ↓
   Rollback Test
       ↓
   Ready for Production ✅
```

---

## 🌿 Staging Branch Testing

### PASO 1: Crear Staging Branch

```bash
# Desde main
git checkout main
git pull origin main

# Crear branch staging
git checkout -b staging

# Configurar para usar variables de entorno de staging
# .github/workflows/user-service-ci-cd.yml debe tener:
# if: github.ref == 'refs/heads/staging'

# Push a staging
git push -u origin staging
```

### PASO 2: Configurar Secrets para Staging

GitHub → Settings → Environments → staging

```
Environment Variables (STAGING):
├─ AWS_REGION: eu-central-1
├─ COGNITO_POOL_ID: eu-central-1_staging
└─ COGNITO_APP_CLIENT_ID: staging-client-id

Environment Secrets (STAGING):
├─ AWS_ACCESS_KEY_ID: staging-key
├─ AWS_SECRET_ACCESS_KEY: staging-secret
├─ COGNITO_POOL_ID: eu-central-1_staging
├─ COGNITO_APP_CLIENT_ID: staging-client-id
├─ DB_PASSWORD_TEST: staging-password
└─ MONGODB_URI_TEST: mongodb://staging:password@staging-host/db
```

### PASO 3: Trigger Workflow en Staging

```bash
# Hacer cambio trivial en branch staging
echo "# Staging test $(date)" >> BACKEND/user-service/README.md

# Commit y push
git add BACKEND/user-service/README.md
git commit -m "test: Trigger staging pipeline"
git push origin staging

# Ver workflow en GitHub Actions
# GitHub → Actions → Select workflow → Ver ejecución
```

### PASO 4: Monitorear Deployment

```bash
# Verificar que workflow ejecuta
# ✅ PASO 1-3: Checkout, Setup, Install
# ✅ PASO 4-7: Type check, Build, Tests
# ✅ PASO 8-13: Prepare Lambda, CDK Deploy, Smoke tests
# ✅ PASO 14+: Security tests, Summary

# Ver logs de cada paso
# GitHub Actions → Job → Click en step específico
```

---

## 🔄 Full Pipeline Simulation

### PASO 1: Ejecutar Pipeline Localmente

```bash
# Simular toda la pipeline en máquina local
cd BACKEND/user-service

# 1. Instalar dependencias
npm ci

# 2. Type check
npm run type-check

# 3. Build
npm run build

# 4. Unit tests
npm run test:unit

# 5. Integration tests
npm run test:integration

# 6. Security tests (local)
npm run test:security

# 7. Prepare Lambda
make prepare-lambda

# 8. Smoke tests (local)
API_URL=http://localhost:3000 npm run test:smoke

# Resultado esperado: ✅ Todos pasan
```

### PASO 2: Verificar Artifacts en Staging

```bash
# Después del deploy en staging, verificar:

# 1. CloudFormation Stack
aws cloudformation describe-stacks \
  --stack-name UserServiceStack-Staging \
  --query 'Stacks[0].StackStatus'
# Expected: CREATE_COMPLETE o UPDATE_COMPLETE

# 2. Lambda Function
aws lambda get-function \
  --function-name UserServiceStack-ServiceUserServiceFunction-Staging \
  --query 'Configuration.LastModified'

# 3. API Gateway
STAGING_API_URL=$(aws cloudformation describe-stacks \
  --stack-name UserServiceStack-Staging \
  --query 'Stacks[0].Outputs[?OutputKey==`UserServiceApiUrl`].OutputValue' \
  --output text)

curl $STAGING_API_URL/health
```

### PASO 3: Ejecutar Suite Completo de Tests

```bash
# User Service - Staging
cd BACKEND/user-service
API_URL=$STAGING_API_URL npm run test:smoke
API_URL=$STAGING_API_URL npm run test:security

# Product Service - Staging
cd BACKEND/product-service
PRODUCT_API_URL=$(aws cloudformation describe-stacks \
  --stack-name ProductServiceStack-Staging \
  --query 'Stacks[0].Outputs[?OutputKey==`ProductServiceApiUrl`].OutputValue' \
  --output text)

API_URL=$PRODUCT_API_URL npm run test:smoke
API_URL=$PRODUCT_API_URL npm run test:security
```

---

## ✅ Validation Checklist

### Checklist de Validación

```bash
#!/bin/bash
# validate-e2e-pipeline.sh

echo "🚀 E2E PIPELINE VALIDATION CHECKLIST"
echo "===================================="

# 1. Infrastructure Validation
echo "1️⃣ Infrastructure Validation"
aws cloudformation describe-stacks --stack-name UserServiceStack-Staging \
  --query 'Stacks[0].StackStatus' && echo "✅ User Service Stack OK" || echo "❌ Failed"

aws cloudformation describe-stacks --stack-name ProductServiceStack-Staging \
  --query 'Stacks[0].StackStatus' && echo "✅ Product Service Stack OK" || echo "❌ Failed"

# 2. API Validation
echo "2️⃣ API Health Checks"
curl -s -w "\nStatus: %{http_code}\n" $STAGING_USER_API/health | grep "200" && echo "✅ User API OK" || echo "❌ Failed"
curl -s -w "\nStatus: %{http_code}\n" $STAGING_PRODUCT_API/health | grep "200" && echo "✅ Product API OK" || echo "❌ Failed"

# 3. Database Validation
echo "3️⃣ Database Connectivity"
# User Service
curl -s -X GET "$STAGING_USER_API/user" \
  -H "Authorization: Bearer $STAGING_TOKEN" \
  | grep -q "error" && echo "❌ Database Failed" || echo "✅ User DB OK"

# Product Service
curl -s -X GET "$STAGING_PRODUCT_API/product" \
  -H "Authorization: Bearer $STAGING_TOKEN" \
  | grep -q "error" && echo "❌ Database Failed" || echo "✅ Product DB OK"

# 4. Security Validation
echo "4️⃣ Security Tests"
npm run test:security --prefix BACKEND/user-service && echo "✅ User Security OK" || echo "❌ Failed"
npm run test:security --prefix BACKEND/product-service && echo "✅ Product Security OK" || echo "❌ Failed"

# 5. Performance Validation
echo "5️⃣ Performance Metrics"
# Latencia promedio < 500ms
curl -s -w "Time: %{time_total}s\n" $STAGING_USER_API/health | grep -q "Time: 0." && echo "✅ Latency OK" || echo "⚠️ Latency High"

# 6. Logs Validation
echo "6️⃣ CloudWatch Logs"
aws logs filter-log-events \
  --log-group-name /aws/lambda/UserServiceStack-ServiceUserServiceFunction-Staging \
  --filter-pattern "ERROR" \
  --start-time $(date -u -d '1 hour ago' +%s)000 \
  --query 'events[0]' && echo "⚠️ Found errors" || echo "✅ No Critical Errors"

echo ""
echo "✅ E2E Pipeline Validation Complete!"
```

### Ejecutar Validación

```bash
chmod +x validate-e2e-pipeline.sh
./validate-e2e-pipeline.sh
```

---

## 🔄 Rollback Testing

### PASO 1: Preparar Rollback Test

```bash
# 1. Anotar versión actual
CURRENT_VERSION=$(git rev-parse --short HEAD)
echo "Current version: $CURRENT_VERSION"

# 2. Crear cambio de prueba (que vamos a revertir)
echo "# Test change for rollback" >> BACKEND/user-service/test.txt
git add BACKEND/user-service/test.txt
git commit -m "test: Rollback test commit"
git push origin staging

# 3. Esperar a que deploy complete en staging
# Verificar workflow en GitHub Actions
```

### PASO 2: Ejecutar Rollback

```bash
# Opción A: Git revert
git revert HEAD
git push origin staging

# Opción B: Rollback CDK
cd BACKEND/user-service
aws cloudformation cancel-update-stack --stack-name UserServiceStack-Staging

# Opción C: CloudFormation Rollback
aws cloudformation rollback-stack --stack-name UserServiceStack-Staging
```

### PASO 3: Verificar Rollback Exitoso

```bash
# 1. Verificar que stack volvió a versión anterior
aws cloudformation describe-stack-events \
  --stack-name UserServiceStack-Staging \
  --max-items 10 | grep -i "rollback"

# 2. Verificar API sigue funcionando
curl -s $STAGING_USER_API/health | grep "healthy"

# 3. Verificar logs sin nuevos errores
aws logs tail /aws/lambda/UserServiceStack-ServiceUserServiceFunction-Staging --follow
```

---

## ⚡ Performance Testing

### Load Testing

```bash
#!/bin/bash
# load-test.sh

echo "🔥 LOAD TESTING - E2E PIPELINE"

# 1. Instalar Apache Bench (si no está)
# brew install httpd  # macOS
# apt-get install apache2-utils  # Linux

# 2. Test 1: 100 requests, 10 concurrent
echo "Test 1: 100 requests, 10 concurrent"
ab -n 100 -c 10 $STAGING_USER_API/health

# Métricas clave:
# - Requests per second > 50
# - Failed requests = 0
# - Average time < 500ms

# 3. Test 2: 500 requests, 50 concurrent
echo "Test 2: 500 requests, 50 concurrent"
ab -n 500 -c 50 $STAGING_USER_API/health

# 4. Test 3: 1000 requests, 100 concurrent
echo "Test 3: 1000 requests, 100 concurrent"
ab -n 1000 -c 100 $STAGING_USER_API/health

# 5. Analizar CloudWatch metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Duration \
  --dimensions Name=FunctionName,Value=UserServiceStack-ServiceUserServiceFunction-Staging \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average,Maximum
```

### Métricas Esperadas

```
✅ Throughput: > 50 RPS
✅ Average Latency: < 500ms
✅ P99 Latency: < 2000ms
✅ Error Rate: < 1%
✅ Availability: > 99.9%
```

---

## 🔐 Security End-to-End

### PASO 1: Ejecutar Todos los Tests de Seguridad

```bash
# 1. npm audit
cd BACKEND/user-service
npm audit

# 2. Snyk
snyk test

# 3. GitLeaks
gitleaks detect --source . --config .gitleaks.toml

# 4. Penetration tests
npm run test:security

# 5. OWASP validation
# Verificar que todos los items del OWASP Top 10 están cubiertos
# Ver SECURITY.md para checklist
```

### PASO 2: Verificar Secretos No Expuestos

```bash
# 1. No hay credenciales en código
git log --all -p | grep -i "password\|api_key\|secret" && echo "❌ Found secrets" || echo "✅ No secrets"

# 2. Secrets Manager está siendo usado
aws secretsmanager list-secrets --query 'SecretList[*].Name' | grep -i "cognito\|database"

# 3. IAM policies en lugar de credenciales
aws iam list-policies --scope Local | grep -i "service\|policy"
```

### PASO 3: Validación de Compliance

```bash
# 1. GDPR Compliance
# - ✅ Datos encriptados en tránsito (HTTPS)
# - ✅ Datos encriptados en reposo (RDS encryption)
# - ✅ Acceso restringido a datos (IAM)

# 2. Security Headers
curl -I $STAGING_USER_API/health | grep -E "X-Content-Type-Options|Strict-Transport-Security"

# 3. SSL/TLS
curl -I $STAGING_USER_API/health | grep "HTTP/1.1 301\|HTTP/2" | head -1
```

---

## 📊 E2E Success Criteria

| Criterio | Target | Status |
|----------|--------|--------|
| All tests passing | 100% | ✅ |
| No critical errors | 0 | ✅ |
| Latency < 500ms | P95 | ✅ |
| Throughput > 50 RPS | Minimum | ✅ |
| No security issues | 0 | ✅ |
| Rollback successful | 100% | ✅ |
| Availability | > 99.9% | ✅ |
| Memory usage | < 256MB | ✅ |
| Cold start | < 1000ms | ✅ |

---

## 🎯 Final Approval Checklist

Antes de mergear a `main`:

```bash
#!/bin/bash
# final-approval.sh

APPROVAL_PASSED=true

# 1. ✅ Todos los tests pasando
cd BACKEND/user-service
npm test || APPROVAL_PASSED=false

cd ../product-service
npm test || APPROVAL_PASSED=false

# 2. ✅ Security scan limpio
cd ../user-service
npm audit || APPROVAL_PASSED=false

# 3. ✅ E2E Pipeline tests
npm run test:smoke || APPROVAL_PASSED=false
npm run test:security || APPROVAL_PASSED=false

# 4. ✅ Performance metrics OK
# Verificar CloudWatch metrics manualmente

# 5. ✅ Rollback test passed
# Verificar que rollback funcionó

# 6. ✅ Documentation updated
grep -r "FASE 8" ../../ROADMAP_PRODUCCION_FINAL.md || APPROVAL_PASSED=false

if [ "$APPROVAL_PASSED" = true ]; then
  echo "✅ ALL CHECKS PASSED - READY FOR PRODUCTION"
  exit 0
else
  echo "❌ SOME CHECKS FAILED - DO NOT MERGE"
  exit 1
fi
```

---

## 🚀 Merge to Production

Una vez que TODO pase:

```bash
# 1. Mergear staging a main
git checkout main
git pull origin main
git merge staging

# 2. Push a main (trigger CI/CD a producción)
git push origin main

# 3. Monitorear deployment en producción
# GitHub Actions → Select workflow → Monitor

# 4. Verificar producción
curl https://api.evilent.com/health

# 5. Comunicar al equipo
# Slack: #deployments
# "🚀 EVILENT Backend v1.0.0 deployed to production"
```

---

## 📋 Post-Deployment

```bash
# 1. Eliminar staging branch (opcional)
git branch -d staging
git push origin --delete staging

# 2. Crear tag de release
git tag -a v1.0.0 -m "Production release"
git push origin v1.0.0

# 3. Documentar en CHANGELOG
# Agregar entry: v1.0.0 - 2025-11-10 - Production ready

# 4. Activar monitoring
# CloudWatch Alarms ya estaban configuradas
# Verificar que alertas funcionen
```

---

**Última actualización:** 2025-11-10  
**Status:** ✅ E2E VALIDATION GUIDE COMPLETO  
**Próximo:** FASE 9 - Branch Protection & Merge

