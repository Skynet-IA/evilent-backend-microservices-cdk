# 🏗️ EVILENT Backend Microservices (AWS CDK)

[![AWS CDK](https://img.shields.io/badge/AWS-CDK-orange)](https://aws.amazon.com/cdk/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-Private-red)](LICENSE)

Arquitectura de microservicios serverless para EVILENT, construida con AWS CDK, TypeScript y siguiendo principios enterprise-grade.

---

## 📋 Tabla de Contenidos

- [Arquitectura](#-arquitectura)
- [Servicios](#-servicios)
- [Requisitos](#-requisitos)
- [Setup Inicial](#-setup-inicial)
- [Comandos Principales](#-comandos-principales)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Documentación](#-documentación)
- [Características](#-características)
- [Contribuir](#-contribuir)

---

## 🏛️ Arquitectura

Este monorepo contiene 3 microservicios independientes que comparten políticas IAM centralizadas:

```
┌─────────────────────────────────────────────────────────────────┐
│                      AWS CLOUD                                  │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ IAM Policies │  │ User Service │  │Product Service│        │
│  │   (Shared)   │  │  (PostgreSQL)│  │  (MongoDB)   │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│         │                  │                  │                │
│         └──────────────────┴──────────────────┘                │
│                            │                                    │
│                   ┌────────▼────────┐                          │
│                   │  API Gateway    │                          │
│                   │  (Cognito Auth) │                          │
│                   └─────────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Servicios

### 1. **iam-policies** (Políticas IAM Compartidas)
- **Descripción:** Políticas IAM centralizadas para developers
- **Tecnologías:** AWS CDK, IAM
- **Documentación:** [iam-policies/README.md](./iam-policies/README.md)
- **Comandos:**
  ```bash
  cd iam-policies
  make help
  ```

### 2. **user-service** (Gestión de Usuarios)
- **Descripción:** Microservicio de autenticación y perfiles de usuario
- **Tecnologías:** AWS Lambda, API Gateway, PostgreSQL RDS, Cognito
- **Base de Datos:** PostgreSQL (AWS RDS)
- **Autenticación:** AWS Cognito (JWT)
- **Documentación:** [user-service/README.md](./user-service/README.md)
- **Comandos:**
  ```bash
  cd user-service
  make help
  ```

### 3. **product-service** (Gestión de Productos)
- **Descripción:** Microservicio de productos, categorías y deals
- **Tecnologías:** AWS Lambda, API Gateway, MongoDB, S3
- **Base de Datos:** MongoDB (Atlas)
- **Autenticación:** AWS Cognito (JWT)
- **Documentación:** [product-service/README.md](./product-service/README.md)
- **Comandos:**
  ```bash
  cd product-service
  make help
  ```

---

## 🛠️ Requisitos

### Software Requerido

| Herramienta | Versión Mínima | Propósito |
|-------------|----------------|-----------|
| **Node.js** | 20.x | Runtime de TypeScript |
| **npm** | 10.x | Gestor de paquetes |
| **AWS CLI** | 2.x | Interacción con AWS |
| **AWS CDK** | 2.x | Infraestructura como código |
| **TypeScript** | 5.x | Lenguaje de programación |
| **Make** | 3.x | Automatización de comandos |
| **PostgreSQL Client** | 15.x | Cliente de base de datos (user-service) |
| **MongoDB Compass** | Latest | Cliente de base de datos (product-service) |

### Instalación de Requisitos

```bash
# Node.js (usando nvm)
nvm install 20
nvm use 20

# AWS CLI
brew install awscli  # macOS
# o
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"  # Linux

# AWS CDK
npm install -g aws-cdk

# TypeScript
npm install -g typescript

# PostgreSQL Client (opcional, solo para user-service)
brew install postgresql@15  # macOS
```

### Configuración de AWS

```bash
# Configurar credenciales AWS
aws configure

# Verificar configuración
aws sts get-caller-identity

# Bootstrap CDK (solo primera vez)
cdk bootstrap aws://ACCOUNT-ID/REGION
```

---

## 🚀 Setup Inicial

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Skynet-IA/evilent-backend-microservices-cdk.git
cd evilent-backend-microservices-cdk
```

### 2. Instalar Dependencias (Todos los Servicios)

```bash
# IAM Policies
cd iam-policies && npm install && cd ..

# User Service
cd user-service && npm install && cd ..

# Product Service
cd product-service && npm install && cd ..
```

### 3. Configurar Variables de Entorno

Cada servicio requiere variables de entorno específicas. Ver documentación individual:
- [user-service/README.md#configuración](./user-service/README.md)
- [product-service/README.md#configuración](./product-service/README.md)

### 4. Deploy en Orden

```bash
# 1. Primero: IAM Policies (opcional, pero recomendado)
cd iam-policies
make deploy
cd ..

# 2. Segundo: User Service
cd user-service
make deploy COGNITO_POOL_ID=<tu-pool-id> COGNITO_APP_CLIENT_ID=<tu-client-id>
cd ..

# 3. Tercero: Product Service
cd product-service
make deploy COGNITO_POOL_ID=<tu-pool-id> COGNITO_APP_CLIENT_ID=<tu-client-id>
cd ..
```

---

## 🎮 Comandos Principales

Cada servicio tiene su propio `Makefile` con comandos específicos:

### Comandos Comunes (Todos los Servicios)

```bash
make help          # Ver todos los comandos disponibles
make install       # Instalar dependencias
make build         # Compilar TypeScript
make test          # Ejecutar tests
make deploy        # Desplegar a AWS
make destroy       # Eliminar stack de AWS
make logs          # Ver logs de CloudWatch
make status        # Ver estado del stack
```

### Comandos Específicos

Ver documentación de cada servicio:
- [iam-policies/README.md](./iam-policies/README.md)
- [user-service/README.md](./user-service/README.md)
- [product-service/README.md](./product-service/README.md)

---

## 📁 Estructura del Proyecto

```
evilent-backend-microservices-cdk/
├── iam-policies/              # Políticas IAM compartidas
│   ├── lib/                   # Stacks CDK
│   ├── bin/                   # Entry point CDK
│   ├── test/                  # Tests
│   ├── Makefile               # Comandos automatizados
│   ├── package.json           # Dependencias
│   └── README.md              # Documentación
│
├── user-service/              # Microservicio de usuarios
│   ├── src/                   # Código fuente TypeScript
│   │   ├── api/               # Handlers de API
│   │   ├── service/           # Lógica de negocio
│   │   ├── repository/        # Acceso a datos
│   │   ├── dto/               # Data Transfer Objects
│   │   ├── config/            # Configuración
│   │   └── utility/           # Utilidades
│   ├── lib/                   # Stacks CDK
│   ├── test/                  # Tests
│   ├── migrations/            # Migraciones de BD
│   ├── docs/                  # Documentación detallada
│   ├── Makefile               # Comandos automatizados
│   ├── package.json           # Dependencias
│   └── README.md              # Documentación
│
├── product-service/           # Microservicio de productos
│   ├── src/                   # Código fuente TypeScript
│   │   ├── api/               # Handlers de API (product, category, deal, image)
│   │   ├── service/           # Lógica de negocio
│   │   ├── repository/        # Acceso a datos
│   │   ├── dto/               # Data Transfer Objects
│   │   ├── models/            # Modelos de MongoDB
│   │   ├── config/            # Configuración
│   │   └── utility/           # Utilidades
│   ├── lib/                   # Stacks CDK
│   ├── test/                  # Tests
│   ├── docs/                  # Documentación detallada
│   ├── examples/              # Ejemplos de uso de API
│   ├── Makefile               # Comandos automatizados
│   ├── package.json           # Dependencias
│   └── README.md              # Documentación
│
├── .gitignore                 # Archivos ignorados por Git
└── README.md                  # Este archivo
```

---

## 📚 Documentación

### Documentación General
- [README.md](./README.md) - Este archivo
- [Arquitectura General](./docs/ARCHITECTURE.md) - Arquitectura del sistema (próximamente)

### Documentación por Servicio

#### IAM Policies
- [README.md](./iam-policies/README.md) - Guía completa

#### User Service
- [README.md](./user-service/README.md) - Guía completa
- [PROGRESO_ACTUAL.md](./user-service/docs/PROGRESO_ACTUAL.md) - Historial de desarrollo
- [CONFIGURACION.md](./user-service/docs/CONFIGURACION.md) - Configuración detallada
- [TESTING_README.md](./user-service/docs/TESTING_README.md) - Guía de testing
- [PSQL_GUIDE.md](./user-service/docs/PSQL_GUIDE.md) - Guía de PostgreSQL
- [AWS_COMANDOS_UTILES.md](./user-service/docs/AWS_COMANDOS_UTILES.md) - Comandos AWS útiles

#### Product Service
- [README.md](./product-service/README.md) - Guía completa
- [PROGRESO_ACTUAL.md](./product-service/docs/PROGRESO_ACTUAL.md) - Historial de desarrollo
- [ARQUITECTURA.md](./product-service/docs/ARQUITECTURA.md) - Arquitectura del servicio
- [FLUJOS.md](./product-service/docs/FLUJOS.md) - Flujos de datos
- [TESTING.md](./product-service/docs/TESTING.md) - Guía de testing
- [CONFIG_VALIDACION.md](./product-service/docs/CONFIG_VALIDACION.md) - Validación de configuración
- [API_ENDPOINTS_EXAMPLES.md](./product-service/examples/API_ENDPOINTS_EXAMPLES.md) - Ejemplos de API

---

## ✨ Características

### 🔒 Seguridad
- ✅ **Defense in Depth:** Validación JWT en API Gateway Y Lambda
- ✅ **AWS Secrets Manager:** Credenciales seguras (PostgreSQL, MongoDB)
- ✅ **Validación Zod:** Type-safe validation en todos los inputs
- ✅ **IAM Least Privilege:** Permisos mínimos necesarios
- ✅ **Sin datos hardcodeados:** Todo en variables de entorno

### 🏗️ Arquitectura
- ✅ **Serverless:** AWS Lambda (escalado automático)
- ✅ **Microservicios:** Servicios independientes y desacoplados
- ✅ **Infrastructure as Code:** AWS CDK (TypeScript)
- ✅ **API Gateway:** Routing y autenticación centralizada
- ✅ **CloudWatch:** Logging y monitoreo estructurado

### 📊 Bases de Datos
- ✅ **PostgreSQL (RDS):** User-service (datos relacionales)
- ✅ **MongoDB (Atlas):** Product-service (datos no relacionales)
- ✅ **Migraciones:** Automatizadas (user-service)
- ✅ **Connection Pooling:** Optimizado para Lambda

### 🧪 Testing
- ✅ **Tests Unitarios:** 80/80 (user-service), 107/107 (product-service)
- ✅ **Tests de Integración:** Configurables
- ✅ **Coverage:** >70% en código crítico
- ✅ **Mocks:** AWS services mockeados

### 📝 Calidad de Código
- ✅ **TypeScript:** Type-safe en todo el código
- ✅ **Logger Estructurado:** CloudWatch Logs con contexto
- ✅ **Constantes Centralizadas:** Configuración en un solo lugar
- ✅ **Validación Zod:** Schemas type-safe
- ✅ **Error Handling:** Clases de error específicas

### 🚀 DevOps
- ✅ **Makefiles:** Comandos automatizados y documentados
- ✅ **CDK Outputs:** URLs y ARNs exportados automáticamente
- ✅ **Rollback:** Fácil con CloudFormation
- ✅ **Monitoreo:** CloudWatch Logs y Metrics

---

## 🎯 Roadmap

### ✅ Completado
- [x] Arquitectura base de microservicios
- [x] Autenticación con Cognito
- [x] User Service (PostgreSQL)
- [x] Product Service (MongoDB)
- [x] IAM Policies centralizadas
- [x] Validación Zod
- [x] Tests automatizados
- [x] Documentación completa

### 🔄 En Progreso
- [ ] Template Generator (replicabilidad)
- [ ] CI/CD Pipeline

### 📅 Futuro
- [ ] Order Service
- [ ] Payment Service
- [ ] Notification Service
- [ ] Analytics Service

---

## 💰 Costos Estimados

### Desarrollo (con Free Tier)
- **IAM Policies:** $0/mes (gratis)
- **User Service:** ~$20/mes (RDS Single-AZ)
- **Product Service:** ~$5/mes (Lambda + S3)
- **Total:** ~$25/mes

### Producción (sin Free Tier)
- **IAM Policies:** $0/mes (gratis)
- **User Service:** ~$50-100/mes (RDS Multi-AZ)
- **Product Service:** ~$20-40/mes (Lambda + S3 + MongoDB Atlas)
- **Total:** ~$70-140/mes

---

## 🤝 Contribuir

Este es un proyecto privado. Para contribuir:

1. Crea una rama feature: `git checkout -b feature/nueva-funcionalidad`
2. Commit tus cambios: `git commit -m 'Agrega nueva funcionalidad'`
3. Push a la rama: `git push origin feature/nueva-funcionalidad`
4. Abre un Pull Request

### Reglas de Contribución

- ✅ Seguir las [10 Reglas de Oro](./docs/REGLAS.md)
- ✅ Tests para código nuevo
- ✅ Documentación actualizada
- ✅ Sin console.log (usar logger)
- ✅ Sin datos sensibles hardcodeados
- ✅ Validación Zod para inputs

---

## 📞 Soporte

Para preguntas o problemas:

1. Revisa la documentación de cada servicio
2. Consulta el troubleshooting en READMEs individuales
3. Contacta al equipo de desarrollo

---

## 📄 Licencia

Este proyecto es privado y propietario de EVILENT.

---

## 🎉 Agradecimientos

Desarrollado con ❤️ por el equipo de EVILENT.

**Stack Tecnológico:**
- AWS (Lambda, API Gateway, RDS, S3, Cognito, Secrets Manager, CloudWatch)
- TypeScript
- Node.js
- AWS CDK
- PostgreSQL
- MongoDB
- Zod
- Jest

---

**Última actualización:** 2025-11-06
