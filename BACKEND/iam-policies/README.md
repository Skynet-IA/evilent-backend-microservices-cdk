# IAM Policies - Políticas Compartidas

Políticas IAM compartidas para todos los servicios Evilent (User Service, Product Service, etc).

## 🎯 Objetivo

Gestionar permisos IAM de forma centralizada e independiente del ciclo de vida de los servicios individuales.

## 🚀 Setup Inicial

```bash
# 1️⃣ Instalar dependencias
make install

# 2️⃣ Desplegar políticas IAM
make deploy

# 3️⃣ Aplicar todas las políticas al usuario desarrollador
make apply-all
```

**Tiempo:** ~2-3 minutos  
**Costo:** $0/mes (políticas IAM son GRATUITAS)

---

## 📊 Políticas Incluidas

### 1. **EvilentUserServiceDeveloperPolicy**
Permisos para desarrolladores de User Service:
- ✅ **Secrets Manager**: Credenciales RDS (solo `evilent/user-service/*`)
- ✅ **EC2**: Start/Stop instancias Bastion (con tags `Service=UserService`)
- ✅ **CloudWatch Logs**: Logs de Lambda y SSM
- ✅ **CloudFormation**: Estado de stacks UserService

### 2. **EvilentProductServiceDeveloperPolicy**
Permisos para desarrolladores de Product Service:
- ✅ **Secrets Manager**: Credenciales MongoDB (solo `prod/product-service/*`)
- ✅ **S3**: Bucket de imágenes de productos (`evilent-product-images`)
- ✅ **CloudWatch Logs**: Logs de Lambda ProductService
- ✅ **CloudFormation**: Estado de stacks ProductService

### 3. **EvilentSharedMonitoringPolicy**
Permisos compartidos de monitoreo para todos los servicios:
- ✅ **CloudWatch Logs**: Todos los servicios Evilent
- ✅ **CloudFormation**: Todos los stacks (ListStacks, DescribeStacks)
- ✅ **X-Ray**: Tracing de todos los servicios

---

## 💡 Comandos Útiles

```bash
# Ver estado del stack
make status

# Ver ARNs de políticas
make outputs

# Aplicar solo una política específica
make apply-user-service
make apply-product-service
make apply-shared

# Detach todas las políticas
make detach-all

# Eliminar stack (requiere detach primero)
make destroy
```

---

## 🏗️ Arquitectura

```
IamPoliciesStack (independiente)
├── EvilentUserServiceDeveloperPolicy
├── EvilentProductServiceDeveloperPolicy
└── EvilentSharedMonitoringPolicy

UserServiceStack (referencia políticas)
ProductServiceStack (referencia políticas)
```

**Ventajas:**
- ✅ **Ciclo de vida independiente**: Políticas persisten entre deploys/destroys
- ✅ **$0 de costo**: Políticas IAM son gratuitas
- ✅ **Escalable**: Fácil agregar nuevos servicios
- ✅ **Centralizado**: Un solo lugar para gestionar permisos
- ✅ **Least Privilege**: Permisos mínimos con conditions cuando es posible

---

## 🔧 Configuración

Todas las configuraciones están centralizadas en `lib/config/constants.ts`:

```typescript
// Usuario IAM que recibirá las políticas
export const DEVELOPER_IAM_USER = 'skynet-developer';

// Región AWS por defecto
export const DEFAULT_AWS_REGION = 'eu-central-1';

// Nombres de políticas, recursos, acciones, etc.
```

Para cambiar configuraciones, edita `constants.ts` en lugar de modificar el código de infraestructura.

---

## 🗑️ Destrucción

```bash
# 1. Detach políticas del usuario
make detach-all

# 2. Eliminar stack
make destroy
```

**⚠️ Importante:** Siempre ejecuta `make detach-all` antes de `make destroy` para evitar errores.

---

## ⚠️ Orden Correcto de Destrucción

Si necesitas eliminar **TODO** (servicios + políticas), sigue este orden:

### 1️⃣ Destruir Servicios Primero

```bash
# User Service
cd ../user-service
make destroy

# Product Service (si está desplegado)
cd ../product-service
make destroy
```

**Razón:** Los servicios pueden tener referencias a las políticas IAM.

### 2️⃣ Luego Destruir Políticas IAM

```bash
cd ../iam-policies
make detach-all  # Detach políticas del usuario
make destroy     # Eliminar stack
```

**Razón:** Las políticas IAM no se pueden eliminar si:
- Están attached a usuarios/roles
- Están siendo referenciadas por servicios activos

### ❌ **NO HAGAS ESTO:**

```bash
# ❌ MAL: Eliminar políticas primero
cd iam-policies && make destroy  # Fallará si están en uso

# ❌ MAL: Olvidar detach
cd iam-policies && make destroy  # Fallará si están attached
```

### ✅ **Orden Correcto Resumido:**

1. `user-service/make destroy` → Elimina servicio
2. `product-service/make destroy` → Elimina servicio  
3. `iam-policies/make detach-all` → Detach políticas
4. `iam-policies/make destroy` → Elimina políticas

---

## 📝 Principios de Diseño

Este proyecto sigue estrictos principios de calidad:

1. **Sin código muerto**: Solo código actualmente necesario
2. **Sin código especulativo**: No anticipamos necesidades futuras
3. **Sin hardcoding**: Todos los valores en `constants.ts`
4. **Least Privilege**: Permisos mínimos con conditions cuando es posible
5. **Buenas prácticas**: Documentación, tipos, estructura clara

---

## 🔄 Flujo de Trabajo

### Setup Inicial (una sola vez)
```bash
cd BACKEND/iam-policies
make install
make deploy
make apply-all
```

### Agregar Nuevo Servicio
1. Editar `lib/config/constants.ts` (agregar recursos del nuevo servicio)
2. Editar `lib/iam-policies-stack.ts` (agregar nueva política)
3. `make deploy` (actualizar stack)
4. `make apply-<nuevo-servicio>` (aplicar al usuario)

### Eliminar Todo
```bash
make detach-all
make destroy
```

---

## 📚 Documentación Adicional

- **Makefile**: `make help` - Ver todos los comandos disponibles
- **Constants**: `lib/config/constants.ts` - Configuración centralizada
- **Stack**: `lib/iam-policies-stack.ts` - Definición de políticas

---

## 🤝 Integración con Servicios

### User Service
```bash
cd ../user-service
# Las políticas IAM ya están desplegadas
make deploy COGNITO_POOL_ID=tu_pool_id COGNITO_APP_CLIENT_ID=tu_client_id
```

### Product Service
```bash
cd ../product-service
# Las políticas IAM ya están desplegadas
make deploy COGNITO_POOL_ID=tu_pool_id
```

**Nota:** Product Service usa solo `COGNITO_POOL_ID`, mientras que User Service requiere `COGNITO_POOL_ID` y `COGNITO_APP_CLIENT_ID`.

Las políticas IAM persisten independientemente del estado de los servicios.
