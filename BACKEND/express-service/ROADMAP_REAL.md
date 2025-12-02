# 🚀 EXPRESS-SERVICE - ROADMAP REAL & CONSISTENTE

**Basado en:** Análisis profundo express-service + user-service  
**Contexto:** Express.js monolito (diferente a Lambda serverless)  
**Tests:** PUROS Y DUROS - Validación de código real  

---

## 📊 ESTADO ACTUAL vs OBJETIVO

| Aspecto | Actual | Objetivo | Brecha |
|---------|--------|----------|--------|
| **Compliance /rulesbackend** | 62% | 100% | -38% |
| **Estructura** | 70% ✅ | 100% | -30% |
| **Config Framework** | 20% ❌ | 100% | -80% |
| **Middleware** | 40% ⚠️ | 100% | -60% |
| **Tests** | 45% ❌ | 80% | -35% |
| **Coverage** | 45% ❌ | 80% | -35% |

---

## 🎯 DIFERENCIAS EXPRESS vs USER-SERVICE (LAMBDA)

```
USER-SERVICE (Lambda/Serverless):
  • APIGatewayEvent → event object
  • Middleware como CLASSES estáticas
  • Singleton pattern para reutilización entre invocaciones
  • Route Map + declarativo

EXPRESS-SERVICE (Node.js/Monolito):
  • Request/Response objects (Express)
  • Middleware como FUNCTIONS (Express pattern)
  • Pooling de conexiones
  • Route Map + declarativo (IGUAL que user-service)
```

**DECISIÓN ARQUITECTÓNICA:**
- ✅ Route Map = IGUAL (reutilizable)
- ✅ Service/Repository = IGUAL (lógica de negocio)
- ✅ Config validation = IGUAL (centralizado)
- ❌ Middleware = ADAPTADO (Express vs Lambda)

---

## 🔧 TAREAS REALES (NO ESPECULATIVAS)

### FASE 1: COMPLETAR CONFIG FRAMEWORK (2-3 horas)

**Estado Actual:**
```
✅ src/config/constants.ts              (EXISTE, completo)
❌ src/config/config-types.ts          (FALTA - tipos)
❌ src/config/config-schema.ts         (FALTA - validación Zod)
❌ src/config/validated-constants.ts   (FALTA - aplicar schema)
❌ src/config/index.ts                 (FALTA - barrel export)
```

#### TAREA 1.1: Crear `src/config/config-types.ts`
- Definir interfaces desde `src/config/constants.ts`
- Seguir estructura de user-service
- TypeScript types only, sin lógica

**Tiempo:** 30min

#### TAREA 1.2: Crear `src/config/config-schema.ts`
- Validar tipos con Zod (seguir user-service)
- Incluir COGNITO_POOL_ID, COGNITO_APP_CLIENT_ID, PORT, DB_*
- Fail-fast en variables requeridas

**Tiempo:** 45min

#### TAREA 1.3: Crear `src/config/validated-constants.ts`
- Parsear env vars + validar con schema
- Exportar config validado
- Log al startup si falla

**Tiempo:** 45min

#### TAREA 1.4: Crear `src/config/index.ts` (barrel export)
- Importar y exportar config validado
- Importar constants

**Tiempo:** 15min

---

### FASE 2: COMPLETAR MIDDLEWARE (1.5-2 horas)

**Estado Actual:**
```
✅ src/api/middleware/request-id.middleware.ts  (EXISTE)
❌ src/api/middleware/auth.middleware.ts        (FALTA - clase based)
❌ src/api/middleware/index.ts                  (FALTA - barrel)
❌ src/auth/cognito-middleware.ts               (MOVER a api/middleware)
❌ src/auth/                                     (ELIMINAR carpeta)
```

#### TAREA 2.1: Crear `src/api/middleware/auth.middleware.ts` (Express adapted)
- **CRÍTICO:** Express usa FUNCTION pattern, NO class pattern (diferente a Lambda)
- Extraer Bearer token del header Authorization
- Usar CognitoVerifierService para validar
- Si falla → res.status(401).json(...) + return
- Si OK → req.user = { userId, userEmail } + next()

**Patrón CORRECTO para Express:**
```typescript
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    res.status(401).json({ success: false, message: 'No token' });
    return;
  }
  
  CognitoVerifierService.getInstance().verifyToken(token)
    .then(claims => {
      req.user = claims;
      next();
    })
    .catch(() => {
      res.status(401).json({ success: false, message: 'Invalid token' });
    });
}
```

**NO COPIAR user-service class pattern** - Express es middleware functions, no Lambda handlers.

**Tiempo:** 45min

#### TAREA 2.2: Crear `src/api/middleware/index.ts` (barrel)
- Exportar todos los middleware
- Seguir patrón user-service

**Tiempo:** 15min

#### TAREA 2.3: Eliminar y Reorganizar archivos de auth
- ❌ **NO MOVER** `src/auth/cognito-middleware.ts` (es incompatible - función Express)
- ✅ **ELIMINAR** `src/auth/cognito-middleware.ts` (REEMPLAZADO por requireAuth en TAREA 2.1)
- ✅ **MANTENER** `src/auth/cognito-verifier.ts` (servicío de verificación, ubicación correcta)
- ✅ **RESULTADO:** src/auth/ solo contiene cognito-verifier.ts (limpio)

**NOTA CRÍTICA:** cognito-middleware.ts actual es una función Express que YA está haciendo lo que necesitamos. 
TAREA 2.1 crea version mejorada como `requireAuth` en src/api/middleware/auth.middleware.ts

**Tiempo:** 10min

#### TAREA 2.4: Actualizar imports en `src/bin/express-service.ts`
- ✅ Importar `requireAuth` desde `src/api/middleware/auth.middleware.ts`
- ✅ En handlers específicos: `app.get('/user/profile', requireAuth, handler)`
- ✅ NO aplicar requireAuth globalmente (solo en rutas que lo necesiten)
- ✅ Eliminar import de `src/auth/cognito-middleware` (ya no se usa)

**Patrón Express correcto:**
```typescript
// Usar middleware solo donde se necesita
app.get('/user/profile', requireAuth, getUserProfile);
app.post('/user/profile', requireAuth, updateUserProfile);

// Rutas públicas NO tienen requireAuth
app.get('/health', getHealth);
app.get('/info', getInfo);
```

**Tiempo:** 30min

---

### FASE 3: UTILITIES COMPLETOS (1.5-2 horas)

**Estado Actual:**
```
✅ src/utility/logger.ts              (EXISTE, completo)
✅ src/utility/response.ts            (EXISTE, completo)
✅ src/utility/errors.ts              (EXISTE, clases OK)
❌ src/utility/request-parser.ts      (FALTA - validar Zod)
❌ src/utility/zod-validator.ts       (FALTA - centralizar schemas)
❌ src/utility/helpers.ts             (FALTA - formatters)
```

#### TAREA 3.1: Crear `src/utility/zod-validator.ts`
- Centralizar TODOS los Zod schemas
- User profile: firstName, lastName, email
- Pagination: page, pageSize
- Seguir patrón user-service

**Tiempo:** 45min

#### TAREA 3.2: Crear `src/utility/request-parser.ts`
- Función `parseAndValidate<T>(data, schema)`
- Retorna `{ data, errors }` (union type)
- Seguir user-service estructura

**Tiempo:** 45min

#### TAREA 3.3: Crear `src/utility/helpers.ts`
- `formatUser(user)` - standarizar formato
- `buildSuccessResponse(data, status)` - response helper
- Útiles para handlers

**Tiempo:** 30min

---

### FASE 4: HANDLERS REFACTOR (1.5 horas)

**Estado Actual:**
- `src/api/user.handler.ts` (duplicado)
- `src/api/handlers/user.handler.ts` (el real)

#### TAREA 4.1: Eliminar duplicado
- Borrar `src/api/user.handler.ts`

**Tiempo:** 5min

#### TAREA 4.2: Refactor `src/api/handlers/user.handler.ts`
- Usar `requireAuth` middleware antes de handlers
- Validación con `zod-validator.ts`
- Usar `formatUser()` para responses
- Usar `parseAndValidate()` para parsing

**Handlers to update:**
- GET /user/profile → requireAuth + fetch
- POST /user/profile → requireAuth + validar + update
- Mantener Route Map pattern

**Tiempo:** 1h

---

### FASE 5: TESTING REAL (4-5 horas)

**Estado Actual:**
```
❌ 10/74 tests FALLANDO
❌ Coverage: 45% (target 80%)
❌ Mocks inconsistentes
```

#### TAREA 5.1: Corregir mocks inconsistentes (1-2h)
- Revisar failing tests
- Mocks deben reflejar EXACTO estructura de código
- BD REAL para integración (no mockeada)

**Tests a corregir:**
- 10/74 currently failing
- Análisis detallado de cada fallo

**Tiempo:** 1-2h

#### TAREA 5.2: Agregar tests de utilities (1h)
- `test/unit/utility/zod-validator.test.ts`
- `test/unit/utility/request-parser.test.ts`
- `test/unit/utility/helpers.test.ts`
- Coverage >80%

**Tiempo:** 1h

#### TAREA 5.3: Agregar tests E2E (1-2h)
- Flow completo: GET /profile → POST /profile
- Cognito mock realista
- Error handling

**Tiempo:** 1-2h

#### TAREA 5.4: Verificación final
- `npm test` → 74/74 pasando
- `npm test -- --coverage` → 80%+

**Tiempo:** 30min

---

### FASE 6: MAKEFILE & DOCUMENTACIÓN (1 hora)

#### TAREA 6.1: Completar Makefile
```makefile
# Database
db-start:
  docker-compose up -d

db-stop:
  docker-compose down

# Testing
test:
  npm test

test-coverage:
  npm test -- --coverage
```

**Tiempo:** 30min

#### TAREA 6.2: Actualizar PROGRESO_ACTUAL.md
- Mark completed tasks
- Update metrics
- Document blockers

**Tiempo:** 30min

---

## 📊 TIMELINE REALISTA

| Fase | Tareas | Horas | Status |
|------|--------|-------|--------|
| 1 | Config Framework | 2-3h | ⏳ Pending |
| 2 | Middleware | 1.5-2h | ⏳ Pending |
| 3 | Utilities | 1.5-2h | ⏳ Pending |
| 4 | Handlers Refactor | 1.5h | ⏳ Pending |
| 5 | Testing REAL | 4-5h | ⏳ Pending |
| 6 | Makefile & Docs | 1h | ⏳ Pending |
| **TOTAL** | | **11-15h** | |

---

## ✅ DEFINICIÓN DE "COMPLETO"

```
✅ 100% compliance con /rulesbackend
✅ Estructura 100% consistente con user-service (adaptada para Express)
✅ 80%+ coverage (enfoque TESTING PUROS Y DUROS)
✅ 74/74 tests pasando
✅ npm run build → sin errores
✅ npm run test → sin errores
✅ Makefile funcionando
✅ PROGRESO_ACTUAL.md actualizado
```

---

## 🚀 PRÓXIMO PASO

1. **Leer este roadmap** (no el anterior)
2. **Empezar FASE 1** (Config Framework)
3. **Seguir orden** → No saltarse fases
4. **Verificar cada tarea** antes de pasar a siguiente

---

## ⚠️ NOTAS CRÍTICAS

1. **Tests PUROS Y DUROS**: BD REAL (PostgreSQL), mocks REALES, validación EXACTA
2. **Express adapted patterns**: Middleware = functions (req, res, next), NO copiar Lambda
3. **Route Map = IGUAL**: Patrón declarativo es reutilizable
4. **Config Framework = IGUAL**: Validación centralizada es universal
5. **No especulación**: Solo tareas que están 100% identificadas

