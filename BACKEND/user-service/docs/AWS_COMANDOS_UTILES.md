# 🛠️ Comandos Útiles de AWS - User Service

Comandos esenciales para gestionar tu stack sin necesidad de ir a la consola web de AWS.
cat /var/log/user-data.log

# Detener Bastion (ahorro $6/mes)
aws ec2 stop-instances --instance-ids i-xxxxx

# Iniciar Bastion cuando necesites migraciones
aws ec2 start-instances --instance-ids i-xxxxx

# Dentro del bastion:
cd /home/ssm-user
npx db-migrate --version --no-color
# o
npx db-migrate --version --no-colors
nano /home/ssm-user/run-migrations.sh
---

## 📋 Índice

1. [CloudWatch Logs](#cloudwatch-logs)
2. [CloudFormation Stack](#cloudformation-stack)
3. [Lambda Functions](#lambda-functions)
4. [RDS Database](#rds-database)
5. [VPC y Networking](#vpc-y-networking)
6. [Secrets Manager](#secrets-manager)
7. [Costos y Billing](#costos-y-billing)

---

## 📜 CloudWatch Logs

### Listar todos los log groups del stack
```bash
aws logs describe-log-groups \
  --log-group-name-prefix "/aws/lambda/UserServiceStack" \
  --region eu-central-1 \
  --query 'logGroups[*].[logGroupName, storedBytes, retentionInDays]' \
  --output table
```

### Eliminar todos los log groups del stack
```bash
aws logs describe-log-groups \
  --log-group-name-prefix "/aws/lambda/UserServiceStack" \
  --region eu-central-1 \
  --query 'logGroups[*].logGroupName' \
  --output text | tr '\t' '\n' | while read LOG_GROUP; do
    echo "🗑️  Eliminando: $LOG_GROUP"
    aws logs delete-log-group --log-group-name "$LOG_GROUP" --region eu-central-1
done
```

### Ver logs en tiempo real
```bash
# Reemplaza LOG_GROUP_NAME con el nombre real
aws logs tail "/aws/lambda/UserServiceStack-UserService..." \
  --follow \
  --region eu-central-1
```

### Ver últimos logs (últimas 2 horas)
```bash
aws logs tail "/aws/lambda/UserServiceStack-UserService..." \
  --since 2h \
  --region eu-central-1
```

### Buscar en logs (query)
```bash
aws logs filter-log-events \
  --log-group-name "/aws/lambda/UserServiceStack-UserService..." \
  --filter-pattern "ERROR" \
  --region eu-central-1 \
  --query 'events[*].message' \
  --output text
```

---

## 🏗️ CloudFormation Stack

### Ver estado del stack
```bash
aws cloudformation describe-stacks \
  --stack-name UserServiceStack \
  --region eu-central-1 \
  --query 'Stacks[0].StackStatus' \
  --output text
```

### Ver todos los outputs del stack
```bash
aws cloudformation describe-stacks \
  --stack-name UserServiceStack \
  --region eu-central-1 \
  --query 'Stacks[0].Outputs' \
  --output table
```

### Ver recursos del stack
```bash
aws cloudformation list-stack-resources \
  --stack-name UserServiceStack \
  --region eu-central-1 \
  --query 'StackResourceSummaries[*].[ResourceType, LogicalResourceId, ResourceStatus]' \
  --output table
```

### Ver eventos recientes del stack
```bash
aws cloudformation describe-stack-events \
  --stack-name UserServiceStack \
  --region eu-central-1 \
  --max-items 20 \
  --query 'StackEvents[*].[Timestamp, ResourceStatus, ResourceType, LogicalResourceId]' \
  --output table
```

### Ver recursos que NO se han eliminado
```bash
aws cloudformation list-stack-resources \
  --stack-name UserServiceStack \
  --region eu-central-1 \
  --query 'StackResourceSummaries[?ResourceStatus!=`DELETE_COMPLETE`].[ResourceType, LogicalResourceId, ResourceStatus]' \
  --output table
```

### Eliminar stack (forzado)
```bash
aws cloudformation delete-stack \
  --stack-name UserServiceStack \
  --region eu-central-1
```

---

## 🔧 Lambda Functions

### Listar todas las Lambdas del stack
```bash
aws lambda list-functions \
  --region eu-central-1 \
  --query 'Functions[?contains(FunctionName, `UserServiceStack`)].{Name:FunctionName, Runtime:Runtime, Memory:MemorySize, Timeout:Timeout}' \
  --output table
```

### Ver configuración de una Lambda
```bash
aws lambda get-function \
  --function-name UserServiceStack-UserService... \
  --region eu-central-1 \
  --query 'Configuration.[State, LastUpdateStatus, VpcConfig, Environment]' \
  --output json
```

### Invocar Lambda manualmente
```bash
aws lambda invoke \
  --function-name UserServiceStack-UserService... \
  --payload '{"httpMethod":"GET","path":"/user","headers":{}}' \
  --region eu-central-1 \
  /tmp/lambda-response.json && cat /tmp/lambda-response.json | jq .
```

### Ver métricas de Lambda (últimas 24h)
```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=UserServiceStack-UserService... \
  --start-time $(date -u -v-24H +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Sum \
  --region eu-central-1
```

---

## 🗄️ RDS Database

### Listar instancias RDS
```bash
aws rds describe-db-instances \
  --region eu-central-1 \
  --query 'DBInstances[*].[DBInstanceIdentifier, DBInstanceStatus, Engine, DBInstanceClass, MultiAZ, AvailabilityZone]' \
  --output table
```

### Ver detalles de instancia RDS específica
```bash
aws rds describe-db-instances \
  --db-instance-identifier <YOUR_DB_INSTANCE_ID> \
  --region eu-central-1 \
  --query 'DBInstances[0]' \
  --output json
```

### Ver endpoint de conexión
```bash
aws rds describe-db-instances \
  --db-instance-identifier <YOUR_DB_INSTANCE_ID> \
  --region eu-central-1 \
  --query 'DBInstances[0].[Endpoint.Address, Endpoint.Port]' \
  --output text
```

### Ver snapshots de RDS
```bash
aws rds describe-db-snapshots \
  --db-instance-identifier <YOUR_DB_INSTANCE_ID> \
  --region eu-central-1 \
  --query 'DBSnapshots[*].[DBSnapshotIdentifier, SnapshotCreateTime, Status, AllocatedStorage]' \
  --output table
```

### Eliminar snapshot específico
```bash
aws rds delete-db-snapshot \
  --db-snapshot-identifier snapshot-name \
  --region eu-central-1
```

---

## 🌐 VPC y Networking

### Listar VPCs
```bash
aws ec2 describe-vpcs \
  --region eu-central-1 \
  --query 'Vpcs[*].[VpcId, CidrBlock, Tags[?Key==`Name`].Value|[0]]' \
  --output table
```

### Ver subnets de una VPC
```bash
aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=vpc-..." \
  --region eu-central-1 \
  --query 'Subnets[*].[SubnetId, CidrBlock, AvailabilityZone, MapPublicIpOnLaunch]' \
  --output table
```

### Ver Security Groups
```bash
aws ec2 describe-security-groups \
  --filters "Name=vpc-id,Values=vpc-..." \
  --region eu-central-1 \
  --query 'SecurityGroups[*].[GroupId, GroupName, Description]' \
  --output table
```

### Ver VPC Endpoints
```bash
aws ec2 describe-vpc-endpoints \
  --region eu-central-1 \
  --query 'VpcEndpoints[*].[VpcEndpointId, ServiceName, State, VpcId]' \
  --output table
```

### Eliminar VPC Endpoints huérfanos
```bash
aws ec2 describe-vpc-endpoints \
  --region eu-central-1 \
  --query 'VpcEndpoints[?State==`available`].VpcEndpointId' \
  --output text | tr '\t' '\n' | while read ENDPOINT_ID; do
    echo "🗑️  Eliminando VPC Endpoint: $ENDPOINT_ID"
    aws ec2 delete-vpc-endpoints --vpc-endpoint-ids "$ENDPOINT_ID" --region eu-central-1
done
```

---

## 🖥️ Bastion Host & SSM Session Manager

### Verificar estado del Bastion Host
```bash
# Obtener Instance ID del Bastion desde CloudFormation
aws cloudformation describe-stacks \
  --stack-name UserServiceStack \
  --region eu-central-1 \
  --query 'Stacks[0].Outputs[?contains(OutputKey, `BastionInstanceId`)].OutputValue' \
  --output text
```

### Verificar si el Bastion está registrado en SSM
```bash
# Obtener automáticamente el Instance ID y verificar en SSM
INSTANCE_ID=$(aws cloudformation describe-stacks \
  --stack-name UserServiceStack \
  --region eu-central-1 \
  --query 'Stacks[0].Outputs[?contains(OutputKey, `BastionInstanceId`)].OutputValue' \
  --output text)

aws ssm describe-instance-information \
  --region eu-central-1 \
  --filters "Key=InstanceIds,Values=$INSTANCE_ID" \
  --output json
```

### Verificar todos los endpoints registrados en SSM
```bash
aws ssm describe-instance-information \
  --region eu-central-1 \
  --query 'InstanceInformationList[*].[InstanceId, PingStatus, PlatformType, PlatformName]' \
  --output table
```

### Verificar estado del SSM Agent en la instancia
```bash
# Obtener automáticamente el Instance ID y verificar SSM Agent
INSTANCE_ID=$(aws cloudformation describe-stacks \
  --stack-name UserServiceStack \
  --region eu-central-1 \
  --query 'Stacks[0].Outputs[?contains(OutputKey, `BastionInstanceId`)].OutputValue' \
  --output text)

aws ssm send-command \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["systemctl status amazon-ssm-agent"]' \
  --instance-ids $INSTANCE_ID \
  --region eu-central-1 \
  --output text
```

### Ver resultado de un comando SSM
```bash
# Reemplaza COMMAND_ID e INSTANCE_ID con los valores reales
aws ssm get-command-invocation \
  --command-id COMMAND_ID \
  --instance-id INSTANCE_ID \
  --region eu-central-1 \
  --query 'StandardOutputContent' \
  --output text
```

### Conectar al Bastion via SSM Session Manager
```bash
# Obtener automáticamente el Instance ID y conectar
INSTANCE_ID=$(aws cloudformation describe-stacks \
  --stack-name UserServiceStack \
  --region eu-central-1 \
  --query 'Stacks[0].Outputs[?contains(OutputKey, `BastionInstanceId`)].OutputValue' \
  --output text)

aws ssm start-session \
  --target $INSTANCE_ID \
  --region eu-central-1
```

### Verificar VPC Endpoints para SSM
```bash
# Ver todos los VPC endpoints
aws ec2 describe-vpc-endpoints \
  --region eu-central-1 \
  --query 'VpcEndpoints[*].[VpcEndpointId, ServiceName, State, VpcId]' \
  --output table
```

### Verificar VPC Endpoints específicos para SSM
```bash
# Verificar los 3 endpoints críticos para SSM Session Manager
aws ec2 describe-vpc-endpoints \
  --region eu-central-1 \
  --filters "Name=service-name,Values=com.amazonaws.eu-central-1.ssm,com.amazonaws.eu-central-1.ec2messages,com.amazonaws.eu-central-1.ssmmessages" \
  --output table
```

### Ver logs del User Data del Bastion
```bash
# Obtener automáticamente el Instance ID y ver logs
INSTANCE_ID=$(aws cloudformation describe-stacks \
  --stack-name UserServiceStack \
  --region eu-central-1 \
  --query 'Stacks[0].Outputs[?contains(OutputKey, `BastionInstanceId`)].OutputValue' \
  --output text)

COMMAND_ID=$(aws ssm send-command \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["cat /var/log/user-data.log"]' \
  --instance-ids $INSTANCE_ID \
  --region eu-central-1 \
  --query 'Command.CommandId' \
  --output text)

echo "Command ID: $COMMAND_ID"
echo "Esperando 5 segundos..."
sleep 5

aws ssm get-command-invocation \
  --command-id $COMMAND_ID \
  --instance-id $INSTANCE_ID \
  --region eu-central-1 \
  --query 'StandardOutputContent' \
  --output text
```

### Reiniciar SSM Agent en el Bastion
```bash
# Obtener automáticamente el Instance ID y reiniciar SSM Agent
INSTANCE_ID=$(aws cloudformation describe-stacks \
  --stack-name UserServiceStack \
  --region eu-central-1 \
  --query 'Stacks[0].Outputs[?contains(OutputKey, `BastionInstanceId`)].OutputValue' \
  --output text)

aws ssm send-command \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["sudo systemctl restart amazon-ssm-agent && systemctl status amazon-ssm-agent"]' \
  --instance-ids $INSTANCE_ID \
  --region eu-central-1 \
  --output text
```

### Ejecutar migraciones de base de datos via Bastion
```bash
# Obtener automáticamente el Instance ID y ejecutar migraciones
INSTANCE_ID=$(aws cloudformation describe-stacks \
  --stack-name UserServiceStack \
  --region eu-central-1 \
  --query 'Stacks[0].Outputs[?contains(OutputKey, `BastionInstanceId`)].OutputValue' \
  --output text)

COMMAND_ID=$(aws ssm send-command \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["cd /tmp && npx db-migrate up --env production 2>&1"]' \
  --instance-ids $INSTANCE_ID \
  --region eu-central-1 \
  --query 'Command.CommandId' \
  --output text)

echo "Command ID: $COMMAND_ID"
echo "Esperando 10 segundos..."
sleep 10

aws ssm get-command-invocation \
  --command-id $COMMAND_ID \
  --instance-id $INSTANCE_ID \
  --region eu-central-1 \
  --query 'StandardOutputContent' \
  --output text
```

---

## 🔐 Secrets Manager

### Listar secrets
```bash
aws secretsmanager list-secrets \
  --region eu-central-1 \
  --query 'SecretList[*].[Name, ARN, LastChangedDate]' \
  --output table
```

### Ver valor de un secret (credenciales DB)
```bash
aws secretsmanager get-secret-value \
  --secret-id evilent/user-service/db-credentials \
  --region eu-central-1 \
  --query 'SecretString' \
  --output text | jq .
```

### Eliminar secret específico
```bash
aws secretsmanager delete-secret \
  --secret-id evilent/user-service/db-credentials \
  --region eu-central-1 \
  --force-delete-without-recovery
```

---

## 💰 Costos y Billing

### Ver costos del mes actual por servicio
```bash
aws ce get-cost-and-usage \
  --time-period Start=$(date -u +%Y-%m-01),End=$(date -u +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics "UnblendedCost" \
  --group-by Type=DIMENSION,Key=SERVICE \
  --query 'ResultsByTime[0].Groups[?Metrics.UnblendedCost.Amount>`0`].[Keys[0], Metrics.UnblendedCost.Amount]' \
  --output table
```

### Ver costos diarios (últimos 7 días)
```bash
aws ce get-cost-and-usage \
  --time-period Start=$(date -u -v-7d +%Y-%m-%d),End=$(date -u +%Y-%m-%d) \
  --granularity DAILY \
  --metrics "UnblendedCost" \
  --query 'ResultsByTime[*].[TimePeriod.Start, Total.UnblendedCost.Amount]' \
  --output table
```

### Ver forecast de costos (próximos 30 días)
```bash
aws ce get-cost-forecast \
  --time-period Start=$(date -u +%Y-%m-%d),End=$(date -u -v+30d +%Y-%m-%d) \
  --metric UNBLENDED_COST \
  --granularity MONTHLY \
  --query '[ForecastResultsByTime[0].MeanValue, ForecastResultsByTime[0].TimePeriod]' \
  --output table
```

---

## 🧹 Limpieza Completa del Stack

### Script completo para eliminar todo
```bash
#!/bin/bash

STACK_NAME="UserServiceStack"
REGION="eu-central-1"

echo "🗑️  Eliminando stack..."
aws cloudformation delete-stack \
  --stack-name $STACK_NAME \
  --region $REGION

echo "⏳ Esperando eliminación del stack..."
aws cloudformation wait stack-delete-complete \
  --stack-name $STACK_NAME \
  --region $REGION

echo "🗑️  Eliminando log groups..."
aws logs describe-log-groups \
  --log-group-name-prefix "/aws/lambda/$STACK_NAME" \
  --region $REGION \
  --query 'logGroups[*].logGroupName' \
  --output text | tr '\t' '\n' | while read LOG_GROUP; do
    echo "   Eliminando: $LOG_GROUP"
    aws logs delete-log-group --log-group-name "$LOG_GROUP" --region $REGION
done

echo "✅ Limpieza completa!"
```

---

## 🚀 Comandos Rápidos (Aliases Útiles)

Agrega estos aliases a tu `~/.zshrc` o `~/.bashrc`:

```bash
# CloudWatch Logs
alias aws-logs-list='aws logs describe-log-groups --region eu-central-1 --query "logGroups[*].[logGroupName, storedBytes]" --output table'
alias aws-logs-clean='aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/UserServiceStack" --region eu-central-1 --query "logGroups[*].logGroupName" --output text | tr "\t" "\n" | while read LOG_GROUP; do aws logs delete-log-group --log-group-name "$LOG_GROUP" --region eu-central-1; done'

# Stack Status
alias aws-stack-status='aws cloudformation describe-stacks --stack-name UserServiceStack --region eu-central-1 --query "Stacks[0].StackStatus" --output text'
alias aws-stack-outputs='aws cloudformation describe-stacks --stack-name UserServiceStack --region eu-central-1 --query "Stacks[0].Outputs" --output table'

# RDS
alias aws-rds-list='aws rds describe-db-instances --region eu-central-1 --query "DBInstances[*].[DBInstanceIdentifier, DBInstanceStatus, Engine]" --output table'

# Costos
alias aws-cost-month='aws ce get-cost-and-usage --time-period Start=$(date -u +%Y-%m-01),End=$(date -u +%Y-%m-%d) --granularity MONTHLY --metrics "UnblendedCost" --query "ResultsByTime[0].Total.UnblendedCost.Amount" --output text'
```

---

## 📝 Notas Importantes

### Región
Todos los comandos usan `--region eu-central-1`. Si tu región es diferente, cámbiala en cada comando.

### Permisos IAM
Asegúrate de tener los permisos necesarios:
- `logs:*` para CloudWatch
- `cloudformation:*` para stacks
- `lambda:*` para funciones
- `rds:*` para bases de datos
- `ec2:*` para VPC/networking

### Costos
- CloudWatch Logs: ~$0.50/GB ingesta + $0.03/GB-mes almacenamiento
- VPC Endpoints: ~$7/mes por endpoint
- RDS: Según instancia y storage

---

**Última actualización:** 2025-10-24  
**Región por defecto:** eu-central-1  
**Stack:** UserServiceStack

