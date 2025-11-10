# Product Service - AWS CDK

Servicio de productos serverless con autenticación Cognito en AWS Lambda + API Gateway.

## 🚀 Setup Inicial (ejecutar en orden)

```bash
# 0️⃣ Desplegar políticas IAM (proyecto separado - una sola vez)
cd ../iam-policies
make install
make deploy
make apply-all
cd ../product-service

# 1️⃣ Instalar dependencias
make install

# 2️⃣ Desplegar servicio completo
make deploy \
  COGNITO_POOL_ID=eu-central-1_xxx \
  COGNITO_APP_CLIENT_ID=yyy
```

**Tiempo:** 3-5 minutos primera vez, 30 segundos después

---

## 🏗️ Lo Que Logramos

Con **~500 líneas de código TypeScript**:

```
✅ 5 Lambda Functions (products, categories, deals, images, queue)
✅ API Gateway (REST API con rate limiting)
✅ Cognito Authorizer (autenticación enterprise)
✅ IAM Roles (permisos automáticos)
✅ CloudWatch Logs (monitoreo en tiempo real)
✅ S3 Bucket (almacenamiento de imágenes)
```

**Costo:** $0-5/mes en desarrollo (free tier)

---

## 🔄 Workflow Diario

```bash
# Hacer cambios
vim src/product-api.ts

# Deploy en 30 segundos
make update \
  COGNITO_POOL_ID=eu-central-1_xxx \
  COGNITO_APP_CLIENT_ID=yyy

# Ver logs
make logs-follow
```

---

## 📜 Comandos Útiles

```bash
make help          # Ver todos los comandos disponibles
make logs          # Ver logs (últimos 10 minutos)
make logs-follow   # Seguir logs en tiempo real
make api-url       # Obtener URL del API
make status        # Ver estado del stack
make outputs       # Ver todos los outputs
make diff          # Ver cambios antes de deploy
```

---

## 🧪 Testing Strategy

### **Tests Automatizados**

```bash
# Ejecutar todos los tests (107 tests unitarios)
make test

# Tests específicos
make test-unit           # Tests de servicios y lógica
make test-validation     # Tests de schemas Zod
make test-helpers        # Tests de utilidades

# Coverage
make test-coverage       # Ver cobertura de código
```

**Cobertura actual:** 107 tests (100% pasan)
- ✅ **Unit Tests (83 tests)**: Validan lógica de negocio, servicios, repositorios
- ✅ **Validation Tests (42 tests)**: Validan schemas Zod y validación de datos
- ✅ **Helper Tests**: Validan utilidades (logger, response, request-parser)

### **Tests Manuales (Smoke Tests)**

```bash
# 1. Obtener token JWT desde AWS CLI
aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id YOUR_CLIENT_ID \
  --auth-parameters USERNAME=test@example.com,PASSWORD=YourPassword123!

# 2. Probar endpoints
export TOKEN="eyJhbGciOi..."
export API_URL=$(make api-url | grep https)

# GET /product
curl -H "Authorization: Bearer $TOKEN" $API_URL/product

# POST /product
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","description":"Test","categoryId":"uuid","price":99.99}' \
  $API_URL/product
```

### **¿Por qué no hay tests de integración?**

Los tests de integración (E2E con Cognito + DB real) fueron **eliminados intencionalmente** porque:

1. ❌ **Costo**: Cada test hace llamadas reales a AWS ($$$)
2. ❌ **Lento**: 5-10 segundos por test vs 50ms unitarios
3. ❌ **Frágil**: Depende de servicios externos (Cognito, MongoDB Atlas)
4. ❌ **Complejo**: Requiere setup de credenciales AWS en CI/CD
5. ✅ **Innecesario**: Los tests unitarios cubren toda la lógica de negocio

**Estrategia recomendada:**
- ✅ Tests unitarios automatizados (rápidos, confiables)
- ✅ Smoke tests manuales después de deploy (validan integración real)
- ✅ Monitoreo en CloudWatch (detecta problemas en producción)

---

## 📂 Estructura

```
product-service/
├── bin/product-service.ts          # Entry point CDK
├── lib/
│   ├── product-service-stack.ts    # Stack principal
│   ├── api-gateway-stack.ts        # API Gateway + Cognito
│   ├── service-stack.ts            # Lambda Functions
│   └── s3-bucket-stack.ts          # S3 Bucket
├── src/
│   ├── product-api.ts              # Products handler
│   ├── category-api.ts             # Categories handler
│   ├── deal-api.ts                 # Deals handler
│   ├── image-api.ts                # Images handler
│   ├── message-queue.ts            # Queue handler
│   ├── service/                    # Business logic
│   ├── repository/                 # Data access
│   ├── dto/                        # Data transfer objects
│   ├── models/                     # Domain models
│   └── utility/                    # Errors, response
└── Makefile                        # Comandos automatizados
```

---

## 🎯 Endpoints

```
Products:
  GET  /product       - Listar productos
  POST /product       - Crear producto
  GET  /product/{id}  - Obtener producto
  PUT  /product/{id}  - Actualizar producto
  DELETE /product/{id} - Eliminar producto

Categories:
  GET  /category       - Listar categorías
  POST /category       - Crear categoría
  GET  /category/{id}  - Obtener categoría
  PUT  /category/{id}  - Actualizar categoría
  DELETE /category/{id} - Eliminar categoría

Deals:
  GET  /deal       - Listar ofertas
  POST /deal       - Crear oferta
  GET  /deal/{id}  - Obtener oferta
  PUT  /deal/{id}  - Actualizar oferta
  DELETE /deal/{id} - Eliminar oferta

Images:
  GET  /imgUploader - Subir imagen

Queue:
  GET  /product-queue - Procesar cola
```

Todos los endpoints requieren autenticación Cognito (header `Authorization: Bearer TOKEN`)

---

## 🔐 Permisos IAM

Las políticas IAM se gestionan en un proyecto separado (`../iam-policies/`) que contiene:

- ✅ **EvilentProductServiceDeveloperPolicy** - Permisos específicos para product-service
- ✅ **EvilentSharedMonitoringPolicy** - Permisos de monitoreo compartidos

**Beneficios:**
- 🔄 Ciclo de vida independiente (políticas persisten entre deploys)
- 💰 Costo $0/mes (políticas IAM son gratuitas)
- 🛡️ Seguridad mejorada (permisos centralizados)
- 📈 Escalable (compartidas entre servicios)

**Setup de políticas IAM:**
```bash
cd ../iam-policies
make deploy        # Desplegar políticas (una sola vez)
make apply-all     # Aplicar a tu usuario desarrollador
```

---

## 🗑️ Limpieza

```bash
# Eliminar solo el servicio (mantiene políticas IAM - RECOMENDADO)
make destroy

# Limpiar archivos compilados
make clean
```

### 💡 ¿Qué se elimina y qué se mantiene?

**`make destroy`** (Recomendado):
- ❌ Elimina: ProductServiceStack (Lambda, API Gateway, S3, CloudWatch)
- ✅ Mantiene: IamPoliciesStack (políticas IAM en proyecto separado)
- ✅ Mantiene: Permisos del usuario desarrollador
- 💰 Ahorra: ~$0-5/mes (recursos con costo)
- 💰 Costo políticas: $0/mes (gratuitas)
- 🎯 **Uso típico**: Ciclo de desarrollo frecuente

**Para eliminar políticas IAM** (opcional):
```bash
cd ../iam-policies
make detach-all  # Primero detach del usuario
make destroy     # Luego eliminar stack
```

⚠️ **IMPORTANTE:** Las políticas IAM están en proyecto separado (`../iam-policies/`) y persisten independientemente del estado del servicio. Esto es intencional para:
- Acelerar redeploys (políticas ya existen)
- Compartir políticas entre servicios
- Costo $0/mes (políticas IAM son gratuitas)

---

## 💡 Ventajas vs Local

```
✅ Cualquiera puede probarlo (con URL)
✅ Escala automáticamente (0 a millones)
✅ Deploy en 30 segundos
✅ Logs en tiempo real
✅ $0-5/mes en desarrollo
```

---

## 🐛 Troubleshooting

### Error: "Unable to resolve AWS account"
```bash
aws configure
# Ingresa: Access Key ID, Secret Access Key, region (eu-central-1), format (json)
```

### Error: "This stack uses assets"
```bash
# Bootstrap ya no es necesario si usas iam-policies
# El CDKToolkit ya está configurado
```

### Error: "Unauthorized" (401)
- Token expirado → Obtener nuevo token
- Usar `idToken` (no `accessToken`)
- Verificar header: `Authorization: Bearer TOKEN`

### Error: Permisos IAM

Si ves errores de permisos durante deploy:

1. **Verifica que las políticas IAM estén desplegadas:**
```bash
cd ../iam-policies
make status  # Debe mostrar IamPoliciesStack CREATE_COMPLETE
```

2. **Verifica que las políticas estén aplicadas a tu usuario:**
```bash
cd ../iam-policies
make verify  # Debe mostrar las 3 políticas attached
```

3. **Si no están aplicadas:**
```bash
cd ../iam-policies
make apply-all
```

### Error: Stack en `ROLLBACK_COMPLETE`

Si el stack queda en estado fallido:
```bash
# Eliminar stack fallido
make destroy

# Verificar configuración
make check-aws

# Reintentar deploy
make deploy COGNITO_POOL_ID=eu-central-1_xxx
```

### Deploy muy lento
- Verifica eventos: `make status`
- Primera vez toma 3-5 minutos (normal)
- Actualizaciones toman 30-60 segundos

---

## 📚 Documentación Adicional

- **[GUIA_DEPLOY_AWS.md](./GUIA_DEPLOY_AWS.md)** - Guía detallada de deployment
- **[../iam-policies/README.md](../iam-policies/README.md)** - Gestión de políticas IAM

---

## 🎓 Stack Tecnológico

- **AWS CDK** - Infraestructura como código
- **Lambda** - Serverless computing
- **API Gateway** - REST APIs escalables
- **Cognito Authorizer** - Autenticación sin código
- **S3** - Almacenamiento de imágenes
- **CloudWatch** - Monitoreo y logs
- **IAM** - Gestión de permisos
- **TypeScript** - Lenguaje moderno (`"type": "module"`)

---

**Última actualización:** Octubre 31, 2025  
**Estado:** ✅ Production-ready con IAM policies independientes
