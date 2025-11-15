# 🛣️ ROADMAP IMPLEMENTACIÓN - EXPRESS-SERVICE

**De Template + Semana 1 → Production-Ready + Flutter Integration**

---

## 📊 CONTEXTO

```
ESTADO ACTUAL (Post Semana 1):
✅ Arquitectura base + escalable
✅ Logger estructurado
✅ CORS middleware
✅ Request ID tracking
✅ Error handling avanzado
✅ Rate limiting
✅ Validación Zod
✅ JWT auth (mock)
✅ Tests >85% (solo API layer)

OBJETIVO (V2.0 - Production):
✅ Todo lo anterior
✅ PostgreSQL real (persistencia)
✅ UserRepository real
✅ Endpoints para Frontend
✅ Password hashing (bcrypt)
✅ Login/Signup/Refresh tokens
✅ Tests >85% (incluyendo DB)
✅ Integración Flutter 100%

FRONTEND ESPERANDO:
✅ GET /user/profile → obtener perfil
✅ POST /user/profile → crear/actualizar perfil (UPSERT)
✅ Autenticación completa
```

---

## 🎯 PLAN DETALLADO

### **FASE 1: DATABASE INTEGRATION (Semana 2 - Part 1)**

#### **Actividad #5: Setup PostgreSQL**
| Item | Detalle |
|------|---------|
| **Tiempo** | 1h |
| **Objetivo** | Tener PostgreSQL corriendo |
| **Tareas** | 1. Docker Compose con PostgreSQL<br>2. .env con DB credentials<br>3. Connection string configurado<br>4. Verificación: `psql -d express_service_db` |
| **Verificación** | Conectar a DB desde terminal |
| **Archivos** | docker-compose.yml, .env.local |

#### **Actividad #6: SQL Migrations**
| Item | Detalle |
|------|---------|
| **Tiempo** | 1.5h |
| **Objetivo** | Schema de base de datos |
| **Tareas** | 1. Instalar `typeorm` o `knex`<br>2. Crear migrations (users table)<br>3. Ejecutar migrations<br>4. Verificar schema |
| **Verificación** | `\dt` en psql muestra `users` table |
| **Schema** | id, email (unique), password_hash, firstName, lastName, createdAt, updatedAt |
| **Archivos** | src/db/migrations/, .database.sql |

#### **Actividad #7: UserRepository Real**
| Item | Detalle |
|------|---------|
| **Tiempo** | 1.5h |
| **Objetivo** | Reemplazar mock repository con DB real |
| **Tareas** | 1. Crear `src/repository/user.repository.ts`<br>2. Métodos: create, findById, findByEmail, list, update, delete<br>3. Connection pooling<br>4. Error handling<br>5. Logger en cada operación |
| **Verificación** | `POST /users` guarda en DB (no en memoria) |
| **DI** | UserService recibe UserRepository inyectado |
| **Archivos** | src/repository/user.repository.ts, src/db/connection.ts |

---

### **FASE 2: AUTENTICACIÓN PRODUCTION (Semana 2 - Part 2)**

#### **Actividad #8: Password Hashing (bcrypt)**
| Item | Detalle |
|------|---------|
| **Tiempo** | 1h |
| **Objetivo** | Hashear passwords antes de guardar |
| **Tareas** | 1. Instalar `bcrypt`<br>2. Crear `src/utility/password.ts`<br>3. hashPassword() y comparePassword()<br>4. Usar en UserService.create() |
| **Verificación** | DB guarda password hasheado, no plain text |
| **Seguridad** | Nunca retornar password en responses |
| **Archivos** | src/utility/password.ts |

#### **Actividad #9: Login/Signup Endpoints**
| Item | Detalle |
|------|---------|
| **Tiempo** | 1.5h |
| **Objetivo** | Endpoints de autenticación reales |
| **Endpoints** | POST /auth/signup, POST /auth/login |
| **Signup** | 1. Validar email único (Zod)<br>2. Hash password<br>3. Crear usuario en DB<br>4. Retornar JWT + refresh token |
| **Login** | 1. Validar credenciales<br>2. Verificar password hasheado<br>3. Retornar JWT + refresh token |
| **Response** | `{ accessToken, refreshToken, user: { id, email, firstName } }` |
| **Verificación** | `POST /auth/signup` retorna JWT válido |
| **Archivos** | src/api/auth.handler.ts, src/service/auth.service.ts |

#### **Actividad #10: Token Refresh**
| Item | Detalle |
|------|---------|
| **Tiempo** | 1h |
| **Objetivo** | Refresh token rotation |
| **Endpoint** | POST /auth/refresh |
| **Lógica** | 1. Validar refresh token<br>2. Verificar que no esté revocado<br>3. Generar nuevo access token<br>4. Opcionalmente rotar refresh token |
| **Verificación** | `POST /auth/refresh` retorna nuevo JWT |
| **Archivos** | src/api/auth.handler.ts (agregar refresh) |

---

### **FASE 3: ENDPOINTS PARA FLUTTER (Semana 2 - Part 3)**

#### **Actividad #11: GET /user/profile**
| Item | Detalle |
|------|---------|
| **Tiempo** | 45 min |
| **Objetivo** | Obtener perfil del usuario autenticado |
| **Endpoint** | GET /user/profile |
| **Auth** | JWT requerido (authMiddleware) |
| **Lógica** | 1. Extraer userId del JWT<br>2. getUserById(userId)<br>3. Retornar perfil |
| **Response** | `{ success: true, data: { id, email, firstName, lastName, createdAt } }` |
| **Verificación** | Frontend recibe perfil completo |
| **Archivos** | src/api/user.handler.ts (agregar getProfile) |

#### **Actividad #12: POST /user/profile (UPSERT)**
| Item | Detalle |
|------|---------|
| **Tiempo** | 1h |
| **Objetivo** | Crear o actualizar perfil (UPSERT) |
| **Endpoint** | POST /user/profile |
| **Auth** | JWT requerido |
| **Lógica** | 1. Extraer userId del JWT<br>2. Verificar si existe usuario<br>3. Si existe: UPDATE<br>4. Si no existe: CREATE (luego integrar con signup) |
| **Validación** | firstName, lastName (min 1, max 50) |
| **Response** | `{ success: true, data: { ...perfil actualizado } }` |
| **Verificación** | Frontend actualiza perfil sin errores |
| **Archivos** | src/api/user.handler.ts (agregar updateProfile) |

---

### **FASE 4: TESTING COMPLETO (Semana 2 - Part 4)**

#### **Actividad #13: Integration Tests con PostgreSQL**
| Item | Detalle |
|------|---------|
| **Tiempo** | 2h |
| **Objetivo** | Tests end-to-end con DB real |
| **Tests** | 1. CREATE usuario → guardar en DB<br>2. READ usuario → obtener de DB<br>3. UPDATE usuario → cambios persisten<br>4. DELETE usuario → se elimina de DB |
| **Setup** | Test database separado (test_express_service_db) |
| **Cleanup** | Limpiar DB después de cada test |
| **Coverage** | >85% en handlers, >90% en services |
| **Verificación** | `npm run test:integration` pasa |
| **Archivos** | test/integration/user.api.test.ts (actualizar) |

#### **Actividad #14: E2E Tests (Signup → Login → Get Profile)**
| Item | Detalle |
|------|---------|
| **Tiempo** | 1.5h |
| **Objetivo** | Flujos completos funcionando |
| **Flujos** | 1. Signup → JWT válido<br>2. Login → JWT válido<br>3. Get Profile con JWT → datos correctos<br>4. Update Profile → persiste en DB |
| **Verificación** | Cada paso retorna datos esperados |
| **Archivos** | test/e2e/auth.flow.test.ts |

---

### **FASE 5: INTEGRACIÓN FLUTTER (Semana 3)**

#### **Actividad #15: Validar CORS + Headers**
| Item | Detalle |
|------|---------|
| **Tiempo** | 30 min |
| **Objetivo** | Flutter conecta sin errores CORS |
| **Tareas** | 1. Actualizar CORS origin (flutter://...) si aplica<br>2. Verificar X-Request-ID en responses<br>3. Probar desde Flutter dev |
| **Verificación** | `flutter run` sin errores de conexión |
| **Archivos** | src/bin/express-service.ts (CORS config) |

#### **Actividad #16: Verificar Response Format**
| Item | Detalle |
|------|---------|
| **Tiempo** | 30 min |
| **Objetivo** | Respuestas coinciden con lo que espera Frontend |
| **Validar** | 1. GET /user/profile retorna `{ data: {...} }`<br>2. POST /auth/login retorna `{ accessToken, refreshToken }`<br>3. Errores retornan `{ success: false, message, code }` |
| **Verificación** | Frontend no lanza parsing errors |

---

## 📋 DEPENDENCIAS Y ORDEN

```
✅ COMPLETADO (Semana 1):
├─ #1: CORS middleware
├─ #2: Request ID tracking
├─ #3: Error handling avanzado
└─ #4: Rate limiting

👉 SIGUIENTE (Semana 2 - Part 1):
├─ #5: Setup PostgreSQL (BLOCKER)
├─ #6: SQL migrations (depende #5)
└─ #7: UserRepository real (depende #6)

👉 SIGUIENTE (Semana 2 - Part 2):
├─ #8: Password hashing (depende #7)
├─ #9: Login/Signup endpoints (depende #8)
└─ #10: Token refresh (depende #9)

👉 SIGUIENTE (Semana 2 - Part 3):
├─ #11: GET /user/profile (depende #10)
└─ #12: POST /user/profile (depende #11)

👉 SIGUIENTE (Semana 2 - Part 4):
├─ #13: Integration tests (depende #7)
└─ #14: E2E tests (depende #10)

👉 SIGUIENTE (Semana 3):
├─ #15: Validar CORS para Flutter
└─ #16: Verificar response format
```

---

## ⏱️ RESUMEN TIMELINE

| Fase | Actividades | Tiempo | Horas |
|------|-------------|--------|-------|
| **Semana 1** | #1-4 (COMPLETADAS) | 3-4h | ✅ |
| **Semana 2a** | #5-7 (DB) | 3.5h | 👉 |
| **Semana 2b** | #8-10 (Auth) | 3.5h | 👉 |
| **Semana 2c** | #11-12 (User API) | 1.75h | 👉 |
| **Semana 2d** | #13-14 (Tests) | 3.5h | 👉 |
| **Semana 3** | #15-16 (Flutter) | 1h | 👉 |
| **TOTAL** | 20 actividades | 16-17h | |

---

## ✅ CHECKPOINTS DE VALIDACIÓN

### ✅ Después de #7 (UserRepository real)
```
☐ PostgreSQL corriendo
☐ Migrations ejecutadas
☐ CRUD guardar datos reales en DB
☐ Mocks reemplazados
☐ Logs de DB operations
```

### ✅ Después de #10 (Token Refresh)
```
☐ Signup crea usuario con password hasheado
☐ Login retorna JWT válido
☐ Refresh token funciona
☐ Tokens no expiran inesperadamente
```

### ✅ Después de #12 (User Profile API)
```
☐ GET /user/profile obtiene datos correctos
☐ POST /user/profile actualiza perfil
☐ Errores manejados correctamente
☐ Response format consistente
```

### ✅ Después de #14 (E2E Tests)
```
☐ Coverage >85%
☐ Todos los tests pasan
☐ Flujos end-to-end funcionan
☐ DB integración comprobada
```

### ✅ Después de #16 (Flutter Integration)
```
☐ CORS headers presentes
☐ Response format validado
☐ Flutter conecta sin errores
☐ Listo para integración completa
```

---

## 🚀 PRÓXIMO PASO

### Comenzar con **Actividad #5: Setup PostgreSQL**

```bash
cd /Users/clay404/Documents/EVILENT/BACKEND/express-service

# 1. Crear docker-compose.yml
# 2. Configurar .env con DB credentials
# 3. docker-compose up -d
# 4. Verificar conexión: psql -d express_service_db
```

---

## 📊 RESUMEN FINAL

| Métrica | Valor |
|---------|-------|
| **Arquitectura** | ✅ Completa y escalable |
| **Seguridad** | ✅ CORS, JWT, HTTPS-ready |
| **Base de Datos** | 👉 PostgreSQL (pronto) |
| **Autenticación** | 👉 Signup/Login/Refresh (pronto) |
| **Flutter Ready** | 👉 endpoints listos (pronto) |
| **Testing** | 👉 >85% coverage (pronto) |
| **Documentación** | ✅ Clara y detallada |
| **Replicabilidad** | ✅ Template base reutilizable |

---

**Documento creado:** 2024-11-15 06:00 UTC  
**Versión:** 2.0 (Roadmap Refinado)  
**Estado:** 👉 Listo para Actividad #5 (Setup PostgreSQL)

