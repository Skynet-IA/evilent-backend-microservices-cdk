#!/bin/bash
# ========================================
# Bastion Host User Data Script
# ========================================
# Script robusto para Bastion Host - Sin set -e para permitir continuidad

# Variables de entorno
export PATH=$PATH:/usr/local/bin:/opt/node/bin:/usr/bin
export AWS_DEFAULT_REGION=__AWS_REGION__
export DEBIAN_FRONTEND=noninteractive

# Logging completo (sin truncación para debug)
exec > >(tee /var/log/user-data.log)
exec 2>&1
echo "=== Bastion Host Setup Started at $(date) ==="
echo "User: $(whoami) | Arch: $(uname -m)"

# ✅ SSM Agent - Usar repo default (ya pre-instalado en AL2023)
echo "🔧 Verificando SSM Agent..."
if ! systemctl is-active --quiet amazon-ssm-agent; then
  echo "  SSM Agent no activo, instalando..."
  dnf install -y amazon-ssm-agent 2>&1 || yum install -y amazon-ssm-agent 2>&1 || echo "⚠️ SSM Agent install warning"
fi
systemctl enable amazon-ssm-agent 2>/dev/null || true
systemctl start amazon-ssm-agent 2>/dev/null || true
echo "✅ SSM Agent verificado"

# Actualizar sistema
echo "📦 Actualizando sistema..."
dnf update -y 2>&1 | tail -5 || yum update -y 2>&1 | tail -5 || true
echo "✅ System actualizado"

# ✅ Node.js (AL2023 tiene versión nativa)
echo "🔧 Instalando Node.js..."
dnf install -y nodejs npm 2>&1 | tail -10 || yum install -y nodejs npm 2>&1 | tail -10 || echo "⚠️ Node.js warning"
node --version
npm --version
echo "✅ Node.js instalado"

# ✅ PostgreSQL Client - FIJADO: Limpiar repos primero
echo "🔧 Limpiando cache de repos..."
dnf clean all 2>/dev/null && dnf makecache 2>&1 | tail -3 || true
echo "🔧 Instalando PostgreSQL 15 client..."
dnf install -y postgresql15 2>&1 || yum install -y postgresql15 2>&1 || echo "❌ postgresql15 no disponible"
if command -v psql &> /dev/null; then
  echo "✅ psql instalado: $(psql --version)"
else
  echo "⚠️ psql no disponible en repos"
fi
echo "✅ PostgreSQL client procesado"

# ✅ db-migrate - INSTALACIÓN COMPLETA AUTOMÁTICA
echo "🔧 Instalando db-migrate desde S3..."
# Limpiar y preparar directorio
rm -rf /home/ssm-user/node_modules /home/ssm-user/package.json /home/ssm-user/database.json /home/ssm-user/migrations/* 2>/dev/null || true
mkdir -p /home/ssm-user/migrations
echo "✅ Entorno preparado"
# Descargar paquetes de db-migrate
echo "📦 Descargando db-migrate desde S3..."
if aws s3 cp s3://evilent-bastion-tools/db-migrate-packages.tar.gz /tmp/db-migrate-packages.tar.gz --region $AWS_DEFAULT_REGION 2>/dev/null; then
  echo "📦 Extrayendo paquetes..."
  cd /home/ssm-user
  tar -xzf /tmp/db-migrate-packages.tar.gz
  rm /tmp/db-migrate-packages.tar.gz
  echo "✅ db-migrate instalado desde S3"
else
  echo "⚠️ Falló descarga S3 - intentando instalación manual"
  cd /home/ssm-user
  npm install db-migrate db-migrate-pg --timeout=300000 2>&1 | tail -5
fi
# Descargar configuración de base de datos
echo "📄 Descargando configuración database.json..."
if aws s3 cp s3://evilent-bastion-tools/database.json /home/ssm-user/database.json --region $AWS_DEFAULT_REGION 2>/dev/null; then
  echo "✅ database.json descargado"
else
  echo "❌ Error descargando database.json"
fi
# Descargar archivos de migración
echo "🚀 Descargando archivos de migración..."
if aws s3 cp s3://evilent-bastion-tools/migrations/ /home/ssm-user/migrations/ --recursive --region $AWS_DEFAULT_REGION 2>/dev/null; then
  echo "✅ Archivos de migración descargados"
  ls -la /home/ssm-user/migrations/
else
  echo "❌ Error descargando migraciones"
fi
echo "✅ Instalación completa de db-migrate finalizada"

# ✅ jq (para JSON parsing)
echo "🔧 Instalando jq..."
dnf install -y jq 2>&1 | tail -3 || yum install -y jq 2>&1 | tail -3 || echo "⚠️ jq warning"
jq --version
echo "✅ jq instalado"

# ⭐ Script de migración automático - SOLUCIÓN: Credenciales pasadas desde fuera
echo "📝 Creando script de migración..."
mkdir -p /home/ssm-user/migrations
cat > /home/ssm-user/run-migrations.sh << 'MIGRATIONEOF'
#!/bin/bash
set -e
echo "🔍 Credenciales deben ser pasadas como variables de entorno"
echo "   Uso: DB_ENDPOINT=host DB_USER=user DB_PASSWORD=pass DB_NAME=db ./run-migrations.sh"
echo ""
echo "📋 Verificando variables de entorno..."
if [ -z "$DB_ENDPOINT" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ]; then
  echo "❌ ERROR: Variables de entorno faltantes"
  echo "   Necesario: DB_ENDPOINT, DB_USER, DB_PASSWORD, DB_NAME"
  echo ""
  echo "💡 Solución desde local:"
  echo "   make bastion-migrate"
  exit 1
fi
echo "✅ Variables de entorno verificadas"
echo "⏳ Ejecutando migraciones..."
cd /home/ssm-user && npx db-migrate up --env production --no-color
echo "✅ Migraciones completadas!"
MIGRATIONEOF
chmod +x /home/ssm-user/run-migrations.sh
echo "✅ Script de migración creado"

# Verificación final - SIN truncación
echo ""
echo "=== ✅ Bastion Host Setup Completed at $(date) ==="
echo ""
echo "📊 Status Summary:"
echo "  SSM Agent: $(systemctl is-active amazon-ssm-agent)"
echo "  Node.js: $(node --version 2>/dev/null || echo "not found")"
echo "  npm: $(npm --version 2>/dev/null || echo "not found")"
echo "  psql: $(psql --version 2>/dev/null || echo "not available")"
echo "  jq: $(jq --version 2>/dev/null || echo "not found")"
echo "  db-migrate: $(npx db-migrate --version 2>/dev/null || echo "check manually: cd /home/ssm-user && npx db-migrate --version")"
echo ""
echo "🚀 Migration script: /home/ssm-user/run-migrations.sh"
echo "📋 Full logs: /var/log/user-data.log"
echo "=== End of User Data Setup ==="
