# 🏗️ REVISAR REGLAS DE BACKEND

⚠️ **CONTEXTO:** Estás trabajando en código **BACKEND (TypeScript/AWS CDK)**. Enfócate SOLO en las reglas de backend, ignora las de frontend.

## 📋 INSTRUCCIONES

Cuando veas este comando (`/rulesbackend`), debes:

1. **Leer `.cursorrules`** y enfocarte SOLO en estas secciones:
   - ✅ **10 REGLAS DE ORO PARA EL BACKEND AWS CDK** (línea 3-195)
   - ✅ **SECCIÓN TESTING** (línea 714-923) - Enfocarte en la parte de BACKEND
   - ✅ **REGLA PLATINO** (línea 1374-1606) - Código escalable
   - ✅ **REGLA DIAMANTE** (línea 926-1087) - Senior Architect mindset
   - ✅ **REGLA DIAMANTE EXTENDIDA** (línea 1088-1371) - Filosofía antes que estructura
   - ✅ **REGLA DIAMANTE CRÍTICA: COMPLETITUD** (línea 1608-1838) - Verificación 100%
   - ✅ **REGLA CRÍTICA: CERO DUPLICACIÓN** (línea 1841-2134) - DRY principle
   - ✅ **REGLA CRÍTICA: CONSISTENCIA TESTS ↔ CÓDIGO** (línea 2137-2580) - Tests validan código real

2. **IGNORAR completamente:**
   - ❌ Reglas de Frontend (línea 196-617)
   - ❌ Ejemplos de Flutter/Dart
   - ❌ Configuración de Riverpod/GetIt

## ✅ CHECKLIST RÁPIDO BACKEND

Antes de implementar código backend, verifica:

- [ ] ✅ **Sin código muerto o especulativo** → Solo lo necesario AHORA
- [ ] ✅ **Sin datos sensibles hardcodeados** → Secrets Manager o .env
- [ ] ✅ **Logger estructurado** → No console.log, usar `src/utility/logger.ts`
- [ ] ✅ **Constantes centralizadas** → En `src/config/constants.ts`
- [ ] ✅ **Validación con Zod** → Todos los inputs validados
- [ ] ✅ **Defense in depth** → JWT en API Gateway Y Lambda
- [ ] ✅ **Documentación actualizada** → README y PROGRESO_ACTUAL.md
- [ ] ✅ **Tests críticos** → Services >90%, Handlers >85%, Utils >80%
- [ ] ✅ **Consistencia arquitectónica** → Mismos patrones entre servicios
- [ ] ✅ **Costos optimizados** → Single-AZ, sin NAT innecesario, Bastion detenido
- [ ] ✅ **Tests validan código REAL** → Mocks reflejan estructura de AWS
- [ ] ✅ **Sin duplicación** → DRY principle estricto
- [ ] ✅ **Patrones escalables** → Route Maps, no switch/if largos

## 🎯 PRIORIDADES BACKEND

1. **Seguridad** → Secrets Manager, defense in depth, validación Zod
2. **Arquitectura sólida** → Consistencia entre servicios, patrones escalables
3. **Tests reales** → Validan código empresarial, no mocks simplificados
4. **Costos** → Optimización inteligente sin sacrificar calidad
5. **Mantenibilidad** → Logger estructurado, constantes centralizadas, documentación

## 🚨 VIOLACIONES CRÍTICAS BACKEND

El agente NUNCA debe:

1. ❌ Escribir código especulativo o muerto
2. ❌ Hardcodear credenciales o datos sensibles
3. ❌ Usar `console.log` en lugar de logger estructurado
4. ❌ Hardcodear valores mágicos (timeouts, nombres de recursos)
5. ❌ Procesar inputs sin validación Zod
6. ❌ Confiar en una sola capa de seguridad
7. ❌ Crear tests con mocks que no reflejan estructura real de AWS
8. ❌ Duplicar código entre servicios
9. ❌ Usar switch/if largos en lugar de Route Maps
10. ❌ Marcar tarea como completa sin verificar funcionamiento

## 📚 ESTRUCTURA BACKEND OBLIGATORIA

```
BACKEND/[service-name]/
├── src/
│   ├── api/              ← Handlers de API Gateway
│   ├── auth/             ← Validación JWT
│   ├── config/           ← Constants, schemas, validación
│   ├── db/               ← Queries, migrations
│   ├── dto/              ← Data Transfer Objects (Zod schemas)
│   ├── models/           ← Modelos de dominio
│   ├── repository/       ← Acceso a datos
│   ├── service/          ← Lógica de negocio
│   ├── types/            ← TypeScript types
│   └── utility/          ← Logger, responses, helpers
├── lib/                  ← CDK Stack definitions
├── test/
│   ├── unit/             ← Services, utils (HIGH PRIORITY)
│   ├── integration/      ← APIs, DB
│   ├── e2e/              ← Flujos completos
│   └── mocks/            ← Mocks realistas
└── Makefile              ← Comandos de deployment
```

## 📊 COVERAGE OBLIGATORIO BACKEND

- ✅ **Services:** >90% (lógica de negocio crítica)
- ✅ **Handlers/Controllers:** >85% (APIs, validación)
- ✅ **Utils:** >80% (funciones reutilizables)
- ✅ **TOTAL:** >80% del proyecto

## 🎯 PATRONES ESCALABLES BACKEND

### ✅ Route Maps (OBLIGATORIO)
```typescript
const routes: Route[] = [
  { method: 'get', requiresPathParams: false, handler: service.GetAll, description: 'GET /resource' },
  { method: 'post', requiresPathParams: false, handler: service.Create, description: 'POST /resource' },
];
```

### ❌ Switch/If largos (PROHIBIDO)
```typescript
switch (method) {
  case 'get': if (hasParams) return handler1(); break;
  // ... 20 líneas más
}
```

## 📚 REFERENCIAS

- **Reglas completas:** `.cursorrules` (línea 3-195 para backend)
- **Testing:** `.cursorrules` (línea 714-923)
- **Reglas críticas:** `.cursorrules` (línea 926-2580)

---

**Cuando veas `/rulesbackend`, enfócate SOLO en estas reglas y aplica el checklist antes de implementar.**

