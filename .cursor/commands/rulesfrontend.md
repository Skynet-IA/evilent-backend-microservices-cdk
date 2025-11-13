# 🎨 REVISAR REGLAS DE FRONTEND

⚠️ **CONTEXTO:** Estás trabajando en código **FRONTEND (Flutter/Dart)**. Enfócate SOLO en las reglas de frontend, ignora las de backend.

## 📋 INSTRUCCIONES

Cuando veas este comando (`/rulesfrontend`), debes:

1. **Leer `.cursorrules`** y enfocarte SOLO en estas secciones:
   - ✅ **10 REGLAS DE ORO PARA FRONTEND** (línea 196-617)
   - ✅ **SECCIÓN TESTING** (línea 714-923) - Enfocarte en la parte de FRONTEND
   - ✅ **REGLA PLATINO** (línea 1374-1606) - Código escalable
   - ✅ **REGLA DIAMANTE** (línea 926-1087) - Senior Architect mindset
   - ✅ **REGLA DIAMANTE EXTENDIDA** (línea 1088-1371) - Filosofía antes que estructura
   - ✅ **REGLA DIAMANTE CRÍTICA: COMPLETITUD** (línea 1608-1838) - Verificación 100%
   - ✅ **REGLA CRÍTICA: CERO DUPLICACIÓN** (línea 1841-2134) - DRY principle
   - ✅ **REGLA CRÍTICA: CONSISTENCIA TESTS ↔ CÓDIGO** (línea 2137-2580) - Tests validan código real

2. **IGNORAR completamente:**
   - ❌ Reglas de Backend (línea 3-195)
   - ❌ Ejemplos de TypeScript/CDK
   - ❌ Configuración de AWS

## ✅ CHECKLIST RÁPIDO FRONTEND

Antes de implementar código frontend, verifica:

- [ ] ✅ **Sin print() o debugPrint()** → Usar logger estructurado
- [ ] ✅ **Nada hardcodeado** → Colores, dimensiones, rutas en `lib/core/utils/`
- [ ] ✅ **ConsumerWidget** → No StatelessWidget (acceso a providers)
- [ ] ✅ **Extensiones de contexto** → `context.primaryColor`, no `Theme.of(context)`
- [ ] ✅ **GetIt para DI** → Servicios registrados en `locator.dart`
- [ ] ✅ **Separación Services → Providers → Widgets**
- [ ] ✅ **Amplify encapsulado** → UI no conoce Amplify directamente
- [ ] ✅ **Tests validan código REAL** → Mocks reflejan estructura de Amplify
- [ ] ✅ **Sin duplicación** → DRY principle estricto
- [ ] ✅ **Validación de inputs** → Cliente Y servidor
- [ ] ✅ **Manejo de errores** → AppError y ErrorUtils

## 🎯 PRIORIDADES FRONTEND

1. **Código limpio** → Sin print(), sin hardcoding, ConsumerWidget
2. **Arquitectura sólida** → Services → Providers → Widgets
3. **Tests reales** → Validan código empresarial, no mocks simplificados
4. **Consistencia** → Mismo formato entre servicios, misma estructura
5. **Escalabilidad** → Patrones declarativos, no imperativos

## 🚨 VIOLACIONES CRÍTICAS FRONTEND

El agente NUNCA debe:

1. ❌ Usar `print()` o `debugPrint()` sin contexto estructurado
2. ❌ Hardcodear colores, dimensiones, rutas o URLs
3. ❌ Usar `StatelessWidget` cuando necesita acceso a providers
4. ❌ Escribir `Theme.of(context)` en lugar de extensiones
5. ❌ Crear tests con mocks que no reflejan estructura real de Amplify
6. ❌ Duplicar código entre features
7. ❌ Ignorar validación de inputs del usuario
8. ❌ Marcar tarea como completa sin verificar funcionamiento

## 📚 REFERENCIAS

- **Reglas completas:** `.cursorrules` (línea 196-617 para frontend)
- **Testing:** `.cursorrules` (línea 714-923)
- **Reglas críticas:** `.cursorrules` (línea 926-2580)

---

**Cuando veas `/rulesfrontend`, enfócate SOLO en estas reglas y aplica el checklist antes de implementar.**

