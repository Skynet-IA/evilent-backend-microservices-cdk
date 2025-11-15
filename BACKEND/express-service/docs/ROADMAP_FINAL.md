# 🛣️ ROADMAP FINAL - EXPRESS-SERVICE

**De 62% → 100% Compliance + Production-Ready**

---

## 📊 ESTADO ACTUAL

```
✅ COMPLETADO (Semana 1-2):
├─ Seguridad: CORS, Request ID, Error Handling, Rate Limiting
├─ Database: PostgreSQL con Docker, Knex.js, init.sql
├─ Auth: Cognito integration (JWT verification)
├─ Endpoints: GET/POST /user/profile (frontend-ready)
├─ Utilities: Logger, Constants, Error handling
└─ Tests: 64/74 pasando, 45% coverage

⚠️ PROBLEMAS CRÍTICOS:
├─ Estructura inconsistente vs user-service (CRÍTICO)
├─ Falta config validation framework (CRÍTICO)
├─ Middleware no organizado (CRÍTICO)
├─ Tests con inconsistencias (CRÍTICO)
├─ 10/74 tests fallando
├─ Coverage 45% (required 80%)
└─ Dependencies muertas (bcrypt, jsonwebtoken)
```

---

## 🎯 MISIÓN

**Convertir Express-service de 62% → 100% compatible con reglas backend en 7-8 horas.**

```
ANTES: ❌ Incompatible, tests fallan, no replicable
DESPUÉS: ✅ 100% compatible, tests >80%, replicable como template
```

---

## 📋 TAREAS EN ORDEN

### **FASE 1: REFACTORIZACIÓN CRÍTICA (3-4 horas)** 🔴

#### Tarea 1.1: Refactorizar Estructura Carpetas (1.5h)

**PROBLEMA:** Express tiene estructura inconsistente vs user-service

**SOLUCIÓN:**

```bash
# Crear nueva estructura
src/
├── api/
│   ├── handlers/
│   │   ├── user.handler.ts          (mover de api/user.handler.ts)
│   │   └── index.ts                 (barrel export)
│   ├── middleware/
│   │   ├── cors.middleware.ts       (crear + organizar)
│   │   ├── request-id.middleware.ts (mover de utility)
│   │   ├── auth.middleware.ts       (mover de auth/cognito-middleware.ts)
│   │   └── index.ts                 (barrel export)
│   └── index.ts                     (barrel export)
├── config/
│   ├── config-types.ts              (crear - tipos config)
│   ├── config-schema.ts             (crear - validación Zod)
│   ├── validated-constants.ts       (crear - config validado)
│   ├── constants.ts                 (ya existe, mantener)
│   └── index.ts                     (barrel export)
├── auth/
│   ├── cognito-verifier.ts          (ya existe, renombrar si aplica)
│   └── index.ts                     (barrel export)
├── utility/
│   ├── errors.ts                    (ya existe)
│   ├── logger.ts                    (ya existe)
│   ├── response.ts                  (ya existe)
│   ├── zod-validator.ts             (crear - validación centralizada)
│   ├── request-parser.ts            (crear - parseo requests)
│   ├── database-client.ts           (crear - cliente DB)
│   └── index.ts                     (barrel export)
├── models/
│   ├── user.model.ts                (crear - tipos user)
│   └── index.ts                     (barrel export)
├── db/
│   ├── connection.ts                (ya existe)
│   ├── init.sql                     (ya existe)
│   ├── migrations/                  (ya existe)
│   └── index.ts                     (barrel export)
└── [resto igual]
```

**CHECKLIST:**
- [ ] Crear directorios nuevos
- [ ] Mover archivos a ubicaciones correctas
- [ ] Crear barrel exports (index.ts)
- [ ] Actualizar imports en bin/express-service.ts
- [ ] Verificar compilación: `npm run build`
- [ ] Tests compilan: `npm run test`

---

#### Tarea 1.2: Implementar Config Validation Framework (1h)

**PROBLEMA:** Config sin validación en runtime (falta fail-fast)

**ARCHIVOS A CREAR:**

**1. src/config/config-types.ts**
```typescript
/**
 * Tipos de configuración - TypeScript
 * Define estructura de APP_CONFIG
 */
export interface ServerConfig {
  port: number;
  env: 'development' | 'test' | 'production';
  timeout: number;
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'simple';
}

export interface AuthConfig {
  cognitoPoolId: string;
  cognitoAppClientId: string;
  cognitoRegion: string;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  name: string;
  poolMin: number;
  poolMax: number;
  ssl: boolean;
}

export interface AppConfig {
  server: ServerConfig;
  logging: LoggingConfig;
  auth: AuthConfig;
  database: DatabaseConfig;
}
```

**2. src/config/config-schema.ts**
```typescript
/**
 * Validación de configuración con Zod
 * Fail-fast si variables de entorno inválidas
 */
import { z } from 'zod';
import type { AppConfig } from './config-types';

export const CONFIG_SCHEMA = z.object({
  server: z.object({
    port: z.number().int().min(1000).max(65535),
    env: z.enum(['development', 'test', 'production']),
    timeout: z.number().int().positive()
  }),
  logging: z.object({
    level: z.enum(['debug', 'info', 'warn', 'error']),
    format: z.enum(['json', 'simple'])
  }),
  auth: z.object({
    cognitoPoolId: z.string().min(1, 'COGNITO_POOL_ID requerido'),
    cognitoAppClientId: z.string().min(1, 'COGNITO_APP_CLIENT_ID requerido'),
    cognitoRegion: z.string().default('us-east-1')
  }),
  database: z.object({
    host: z.string().min(1),
    port: z.number().int().min(1000).max(65535),
    user: z.string().min(1),
    password: z.string().min(1),
    name: z.string().min(1),
    poolMin: z.number().int().min(1),
    poolMax: z.number().int().min(2),
    ssl: z.boolean()
  })
}) as z.ZodType<AppConfig>;
```

**3. src/config/validated-constants.ts**
```typescript
/**
 * Configuración validada en runtime
 * Falla INMEDIATAMENTE si vars de entorno inválidas
 */
import { CONFIG_SCHEMA } from './config-schema';
import type { AppConfig } from './config-types';

const rawConfig = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    env: (process.env.NODE_ENV || 'development') as 'development' | 'test' | 'production',
    timeout: 30000
  },
  logging: {
    level: (process.env.LOG_LEVEL || 'info') as 'debug' | 'info' | 'warn' | 'error',
    format: 'json' as const
  },
  auth: {
    cognitoPoolId: process.env.COGNITO_POOL_ID || '',
    cognitoAppClientId: process.env.COGNITO_APP_CLIENT_ID || '',
    cognitoRegion: process.env.COGNITO_REGION || 'us-east-1'
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    name: process.env.DB_NAME || 'express_service_db',
    poolMin: 2,
    poolMax: 10,
    ssl: process.env.DB_SSL === 'true'
  }
};

// ⚠️ FAIL-FAST si config inválida
export const APP_CONFIG: AppConfig = CONFIG_SCHEMA.parse(rawConfig);

// Exports para acceso directo (compatibilidad)
export const COGNITO_POOL_ID = APP_CONFIG.auth.cognitoPoolId;
export const COGNITO_APP_CLIENT_ID = APP_CONFIG.auth.cognitoAppClientId;
export const SERVER_PORT = APP_CONFIG.server.port;
export const NODE_ENV = APP_CONFIG.server.env;
```

**4. src/config/index.ts** (barrel export)
```typescript
export { APP_CONFIG, COGNITO_POOL_ID, COGNITO_APP_CLIENT_ID, SERVER_PORT, NODE_ENV } from './validated-constants';
export type { AppConfig, ServerConfig, LoggingConfig, AuthConfig, DatabaseConfig } from './config-types';
```

**CHECKLIST:**
- [ ] Crear 3 archivos
- [ ] npm run build compila
- [ ] Verificar que COGNITO vars disparan error si faltan

---

#### Tarea 1.3: Organizar Middleware Separadamente (45min)

**PROBLEMA:** Middleware mezclado en bin/express-service.ts y handlers

**SOLUCIÓN:**

Crear archivos en `src/api/middleware/`:

**src/api/middleware/cors.middleware.ts**
```typescript
import cors from 'cors';

export const corsMiddleware = () => cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
});
```

**src/api/middleware/request-id.middleware.ts** (mover de utility/request-id.ts)
```typescript
import { randomUUID } from 'crypto';
import type { Request, Response, NextFunction } from 'express';

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] as string || randomUUID();
  req.id = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};
```

**src/api/middleware/auth.middleware.ts** (renombrar/mover cognito-middleware.ts)
```typescript
import type { Request, Response, NextFunction } from 'express';
import { CognitoVerifierService } from '../../auth/cognito-verifier';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
    }
  }
}

export const cognitoAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }
  
  try {
    const token = authHeader.substring(7);
    const verified = await CognitoVerifierService.getInstance().verify(token);
    req.userId = verified.sub;
    req.userEmail = verified.email;
  } catch (error) {
    // Log pero no falla - auth opcional
  }
  
  next();
};

export const requireAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  
  try {
    const token = authHeader.substring(7);
    const verified = await CognitoVerifierService.getInstance().verify(token);
    req.userId = verified.sub;
    req.userEmail = verified.email;
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  
  next();
};
```

**src/api/middleware/index.ts** (barrel)
```typescript
export { corsMiddleware } from './cors.middleware';
export { requestIdMiddleware } from './request-id.middleware';
export { cognitoAuthMiddleware, requireAuthMiddleware } from './auth.middleware';
```

**Actualizar bin/express-service.ts:**
```typescript
import { corsMiddleware, requestIdMiddleware, cognitoAuthMiddleware } from '../src/api/middleware';

// Aplicar middleware
app.use(corsMiddleware());
app.use(requestIdMiddleware);
app.use(cognitoAuthMiddleware);
// ... resto del código
```

**CHECKLIST:**
- [ ] Crear middleware files
- [ ] Actualizar imports
- [ ] npm run build
- [ ] Tests compilan

---

#### Tarea 1.4: Eliminar Dependencies Muertas (15min)

**PROBLEMA:** `bcrypt` y `jsonwebtoken` no se usan (Cognito las reemplazó)

**SOLUCIÓN:**

```bash
# 1. Eliminar del package.json
npm uninstall bcrypt jsonwebtoken @types/bcrypt @types/jsonwebtoken

# 2. Verificar compilación
npm run build

# 3. Verificar tests
npm run test

# 4. Commit
git add -A
git commit -m "refactor: eliminar dependencies muertas (bcrypt, jsonwebtoken)"
```

**CHECKLIST:**
- [ ] npm uninstall ejecutado
- [ ] npm run build OK
- [ ] npm run test OK

---

### **FASE 2: UTILITIES COMPLETAS (1 hora)** 🟠

#### Tarea 2.1: Crear zod-validator.ts (30min)

**src/utility/zod-validator.ts**
```typescript
/**
 * Validador centralizado con Zod
 * REGLA DE ORO #5: SIEMPRE validar inputs con schemas
 */
import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { validationErrorResponse } from './response';

export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
          code: 'VALIDATION_ERROR'
        }));
        return validationErrorResponse(res, errors);
      }
      return res.status(400).json({ success: false, message: 'Validation failed' });
    }
  };
};

export const validateSchema = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  return schema.parse(data);
};
```

#### Tarea 2.2: Crear request-parser.ts (30min)

**src/utility/request-parser.ts**
```typescript
/**
 * Parsear requests y extraer datos validados
 * DRY: Centralizar parseo de requests
 */
import type { Request } from 'express';
import { validateSchema } from './zod-validator';
import type { z } from 'zod';

export const parseBody = <T>(req: Request, schema: z.ZodSchema<T>): T => {
  return validateSchema(schema, req.body);
};

export const parseParams = <T>(req: Request, schema: z.ZodSchema<T>): T => {
  return validateSchema(schema, req.params);
};

export const parseQuery = <T>(req: Request, schema: z.ZodSchema<T>): T => {
  return validateSchema(schema, req.query);
};

export const getUserIdFromRequest = (req: Request): string => {
  const userId = req.userId || req.body.userId || req.query.userId;
  if (!userId) throw new Error('userId requerido');
  return userId;
};
```

**CHECKLIST:**
- [ ] Crear zod-validator.ts
- [ ] Crear request-parser.ts
- [ ] npm run build
- [ ] npm run test

---

#### Tarea 2.3: Crear database-client.ts (opcional pero recomendado)

Este ya existe en user-service. Si lo necesitas, crear abstracción de connection pool.

---

### **FASE 3: BARREL EXPORTS (30 minutos)** 🟡

Crear `index.ts` en cada carpeta:

```typescript
// src/api/index.ts
export { corsMiddleware, requestIdMiddleware, cognitoAuthMiddleware, requireAuthMiddleware } from './middleware';
export { default as userHandler } from './handlers/user.handler';

// src/config/index.ts (ya hecho)

// src/utility/index.ts
export { loggerWithContext as logger } from './logger';
export { AppError, ValidationError, AuthenticationError, NotFoundError } from './errors';
export { validateRequest, validateSchema } from './zod-validator';
export { parseBody, parseParams, parseQuery, getUserIdFromRequest } from './request-parser';

// src/auth/index.ts
export { CognitoVerifierService } from './cognito-verifier';

// src/models/index.ts
export type { User } from '../types';

// [resto igual]
```

**CHECKLIST:**
- [ ] Crear index.ts en todas carpetas
- [ ] npm run build
- [ ] npm run test

---

### **FASE 4: MAKEFILE COMPLETO (45 min)** 🟡

Agregar comandos DB:

```makefile
# ============================================================================
# DATABASE
# ============================================================================

db-start:
	@echo "🐘 Starting PostgreSQL (Docker)..."
	docker-compose up -d postgres adminer
	@echo "✅ PostgreSQL running at localhost:5432"
	@echo "   Adminer available at http://localhost:8080"

db-stop:
	@echo "🛑 Stopping PostgreSQL..."
	docker-compose down
	@echo "✅ PostgreSQL stopped"

db-reset:
	@echo "🧹 Resetting database..."
	docker-compose down -v
	docker-compose up -d postgres
	@sleep 3
	@echo "✅ Database reset complete"

db-logs:
	@docker-compose logs -f postgres

db-shell:
	@echo "📊 Opening psql shell..."
	psql -h localhost -U evilent_user -d express_service_db

migrate:
	@echo "📦 Running migrations..."
	npx knex migrate:latest
	@echo "✅ Migrations complete"

migrate-rollback:
	@echo "↩️ Rolling back migrations..."
	npx knex migrate:rollback
	@echo "✅ Rollback complete"

migrate-make:
	@read -p "Migration name: " name; \
	npx knex migrate:make $$name
```

**CHECKLIST:**
- [ ] Agregar comandos
- [ ] Verificar: `make help` muestra nuevos comandos
- [ ] Probar: `make db-start` y `make db-stop`

---

### **FASE 5: DOCUMENTACIÓN PROGRESO (30 min)** 🟡

Crear `docs/PROGRESO_ACTUAL.md` basado en estructura de user-service:

```markdown
# 📊 PROGRESO ACTUAL - EXPRESS-SERVICE

## ✅ COMPLETADO

- [x] Seguridad (Semana 1): CORS, Request ID, Error Handling, Rate Limiting
- [x] Database Setup (Semana 2a): PostgreSQL, Docker Compose, Knex.js
- [x] UserRepository (Semana 2a): CRUD completo
- [x] Cognito Integration (Semana 2b): JWT verification
- [x] User Profile Endpoints (Semana 2c): GET/POST /user/profile
- [x] Refactorización Crítica (Semana 2d): Estructura normalizada

## 🔄 EN PROGRESO

- [ ] Tests >80% coverage (1-2h)
- [ ] Cognito JWT mocks (1.5h)

## 📋 SIGUIENTE

- [ ] E2E workflows completos
- [ ] Integración con Flutter
- [ ] Deploy a producción
```

**CHECKLIST:**
- [ ] Crear archivo
- [ ] Actualizar cuando completes tareas

---

### **FASE 6: TESTING >80% COVERAGE (2-3 horas)** 🔴

#### Tarea 6.1: Crear Cognito JWT Mocks (1.5h)

**test/mocks/cognito-jwt.mock.ts**
```typescript
/**
 * Cognito JWT Mock - Para tests sin credenciales AWS
 */
import jwt from 'jsonwebtoken';

const SECRET = 'test-secret-key-very-secure';

export const createMockCognitoToken = (payload: {
  sub: string;
  email: string;
  email_verified?: boolean;
}) => {
  return jwt.sign(payload, SECRET, {
    algorithm: 'HS256',
    expiresIn: '1h'
  });
};

export const verifyMockToken = (token: string) => {
  return jwt.verify(token, SECRET);
};

export const MOCK_USER_TOKENS = {
  valid: createMockCognitoToken({
    sub: 'user-123',
    email: 'user@example.com',
    email_verified: true
  }),
  invalid: 'invalid.token.here'
};
```

#### Tarea 6.2: Actualizar Tests con Mocks (1h)

Actualizar `test/integration/user.profile.test.ts` para usar mocks:

```typescript
import { MOCK_USER_TOKENS } from '../mocks/cognito-jwt.mock';

it('debe obtener perfil autenticado', async () => {
  const response = await request(app)
    .get('/user/profile')
    .set('Authorization', `Bearer ${MOCK_USER_TOKENS.valid}`);
  
  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty('data.id');
});
```

#### Tarea 6.3: Alcanzar >80% Coverage (1h)

Corregir tests fallantes basado en errores reales.

**CHECKLIST:**
- [ ] npm run test corre sin fallos
- [ ] Coverage >80% global
- [ ] Services >90% coverage
- [ ] Handlers >85% coverage

---

### **FASE 7: VERIFICACIÓN FINAL (30 min)** ✅

**CHECKLIST FINAL:**

```bash
# 1. Compilación
npm run build                           # ✅ Sin errores

# 2. Linting
npm run lint                            # ✅ Sin errores

# 3. Tests
npm run test                            # ✅ >80% coverage

# 4. Estructura
ls -la src/api/handlers/                # ✅ Exist handlers/
ls -la src/api/middleware/              # ✅ Exist middleware/
ls -la src/config/*.ts | wc -l         # ✅ 5+ archivos

# 5. Documentación
cat docs/PROGRESO_ACTUAL.md             # ✅ Exist and updated

# 6. Dependencies
npm list --depth=0                      # ✅ No bcrypt, jsonwebtoken
```

---

## 📊 TIMELINE ESTIMADO

| Fase | Tareas | Tiempo | Status |
|------|--------|--------|--------|
| 1.1 | Refactorizar estructura | 1.5h | 👉 |
| 1.2 | Config validation | 1h | 👉 |
| 1.3 | Organizar middleware | 45min | 👉 |
| 1.4 | Eliminar deps muertas | 15min | 👉 |
| 2.1-2 | Utilities | 1h | 👉 |
| 3 | Barrel exports | 30min | 👉 |
| 4 | Makefile | 45min | 👉 |
| 5 | Docs | 30min | 👉 |
| 6.1-3 | Testing >80% | 2-3h | 👉 |
| 7 | Verificación | 30min | 👉 |
| **TOTAL** | **11 tareas** | **8-9h** | **👉** |

---

## ✅ RESULTADO ESPERADO

```
ANTES:                          DESPUÉS:
❌ 62% compliance              ✅ 100% compliance
❌ 45% test coverage           ✅ >80% test coverage
❌ 64/74 tests pasando         ✅ 74/74 tests pasando
❌ Estructura inconsistente    ✅ Igual a user-service
❌ No replicable               ✅ Replicable como template
❌ Documentación incompleta    ✅ Documentación completa
```

---

## 🚀 PRÓXIMO PASO

**¿Empezamos con Tarea 1.1 (Refactorizar estructura)?**

Comando para empezar:
```bash
make help  # Ver comando disponibles
```

Prioridad: **CRÍTICO - Hacer ahora antes de marcar como "completo"**

---

**Documento creado:** 2025-11-15  
**Versión:** 1.0 (Final)  
**Estado:** 👉 Listo para implementación

