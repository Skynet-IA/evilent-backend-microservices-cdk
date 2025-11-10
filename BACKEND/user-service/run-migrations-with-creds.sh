#!/bin/bash
# ============================================
# run-migrations-with-creds.sh
# Ejecutar migraciones automáticamente con credenciales desde Secrets Manager
# ============================================

set -e

echo "🚀 EJECUTANDO MIGRACIONES AUTOMÁTICAS"
echo "====================================="

# Obtener el ID del bastion
BASTION_ID=$(aws cloudformation describe-stacks \
  --stack-name UserServiceStack \
  --region eu-central-1 \
  --query 'Stacks[0].Outputs[?contains(OutputKey, `BastionHostInstanceId`)].OutputValue' \
  --output text)

if [ -z "$BASTION_ID" ]; then
  echo "❌ Error: Bastion no encontrado"
  exit 1
fi

echo "✅ Bastion: $BASTION_ID"

# Obtener credenciales
SECRET_ARN=$(aws cloudformation describe-stacks \
  --stack-name UserServiceStack \
  --region eu-central-1 \
  --query 'Stacks[0].Outputs[?OutputKey==`DatabaseDatabaseSecretArn884B6F93`].OutputValue' \
  --output text)

if [ -z "$SECRET_ARN" ]; then
  echo "❌ Error: Secret ARN no encontrado"
  exit 1
fi

SECRET_JSON=$(aws secretsmanager get-secret-value \
  --secret-id "$SECRET_ARN" \
  --region eu-central-1 \
  --query 'SecretString' \
  --output text)

DB_ENDPOINT=$(echo "$SECRET_JSON" | jq -r '.host')
DB_USER=$(echo "$SECRET_JSON" | jq -r '.username')
DB_PASSWORD=$(echo "$SECRET_JSON" | jq -r '.password')
DB_NAME="postgres"

echo "✅ Credenciales obtenidas"

# Ejecutar migraciones
echo ""
echo "⏳ Ejecutando migraciones..."
COMMAND_ID=$(aws ssm send-command \
  --instance-ids "$BASTION_ID" \
  --document-name "AWS-RunShellScript" \
  --parameters "commands=[
    \"cd /home/ssm-user\",
    \"export DB_ENDPOINT=$DB_ENDPOINT\",
    \"export DB_USER=$DB_USER\",
    \"export DB_PASSWORD='$DB_PASSWORD'\",
    \"export PGPASSWORD='$DB_PASSWORD'\",
    \"echo \\\"🚀 Usando base de datos postgres por defecto...\\\"\",
    \"export DB_NAME=postgres\",
    \"echo \\\"🚀 Ejecutando migraciones en postgres...\\\"\",
    \"cd /home/ssm-user/db-migrate\",
    \"export DATABASE_URL=postgres://\$DB_USER:\$DB_PASSWORD@\$DB_ENDPOINT:5432/\$DB_NAME\",
    \"echo \\\"DATABASE_URL configurada\\\"\",
    \"npm install\",
    \"echo \\\"Dependencias instaladas\\\"\",
    \"./node_modules/.bin/db-migrate up\",
    \"echo \\\"✅ Migraciones completadas\\\" || echo \\\"❌ Error en migraciones\\\"\"
  ]" \
  --region eu-central-1 \
  --timeout-seconds 300 \
  --query 'Command.CommandId' \
  --output text)

echo "📊 Comando ID: $COMMAND_ID"

# Esperar y obtener resultado
sleep 30
OUTPUT=$(aws ssm get-command-invocation \
  --command-id "$COMMAND_ID" \
  --instance-id "$BASTION_ID" \
  --region eu-central-1 \
  --query 'StandardOutputContent' \
  --output text)

echo "📋 Resultado:"
echo "$OUTPUT"

# Verificar éxito
if echo "$OUTPUT" | grep -q -E "(Done|✅ Migraciones completadas)"; then
  echo ""
  echo "✅ ¡MIGRACIONES COMPLETADAS EXITOSAMENTE!"
  echo "🎉 Sistema listo para usar"
else
  echo ""
  echo "❌ Error en migraciones"
  echo "📋 Output completo:"
  echo "$OUTPUT"
  exit 1
fi
