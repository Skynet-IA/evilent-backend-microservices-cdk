# 🛣️ ROADMAP - EXPRESS-SERVICE

**De Template a Production-Ready + Flutter Integration**

---

## 📊 ESTADO ACTUAL vs META

```
AHORA (V1.0):                    META (V2.0):
✅ Arquitectura                  ✅ Todo lo anterior
✅ Logger                        ✅ PostgreSQL real
✅ Validación Zod               ✅ Auth completa
✅ JWT (mock)                   ✅ Seguridad robusta
❌ BD persistente                ✅ Flutter integration
❌ CORS                          ✅ Tests >85%
❌ Rate limiting                 ✅ Monitoring
❌ Error handling avanzado       ✅ Production-ready
❌ Flutter integration
```

---

## 🎯 ACTIVIDADES POR ORDEN

### **SEMANA 1: SEGURIDAD CRÍTICA**

| # | Tarea | Tiempo | Dependencias | Verificación |
|---|-------|--------|--------------|--------------|
| **1** | Instalar CORS middleware | 30 min | Ninguno | `curl -H "Origin: http://localhost:8000" http://localhost:3000/health` retorna headers |
| **2** | Request ID tracking (UUID) | 1h | #1 | `X-Request-ID` en response headers |
| **3** | Error handling avanzado (custom errors) | 1.5h | #2 | Errores retornan código HTTP correcto |
| **4** | Rate limiting middleware | 45 min | #3 | `curl` 101 veces retorna 429 en request #101 |

**Total: 2-3 horas | Blocker para Flutter**

---

### **SEMANA 1-2: DATABASE INTEGRATION**

| # | Tarea | Tiempo | Dependencias | Verificación |
|---|-------|--------|--------------|--------------|
| **5** | Setup PostgreSQL (Docker o local) | 1h | #1-4 | `psql -d express_service_db` conecta |
| **6** | SQL migrations (users table) | 1.5h | #5 | `\dt` en psql muestra tabla users |
| **7** | UserRepository real (reemplazar mocks) | 1.5h | #6 | `POST /users` guarda en DB, no en memoria |

**Total: 3-4 horas | Depende: Semana 1 completada**

---

### **SEMANA 2: AUTENTICACIÓN PRODUCTION**

| # | Tarea | Tiempo | Dependencias | Verificación |
|---|-------|--------|--------------|--------------|
| **8** | Password hashing con bcrypt | 1h | #7 | Password hasheado en DB, no plain text |
| **9** | Login/Signup endpoints (con DB) | 1.5h | #8 | `POST /auth/signup` retorna JWT válido |
| **10** | Token refresh (access + refresh tokens) | 1h | #9 | Refresh token rota correctamente |

**Total: 2-3 horas | Depende: Semana 1-2 completadas**

---

### **SEMANA 2: TESTING**

| # | Tarea | Tiempo | Dependencias | Verificación |
|---|-------|--------|--------------|--------------|
| **11** | Integration tests con PostgreSQL | 2h | #7 | `npm run test:integration` pasa con >85% coverage |
| **12** | E2E tests (Signup → Login → Get Users) | 1.5h | #10 | Flujos completos funcionan |
| **13** | Performance tests | 1h | #12 | <100ms latency en endpoints |

**Total: 3-4 horas | Depende: #7-10 completadas**

---

### **SEMANA 3: OBSERVABILIDAD Y DOCUMENTACIÓN**

| # | Tarea | Tiempo | Dependencias | Verificación |
|---|-------|--------|--------------|--------------|
| **14** | Health checks avanzados (DB + memoria + uptime) | 1h | #7 | `GET /health` retorna status completo |
| **15** | API versioning `/api/v1/...` | 1h | #9 | Endpoints bajo `/api/v1/` funcionales |
| **16** | Swagger documentation | 1h | #15 | `GET /docs` retorna Swagger UI |

**Total: 2-3 horas | Depende: #7-10 completadas**

---

### **SEMANA 3-4: INTEGRACIÓN FLUTTER**

| # | Tarea | Tiempo | Dependencias | Verificación |
|---|-------|--------|--------------|--------------|
| **17** | HttpClient Flutter → Express-Service | 1h | #1 (CORS) | `flutter run` sin errores de conexión |
| **18** | AuthService + AuthProvider (Riverpod) | 1h | #9 + #17 | Login/Signup funciona desde Flutter |
| **19** | Login Screen UI integrada | 1h | #18 | Pantalla de login autentica usuario |
| **20** | E2E test Flutter ↔ Express | 1h | #19 | Flujo completo: Signup → Login → Datos |

**Total: 2-3 horas | Depende: #1-16 completadas**

---

## 📋 CHECKLIST POR FASE

### ✅ Después de Actividades #1-4 (Semana 1)
```
☐ CORS habilitado
☐ Request ID en logs y headers
☐ Error handling funcional
☐ Rate limiting activo
☐ Flutter app puede conectarse
```

### ✅ Después de Actividades #5-7 (Semana 1-2)
```
☐ PostgreSQL corriendo
☐ Migrations ejecutadas
☐ CRUD guardar datos reales en DB
☐ Mocks desaparecen
```

### ✅ Después de Actividades #8-10 (Semana 2)
```
☐ Signup crea usuario hasheado
☐ Login retorna JWT válido
☐ Refresh token funciona
☐ Auth end-to-end completa
```

### ✅ Después de Actividades #11-13 (Semana 2)
```
☐ Coverage >85%
☐ Todos los tests pasan
☐ Performance <100ms
☐ Confianza en código
```

### ✅ Después de Actividades #14-16 (Semana 3)
```
☐ /health retorna status de dependencias
☐ /api/v1/ endpoints funcionales
☐ /docs muestra Swagger UI
```

### ✅ Después de Actividades #17-20 (Semana 3-4)
```
☐ Flutter autentica con express-service
☐ Login screen funciona
☐ CRUD desde Flutter funciona
☐ E2E test pasa
☐ Production-ready
```

---

## 🚀 QUICK START (AHORA)

```bash
cd BACKEND/express-service

# Ejecutar Actividad #1-4 (2-3 horas):
# 1. npm install cors
# 2. Agregar middleware CORS a src/bin/express-service.ts
# 3. Crear src/utility/request-id.ts
# 4. npm install express-rate-limit
# 5. Verificar: npm run build && make dev

# Verificar
curl -H "Origin: http://localhost:8000" http://localhost:3000/health
```

---

## 📊 RESUMEN

| Métrica | Valor |
|---------|-------|
| **Total horas** | 16-18h |
| **Actividades** | 20 |
| **Semanas** | 3-4 |
| **Coverage final** | >85% |
| **BD** | PostgreSQL |
| **Auth** | Signup/Login/Refresh |
| **Flutter** | ✅ Integrado |
| **Estado** | Production-ready |

---

**Próximo paso: Actividades #1-4 (Semana 1 - Seguridad Crítica)**

