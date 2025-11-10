# 📖 RUNBOOK - EVILENT BACKEND OPERATIONS

## 📋 Tabla de Contenidos
1. [Operaciones Diarias](#operaciones-diarias)
2. [Monitoreo y Alertas](#monitoreo-y-alertas)
3. [Mantenimiento](#mantenimiento)
4. [Incident Response](#incident-response)
5. [Escalation](#escalation)
6. [Comandos Útiles](#comandos-útiles)

---

## 📅 Operaciones Diarias

### Morning Checks (9:00 AM)

```bash
#!/bin/bash
# daily-health-check.sh

echo "🌅 EVILENT Backend - Daily Health Check"
echo "========================================"

# 1. Verificar stacks en AWS
echo "1️⃣ Verificando CloudFormation Stacks..."
aws cloudformation list-stacks \
  --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE \
  --query 'StackSummaries[?contains(StackName, `Service`) || contains(StackName, `Iam`)].{Name:StackName,Status:StackStatus}' \
  --output table

# 2. Verificar Lambda functions
echo "2️⃣ Verificando Lambda Functions..."
aws lambda list-functions \
  --query 'Functions[?contains(FunctionName, `Service`)].{Name:FunctionName,Runtime:Runtime,LastModified:LastModified}' \
  --output table

# 3. Verificar API Gateway
echo "3️⃣ Verificando API Gateway..."
USER_API_URL=$(aws cloudformation describe-stacks \
  --stack-name UserServiceStack \
  --query 'Stacks[0].Outputs[?OutputKey==`UserServiceApiUrl`].OutputValue' \
  --output text)

PRODUCT_API_URL=$(aws cloudformation describe-stacks \
  --stack-name ProductServiceStack \
  --query 'Stacks[0].Outputs[?OutputKey==`ProductServiceApiUrl`].OutputValue' \
  --output text)

echo "User Service: $(curl -s -o /dev/null -w '%{http_code}' $USER_API_URL/health)"
echo "Product Service: $(curl -s -o /dev/null -w '%{http_code}' $PRODUCT_API_URL/health)"

# 4. Verificar errores en CloudWatch (últimas 24h)
echo "4️⃣ Verificando errores en CloudWatch..."
aws logs filter-log-events \
  --log-group-name /aws/lambda/UserServiceStack-ServiceUserServiceFunction \
  --filter-pattern "ERROR" \
  --start-time $(date -u -d '24 hours ago' +%s)000 \
  --query 'events[*].message' \
  --output text | wc -l

# 5. Verificar métricas de Lambda
echo "5️⃣ Verificando métricas Lambda (últimas 24h)..."
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Errors \
  --dimensions Name=FunctionName,Value=UserServiceStack-ServiceUserServiceFunction \
  --start-time $(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 86400 \
  --statistics Sum \
  --query 'Datapoints[0].Sum'

echo "✅ Health check completado"
```

### Ejecutar Daily Check
```bash
chmod +x daily-health-check.sh
./daily-health-check.sh
```

---

## 📊 Monitoreo y Alertas

### Métricas Clave

#### 1. Lambda Invocations
```bash
# Ver invocaciones últimas 24h
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=UserServiceStack-ServiceUserServiceFunction \
  --start-time $(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Sum

# Umbral: > 10,000 invocaciones/hora = investigar
```

#### 2. Lambda Errors
```bash
# Ver errores últimas 24h
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Errors \
  --dimensions Name=FunctionName,Value=UserServiceStack-ServiceUserServiceFunction \
  --start-time $(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Sum

# Umbral: > 10 errores/hora = alerta
# Umbral: > 100 errores/hora = incidente crítico
```

#### 3. Lambda Duration
```bash
# Ver duración promedio últimas 24h
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Duration \
  --dimensions Name=FunctionName,Value=UserServiceStack-ServiceUserServiceFunction \
  --start-time $(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Average

# Umbral: > 5000ms promedio = investigar performance
```

#### 4. API Gateway 4xx/5xx
```bash
# Ver errores de API Gateway
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApiGateway \
  --metric-name 5XXError \
  --dimensions Name=ApiName,Value=UserServiceApi \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum

# Umbral: > 5% de requests = incidente
```

### CloudWatch Alarms

#### Crear Alarm para Lambda Errors
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name "UserService-HighErrorRate" \
  --alarm-description "Alert when error rate exceeds 10 errors per hour" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 3600 \
  --evaluation-periods 1 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=UserServiceStack-ServiceUserServiceFunction \
  --alarm-actions arn:aws:sns:eu-central-1:ACCOUNT-ID:alerts-topic
```

#### Crear Alarm para Lambda Duration
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name "UserService-HighLatency" \
  --alarm-description "Alert when average duration exceeds 5 seconds" \
  --metric-name Duration \
  --namespace AWS/Lambda \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 5000 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=UserServiceStack-ServiceUserServiceFunction \
  --alarm-actions arn:aws:sns:eu-central-1:ACCOUNT-ID:alerts-topic
```

---

## 🔧 Mantenimiento

### Mantenimiento Semanal (Domingos 2 AM UTC)

#### 1. Security Scan (Automático)
```yaml
# .github/workflows/security-scan.yml ejecuta automáticamente
# Verifica:
# - npm audit
# - Snyk scan
# - GitLeaks
# - TruffleHog
# - OWASP Top 10

# Revisar resultados en GitHub Actions
```

#### 2. Limpiar Logs Antiguos
```bash
# Eliminar log streams > 30 días
aws logs describe-log-streams \
  --log-group-name /aws/lambda/UserServiceStack-ServiceUserServiceFunction \
  --order-by LastEventTime \
  --descending \
  --query 'logStreams[?lastEventTimestamp < `'$(date -u -d '30 days ago' +%s)000'`].logStreamName' \
  --output text | \
  xargs -I {} aws logs delete-log-stream \
    --log-group-name /aws/lambda/UserServiceStack-ServiceUserServiceFunction \
    --log-stream-name {}
```

#### 3. Revisar Costos AWS
```bash
# Ver costos del mes actual
aws ce get-cost-and-usage \
  --time-period Start=$(date +%Y-%m-01),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics UnblendedCost \
  --group-by Type=SERVICE

# Umbral: > $100/mes = revisar optimizaciones
```

#### 4. Actualizar Dependencias
```bash
# User Service
cd BACKEND/user-service
npm outdated
npm update
npm audit fix
npm test
git commit -am "chore: Update dependencies"

# Product Service
cd BACKEND/product-service
npm outdated
npm update
npm audit fix
npm test
git commit -am "chore: Update dependencies"

git push origin main  # Trigger CI/CD
```

### Mantenimiento Mensual (Primer domingo del mes)

#### 1. Revisar IAM Policies
```bash
# Listar políticas no usadas
aws iam list-policies \
  --scope Local \
  --query 'Policies[?AttachmentCount==`0`].{Name:PolicyName,Arn:Arn}'

# Eliminar políticas no usadas (cuidado!)
# aws iam delete-policy --policy-arn arn:aws:iam::...
```

#### 2. Backup de Base de Datos
```bash
# PostgreSQL (User Service)
pg_dump -h db-endpoint -U postgres evilent_user_service > backup-$(date +%Y%m%d).sql

# Subir a S3
aws s3 cp backup-$(date +%Y%m%d).sql s3://evilent-backups/user-service/

# MongoDB (Product Service)
mongodump --uri="$MONGODB_URI" --out=backup-$(date +%Y%m%d)
tar -czf backup-$(date +%Y%m%d).tar.gz backup-$(date +%Y%m%d)
aws s3 cp backup-$(date +%Y%m%d).tar.gz s3://evilent-backups/product-service/
```

#### 3. Revisar CloudWatch Logs Retention
```bash
# Verificar retención de logs
aws logs describe-log-groups \
  --query 'logGroups[*].{Name:logGroupName,Retention:retentionInDays}'

# Configurar retención a 30 días (reducir costos)
aws logs put-retention-policy \
  --log-group-name /aws/lambda/UserServiceStack-ServiceUserServiceFunction \
  --retention-in-days 30
```

---

## 🚨 Incident Response

### Severidad de Incidentes

| Nivel | Descripción | Tiempo de Respuesta | Ejemplo |
|-------|-------------|---------------------|---------|
| **P0 - Crítico** | Servicio completamente caído | 15 minutos | API 100% down |
| **P1 - Alto** | Funcionalidad crítica afectada | 1 hora | Login no funciona |
| **P2 - Medio** | Funcionalidad degradada | 4 horas | Latencia alta |
| **P3 - Bajo** | Issue menor | 24 horas | Typo en mensaje |

### Playbook: API Gateway Down (P0)

**Síntomas:**
- API retorna 502/503
- CloudWatch muestra 100% errores
- Usuarios no pueden acceder

**Pasos:**
```bash
# 1. Verificar estado del stack
aws cloudformation describe-stacks --stack-name UserServiceStack

# 2. Ver eventos recientes
aws cloudformation describe-stack-events \
  --stack-name UserServiceStack \
  --max-items 20

# 3. Verificar Lambda function
aws lambda get-function --function-name UserServiceStack-ServiceUserServiceFunction

# 4. Ver logs de Lambda (últimos 15 min)
aws logs tail /aws/lambda/UserServiceStack-ServiceUserServiceFunction \
  --since 15m \
  --filter-pattern "ERROR"

# 5. Si Lambda está caída, invocar manualmente para test
aws lambda invoke \
  --function-name UserServiceStack-ServiceUserServiceFunction \
  --payload '{"httpMethod":"GET","path":"/health"}' \
  response.json

# 6. Si falla, rollback a versión anterior
aws cloudformation rollback-stack --stack-name UserServiceStack

# 7. Notificar al equipo
# Slack: #incidents
# Mensaje: "P0: UserService API down. Rollback iniciado. ETA: 10 min"
```

### Playbook: High Error Rate (P1)

**Síntomas:**
- Errores > 10% de requests
- CloudWatch Alarm disparada
- Algunos usuarios afectados

**Pasos:**
```bash
# 1. Identificar patrón de errores
aws logs insights query \
  --log-group-name /aws/lambda/UserServiceStack-ServiceUserServiceFunction \
  --start-time $(date -u -d '1 hour ago' +%s) \
  --end-time $(date -u +%s) \
  --query-string '
    fields @timestamp, @message
    | filter @message like /ERROR/
    | stats count() by @message
    | sort count desc
    | limit 10
  '

# 2. Ver stack trace más común
aws logs filter-log-events \
  --log-group-name /aws/lambda/UserServiceStack-ServiceUserServiceFunction \
  --filter-pattern "ERROR" \
  --start-time $(date -u -d '1 hour ago' +%s)000 \
  --max-items 10

# 3. Reproducir error localmente
cd BACKEND/user-service
npm run test:debug

# 4. Si es bug nuevo, hotfix
git checkout -b hotfix/error-handling
# Fix code
npm test
git commit -am "hotfix: Fix error handling"
git push origin hotfix/error-handling

# 5. Merge y deploy urgente
# GitHub: Create PR → Merge → CI/CD auto-deploy

# 6. Verificar que errores disminuyen
# Monitorear CloudWatch por 30 min
```

### Playbook: Database Connection Issues (P1)

**Síntomas:**
- Errores "Connection timeout"
- Lambda no puede conectar a BD
- Requests fallan con 500

**Pasos:**
```bash
# 1. Verificar estado de RDS
aws rds describe-db-instances \
  --db-instance-identifier evilent-user-service-db \
  --query 'DBInstances[0].DBInstanceStatus'

# 2. Verificar Security Groups
aws ec2 describe-security-groups \
  --group-ids sg-lambda sg-rds

# 3. Test conectividad desde Bastion
ssh -i bastion-key.pem ec2-user@bastion-ip
psql -h db-endpoint -U postgres -d evilent_user_service -c "SELECT 1;"

# 4. Ver conexiones activas
psql -h db-endpoint -U postgres -c "
  SELECT count(*), state
  FROM pg_stat_activity
  GROUP BY state;
"

# 5. Si demasiadas conexiones, matar idle
psql -h db-endpoint -U postgres -c "
  SELECT pg_terminate_backend(pid)
  FROM pg_stat_activity
  WHERE state = 'idle'
  AND state_change < current_timestamp - INTERVAL '10 minutes';
"

# 6. Reiniciar RDS si persiste (último recurso)
aws rds reboot-db-instance --db-instance-identifier evilent-user-service-db
```

---

## 📞 Escalation

### Niveles de Escalation

**Nivel 1: On-Call Engineer**
- Responde a alertas
- Ejecuta playbooks
- Resuelve incidentes P2-P3

**Nivel 2: Senior Engineer**
- Incidentes P1 no resueltos en 1h
- Problemas arquitectónicos
- Decisiones de rollback

**Nivel 3: Tech Lead**
- Incidentes P0 no resueltos en 30min
- Decisiones de infraestructura
- Comunicación con stakeholders

### Contactos

```
On-Call Engineer: +34 XXX XXX XXX (Slack: @oncall)
Senior Engineer: +34 XXX XXX XXX (Slack: @senior-backend)
Tech Lead: +34 XXX XXX XXX (Slack: @tech-lead)

Slack Channels:
- #incidents (P0-P1)
- #backend-support (P2-P3)
- #alerts (CloudWatch alarms)
```

---

## 🛠️ Comandos Útiles

### CloudWatch Logs

```bash
# Tail logs en tiempo real
aws logs tail /aws/lambda/UserServiceStack-ServiceUserServiceFunction --follow

# Buscar errores últimas 24h
aws logs filter-log-events \
  --log-group-name /aws/lambda/UserServiceStack-ServiceUserServiceFunction \
  --filter-pattern "ERROR" \
  --start-time $(date -u -d '24 hours ago' +%s)000

# CloudWatch Insights query
aws logs start-query \
  --log-group-name /aws/lambda/UserServiceStack-ServiceUserServiceFunction \
  --start-time $(date -u -d '1 hour ago' +%s) \
  --end-time $(date -u +%s) \
  --query-string 'fields @timestamp, @message | filter @message like /ERROR/ | sort @timestamp desc | limit 20'
```

### Lambda

```bash
# Invocar función
aws lambda invoke \
  --function-name UserServiceStack-ServiceUserServiceFunction \
  --payload '{"httpMethod":"GET","path":"/health"}' \
  response.json

# Ver configuración
aws lambda get-function-configuration \
  --function-name UserServiceStack-ServiceUserServiceFunction

# Actualizar variables de entorno
aws lambda update-function-configuration \
  --function-name UserServiceStack-ServiceUserServiceFunction \
  --environment Variables={KEY=value}
```

### CloudFormation

```bash
# Ver eventos del stack
aws cloudformation describe-stack-events \
  --stack-name UserServiceStack \
  --max-items 50

# Ver outputs
aws cloudformation describe-stacks \
  --stack-name UserServiceStack \
  --query 'Stacks[0].Outputs'

# Rollback
aws cloudformation rollback-stack --stack-name UserServiceStack
```

### RDS

```bash
# Ver estado
aws rds describe-db-instances \
  --db-instance-identifier evilent-user-service-db

# Reiniciar
aws rds reboot-db-instance \
  --db-instance-identifier evilent-user-service-db

# Crear snapshot
aws rds create-db-snapshot \
  --db-instance-identifier evilent-user-service-db \
  --db-snapshot-identifier manual-backup-$(date +%Y%m%d)
```

---

## 📊 Checklist Post-Incident

Después de resolver un incidente:
- [ ] ✅ Documentar causa raíz
- [ ] ✅ Actualizar runbook con lecciones aprendidas
- [ ] ✅ Crear tickets para prevenir recurrencia
- [ ] ✅ Notificar resolución al equipo
- [ ] ✅ Actualizar métricas de SLA
- [ ] ✅ Post-mortem meeting (P0-P1 solo)

---

**Última actualización:** 2025-11-10  
**Mantenedor:** Skynet-IA  
**On-Call:** Rotation schedule en PagerDuty  
**Status:** ✅ DOCUMENTACIÓN COMPLETA

