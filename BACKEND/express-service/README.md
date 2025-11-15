# Express Service - Template Base Replicable

**Express.js Monolith Template** - Plataforma de lanzamiento para iniciar proyectos sencillos con mejores prácticas implementadas desde el inicio.

```
┌─────────────────────────────────────────────────────────────────┐
│ 🚀 EXPRESS SERVICE - TEMPLATE BASE                              │
│                                                                   │
│ • Monolito base reutilizable para proyectos sencillos           │
│ • Mejores prácticas: Logger, Constants, Testing, Auth           │
│ • Replicable: Cambiar valores en UN lugar = nuevo proyecto      │
│ • Production-ready: Defense in depth, Zod validation            │
│ • Coverage: >80% tests (services >90%)                          │
│                                                                   │
│ Próximos pasos:                                                  │
│ 1. Refactorizar a microservicios (si crece)                     │
│ 2. Agregar base de datos (PostgreSQL, DynamoDB, etc)           │
│ 3. Deployar a AWS (Lambda, EC2, ECS, etc)                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Contenido

- [Características](#características)
- [Instalación](#instalación)
- [Uso](#uso)
- [Estructura de Carpetas](#estructura-de-carpetas)
- [Arquitectura](#arquitectura)
- [Testing](#testing)
- [API Endpoints](#api-endpoints)
- [Configuración](#configuración)
- [Replicar Proyecto](#replicar-proyecto)
- [Mejores Prácticas](#mejores-prácticas)

---

## ✨ Características

### 🏗️ Arquitectura Sólida
- ✅ Separación de responsabilidades (Service → Repository → Database)
- ✅ Route Map pattern (escalable, declarativo)
- ✅ Dependency Injection lista (fácil testear)
- ✅ Middleware centralizado

### 🔒 Seguridad
- ✅ Autenticación JWT con Cognito (local + AWS)
- ✅ Defense in depth (validación en múltiples capas)
- ✅ Validación Zod en todos los inputs
- ✅ Manejo seguro de errores (sin exponer detalles)

### 📊 Logging & Observabilidad
- ✅ Logger estructurado (Winston)
- ✅ Niveles: debug, info, warn, error
- ✅ Contexto estructurado: requestId, userId, stack
- ✅ CloudWatch Logs compatible

### 🧪 Testing Enterprise-Grade
- ✅ Unit tests >90% (services)
- ✅ Integration tests >85% (handlers)
- ✅ Patrón AAA (Arrange-Act-Assert)
- ✅ Coverage total >80%

### ⚙️ Configuración Centralizada
- ✅ Constants en `src/config/constants.ts`
- ✅ REPLICABLE: Cambiar `SERVICE_CONFIG.identity.name` = nuevo proyecto
- ✅ Variables de entorno tipadas
- ✅ Validación de configuración

### 🚀 DX (Developer Experience)
- ✅ Makefile con 20+ comandos
- ✅ Hot reload con ts-node
- ✅ Docker support
- ✅ Prettier + ESLint preconfigurados

---

## 🚀 Instalación

### Prerequisitos
- Node.js 18+
- npm o yarn
- Docker (opcional)

### Setup Local

```bash
# 1. Navegar a la carpeta
cd BACKEND/express-service

# 2. Instalar dependencias
make install
# O manualmente: npm install

# 3. Crear .env (copiar de .env.example)
cp .env.example .env

# 4. Verificar que todo funciona
make test
```

### Setup con Docker

```bash
# Instalar y ejecutar con Docker
make docker-build
make docker-run

# Ver logs
make docker-logs

# Detener
make docker-stop
```

---

## 💻 Uso

### Servidor de Desarrollo

```bash
make dev
# Server escuchando en http://localhost:3000
```

### Ejecutar Tests

```bash
# Todos los tests con coverage
make test

# Solo unit tests
make test-unit

# Solo integration tests
make test-integration

# Watch mode (rerun en cambios)
make test-watch
```

### Verificar Health

```bash
make health
# ✅ Server health check

make info
# 📖 Server info
```

### Build para Producción

```bash
make build
# Genera /dist con JavaScript compilado

make start
# Ejecuta versión compilada
```

### Código Quality

```bash
make lint
# Verifica TypeScript

make format
# Formatea con Prettier
```

---

## 📁 Estructura de Carpetas

```
express-service/
├── src/
│   ├── bin/
│   │   └── express-service.ts          ← Entry point
│   ├── api/
│   │   └── user.handler.ts             ← Route Map (escalable)
│   ├── auth/
│   │   └── jwt-auth.ts                 ← JWT + Cognito
│   ├── config/
│   │   └── constants.ts                ← REPLICABLE: punto único de cambio
│   ├── db/
│   │   └── (conexiones a DB)           ← Opcional
│   ├── dto/
│   │   └── index.ts                    ← Validación Zod
│   ├── models/
│   │   └── (domain models)
│   ├── repository/
│   │   └── (data access)
│   ├── service/
│   │   └── user.service.ts             ← Lógica de negocio
│   ├── types/
│   │   └── index.ts                    ← TypeScript types
│   └── utility/
│       ├── logger.ts                   ← Logger estructurado
│       └── response.ts                 ← Response handlers
│
├── test/
│   ├── unit/
│   │   └── user.service.test.ts        ← Unit tests (>90%)
│   ├── integration/
│   │   └── user.api.test.ts            ← Integration tests (>85%)
│   ├── e2e/
│   │   └── (flujos completos)
│   ├── mocks/
│   │   └── (mocks realistas)
│   ├── helpers/
│   │   └── (test utilities)
│   └── fixtures/
│       └── (test data)
│
├── docs/
│   ├── ARQUITECTURA.md                 ← Decisiones técnicas
│   ├── PROGRESO_ACTUAL.md              ← Roadmap
│   └── API_ENDPOINTS_EXAMPLES.md       ← API ejemplos
│
├── Makefile                            ← 20+ comandos
├── package.json
├── tsconfig.json
├── jest.config.cjs
├── README.md                           ← Este archivo
└── .env.example
```

---

## 🏗️ Arquitectura

### Patrones Implementados

#### 1. **Route Map** (Escalable, Declarativo)

```typescript
// src/api/user.handler.ts
const userRouteMap: UserRoute[] = [
  {
    method: 'get',
    requiresPathParams: false,
    handler: handlers.listUsers,
    description: 'GET /users - List all users'
  },
  {
    method: 'post',
    requiresPathParams: false,
    handler: handlers.createUser,
    description: 'POST /users - Create new user'
  },
  // Agregar ruta = agregar línea, NO modificar lógica
];
```

**Ventajas:**
- ✅ Agregar ruta = agregar objeto al array
- ✅ Todas las rutas visibles en un lugar
- ✅ Autodocumentado con descripción
- ✅ Fácil testear (mockear array)

#### 2. **Separación de Responsabilidades**

```
Request → Handler → Service → Repository → Database
  │         │        │        │
  ├─────────┼────────┼────────┴─ Data Access
  │         ├────────┴──────────── Business Logic
  │         ├──────────────────── Input Validation
  └─────────┴────────────────────── HTTP Layer
```

#### 3. **Dependency Injection**

```typescript
// Service recibe repository como parámetro (no import directo)
export class UserService {
  constructor(private repository: IUserRepository) {}
}

// Beneficio: Fácil testear (inyectar mock)
const mockRepo = new MockUserRepository();
const service = new UserService(mockRepo);
```

#### 4. **REPLICABILIDAD - Punto Único de Cambio**

```typescript
// src/config/constants.ts
export const SERVICE_CONFIG = {
  identity: {
    name: 'express-service',        // ← CAMBIAR AQUÍ para replicar
    displayName: 'Express Service',
    // ... todo lo demás se actualiza automáticamente
  }
}
```

**Para crear `order-service`:**
1. Copiar carpeta `express-service` → `order-service`
2. Cambiar `SERVICE_CONFIG.identity.name` = 'order-service'
3. ¡Listo! Todo lo demás funciona automáticamente

---

## 🧪 Testing

### Coverage Obligatorio

| Capa | Coverage | Tests |
|------|----------|-------|
| Services | >90% | unit tests |
| Handlers/API | >85% | integration tests |
| Utils | >80% | unit tests |
| **Total** | **>80%** | todos |

### Ejecutar Tests

```bash
# Todos con coverage
npm test

# Específicos
npm run test:unit        # Solo unit
npm run test:integration # Solo integration
npm run test:watch      # Watch mode
```

### Patrón AAA (Arrange-Act-Assert)

```typescript
describe('UserService', () => {
  it('debe crear usuario con datos válidos', async () => {
    // ARRANGE: Preparar datos
    const userData = { firstName: 'John', ... };

    // ACT: Ejecutar
    const user = await service.createUser(userData);

    // ASSERT: Verificar
    expect(user.id).toBeDefined();
    expect(user.firstName).toBe('John');
  });
});
```

---

## 🔌 API Endpoints

### Health & Info

```bash
# Health check
GET /health

# Server info
GET /info
```

### Users

```bash
# Listar usuarios (con paginación)
GET /users?page=1&pageSize=20

# Crear usuario
POST /users
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com"
}

# Obtener usuario por ID
GET /users/:id

# Actualizar usuario
PUT /users/:id
{
  "firstName": "Johnny",
  "lastName": "Smith"
}

# Eliminar usuario
DELETE /users/:id
```

### Response Format (Estándar)

```json
{
  "success": true,
  "message": "Success message",
  "data": { ... },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Format (Estándar)

```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "errors": [
      {
        "field": "firstName",
        "message": "First name is required",
        "code": "VALIDATION_ERROR"
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## ⚙️ Configuración

### Variables de Entorno

```bash
# Server
NODE_ENV=development
PORT=3000

# Logging
LOG_LEVEL=info

# Cognito
COGNITO_POOL_ID=us-east-1_xxxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
JWT_SECRET=your-jwt-secret

# Database (opcional)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=express_service_db
```

### Constants (Centralizado)

**NUNCA hardcodear valores**, usar `src/config/constants.ts`:

```typescript
import {
  SERVICE_CONFIG,
  BUSINESS_LIMITS,
  TIMEOUT_CONFIG,
  AUTH_CONFIG,
  ERROR_CODES,
  HTTP_STATUS
} from './config/constants';

// Todos centralizados, REPLICABLES
```

---

## 🔄 Replicar Proyecto

### Crear Nuevo Servicio (ej: order-service)

```bash
# 1. Copiar carpeta
cp -r express-service order-service
cd order-service

# 2. Cambiar nombre en constants.ts
# Antes: name: 'express-service'
# Después: name: 'order-service'

# 3. Instalar y ejecutar
npm install
npm run dev

# ✅ ¡Listo! order-service ejecutando en puerto 3001
```

### Qué Cambiar Manualmente

| Elemento | Antes | Después |
|----------|-------|---------|
| `SERVICE_CONFIG.identity.name` | express-service | order-service |
| `SERVICE_CONFIG.identity.displayName` | Express Service | Order Service |
| PORT | 3000 | 3001 (o el deseado) |
| DTOs | User, Product | Order, Item, etc |
| Services | UserService | OrderService |
| Handlers | user.handler.ts | order.handler.ts |

**TOTAL: 5-10 cambios = REPLICABLE ✅**

---

## 📚 Mejores Prácticas

### ✅ SIEMPRE

- ✅ Usar logger en lugar de console.log
- ✅ Centralizar constantes en constants.ts
- ✅ Validar inputs con Zod
- ✅ Escribir tests para código crítico (services)
- ✅ Usar Route Map para escalabilidad
- ✅ Documentar decisiones técnicas

### ❌ NUNCA

- ❌ Hardcodear valores
- ❌ Usar console.log
- ❌ Confiar en una sola capa de seguridad
- ❌ Crear código especulativo
- ❌ Procesar inputs sin validación
- ❌ Marcar tarea como completa sin testear

---

## 🔗 Recursos

- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Express.js Guide](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zod Validation](https://zod.dev/)
- [Winston Logger](https://github.com/winstonjs/winston)
- [Jest Testing](https://jestjs.io/)

---

## 📖 Documentación Adicional

- **[ARQUITECTURA.md](./docs/ARQUITECTURA.md)** - Decisiones técnicas y patrones
- **[PROGRESO_ACTUAL.md](./docs/PROGRESO_ACTUAL.md)** - Roadmap y tareas pendientes
- **[API_ENDPOINTS_EXAMPLES.md](./docs/API_ENDPOINTS_EXAMPLES.md)** - Ejemplos detallados de API

---

## 🤝 Contribuir

### Checklist Antes de Commit

- [ ] ✅ Sin código muerto
- [ ] ✅ Sin hardcoding
- [ ] ✅ Logger en lugar de console.log
- [ ] ✅ Constantes centralizadas
- [ ] ✅ Inputs validados con Zod
- [ ] ✅ Tests para código crítico
- [ ] ✅ Coverage >80%
- [ ] ✅ Documentación actualizada

---

## 📞 Soporte

Para preguntas o problemas:

1. Revisa [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)
2. Revisa logs: `tail -f logs/combined.log`
3. Ejecuta health check: `make health`

---

## 📄 Licencia

MIT

---

**Creado con ❤️ por EVILENT Team**

**Última actualización:** 2024-11-15


