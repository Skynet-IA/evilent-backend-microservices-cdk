# 🔧 Configuración Centralizada del Proyecto

## 📋 Descripción

El proyecto utiliza un sistema de configuración centralizada que permite personalizar el comportamiento de la infraestructura mediante variables de entorno. Todas las constantes están definidas en `src/config/constants.ts` y pueden ser sobreescritas mediante variables de entorno.

## 🌍 Variables de Entorno Disponibles

### Configuración Regional
```bash
# Región de AWS donde desplegar (afecta VPC endpoints, etc.)
AWS_REGION=eu-central-1
```

### Configuración de Infraestructura
```bash
# VPC
VPC_CIDR=10.0.0.0/16

# Base de Datos
DEFAULT_STORAGE_GB=20
DEFAULT_MAX_STORAGE_GB=100
DEFAULT_BACKUP_RETENTION_DEV=0
DEFAULT_BACKUP_RETENTION_PROD=7

# Bastion Host
DEFAULT_BASTION_STORAGE_GB=20

# Lambda Functions
LAMBDA_TIMEOUT_SECONDS=30
LAMBDA_MEMORY_MB=512
LAMBDA_EPHEMERAL_STORAGE_MB=512

# API Gateway
API_GATEWAY_THROTTLING_RATE_LIMIT=50
API_GATEWAY_THROTTLING_BURST_LIMIT=100
```

### Nomenclatura y Entorno
```bash
PROJECT_NAME=evilent
ENVIRONMENT=dev
```

### Logging y Debug
```bash
EVILENT_DEBUG_LOGS=true  # Opcional: habilita logs de debug (por defecto: false)
```

## 🚀 Uso

### Desarrollo (valores por defecto)
```bash
npm run build
cdk deploy
```

### Producción (variables de entorno)
```bash
export AWS_REGION=us-east-1
export ENVIRONMENT=prod
export DEFAULT_BACKUP_RETENTION_PROD=30
export ENABLE_DETAILED_MONITORING=true

npm run build
cdk deploy
```

### Multi-región
```bash
# Europa
export AWS_REGION=eu-central-1
cdk deploy

# Estados Unidos
export AWS_REGION=us-east-1
cdk deploy
```

## 📊 Regiones Soportadas

| Región | Prefix List S3 | Estado |
|--------|----------------|--------|
| eu-central-1 | pl-6ea54007 | ✅ Completo |
| us-east-1 | pl-63a5400a | ✅ Configurado |
| us-west-2 | pl-02cd2c6b | ✅ Configurado |

Para agregar soporte a nuevas regiones, simplemente agregar la entrada correspondiente en `S3_PREFIX_LISTS` en `constants.ts`.

## 🔧 Arquitectura

```
src/config/constants.ts
├── Variables de entorno
├── Constantes calculadas
├── Utilidades de configuración
└── Validaciones
```

## ⚠️ Notas Importantes

- **Valores por defecto**: Si no se especifica una variable de entorno, se usan valores apropiados para producción
- **Validación**: La configuración incluye validación con Zod para type-safety completo
- **Flexibilidad**: Todas las constantes pueden ser sobreescritas según necesidades del proyecto
- **Producción-first**: La configuración está optimizada para despliegue directo en producción
