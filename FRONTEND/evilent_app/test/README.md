# 🧪 TESTING - EVILENT APP

**Estado:** 🚀 EMPEZANDO DE CERO (FASE 0 - 70% COMPLETADA)

---

## 📊 OBJETIVO

Implementar **280+ tests** con **80%+ cobertura** siguiendo las 10 REGLAS DE ORO del proyecto.

**Roadmap completo:** Ver `../../ROADMAP_TESTING_DESDE_CERO.md`

---

## 📁 ESTRUCTURA

```
test/
├── fixtures/              # Datos reutilizables (DRY)
│   ├── auth_fixtures.dart           ✅ HECHO
│   ├── app_data_fixtures.dart       ✅ HECHO
│   ├── error_fixtures.dart          ✅ HECHO
│   └── product_fixtures.dart        ✅ HECHO
│
├── helpers/               # Utilidades de testing
│   ├── test_app_wrapper.dart        ✅ HECHO
│   └── test_helpers.dart            ✅ HECHO
│
├── mocks/                 # Mocks de servicios (POR CREAR)
│   ├── custom_mocks/
│   └── repositories/
│
├── unit/                  # Tests unitarios (POR CREAR)
│   ├── services/          (60 tests)
│   ├── providers/         (50 tests)
│   └── error_system/      (30 tests)
│
├── widget/                # Tests de widgets (POR CREAR)
│   ├── screens/           (85 tests)
│   └── components/        (35 tests)
│
└── integration/           # Tests de integración (POR CREAR)
    └── flows/             (20 tests)
```

---

## 🎯 PATRÓN AAA - OBLIGATORIO EN TODO TEST

```dart
test('descripción clara del comportamiento', () async {
  // ✅ ARRANGE: Preparar datos y mocks
  final input = 'test@example.com';
  
  // ✅ ACT: Ejecutar función
  final result = await service.doSomething(input);
  
  // ✅ ASSERT: Verificar resultado
  expect(result, isNotNull);
});
```

---

## 🚀 COMANDOS ÚTILES

```bash
# Ejecutar todos los tests
flutter test

# Ejecutar tests específicos
flutter test test/unit/services/auth_service_test.dart

# Watch mode (re-ejecuta al guardar)
flutter test --watch

# Con cobertura
flutter test --coverage

# Ver reporte de cobertura
genhtml coverage/lcov.info -o coverage/html
open coverage/html/index.html

# Generar mocks (si se agregan nuevas clases)
flutter pub run build_runner build --delete-conflicting-outputs
```

---

## ✅ CHECKLIST ANTES DE PUSH

- [ ] Patrón AAA en todos los tests
- [ ] Happy path + Error path + Edge cases
- [ ] Fixtures reutilizables (sin duplicación)
- [ ] Nombres descriptivos de tests
- [ ] Todos los tests PASAN
- [ ] Coverage ≥ 80% en código nuevo
- [ ] Sin console.log o print statements

---

## 📚 RECURSOS

- **Roadmap completo:** `../../ROADMAP_TESTING_DESDE_CERO.md`
- **Guía de estructura:** `../../TESTING_STRUCTURE_GUIDE.md`
- **Resumen ejecutivo:** `../../TESTING_EXECUTIVE_SUMMARY.md`
- **Reglas de Cursor:** `../../.cursorrules` (Sección 8 - Testing)

---

## 🎓 REGLAS CLAVE

### 1. NUNCA usar datos duplicados
```dart
// ❌ INCORRECTO: Duplicar en cada test
test('test1', () { final email = 'test@example.com'; });
test('test2', () { final email = 'test@example.com'; });

// ✅ CORRECTO: Usar fixtures
test('test1', () { final email = AuthFixtures.validEmail; });
test('test2', () { final email = AuthFixtures.validEmail; });
```

### 2. NUNCA ignorar excepciones
```dart
// ❌ INCORRECTO: try-catch vacío
try { await service.doSomething(); } catch (e) {}

// ✅ CORRECTO: Validar excepción
expect(
  () => service.doSomething(),
  throwsA(isA<ExpectedException>()),
);
```

### 3. SIEMPRE tests independientes
```dart
// ❌ INCORRECTO: Estado compartido
var counter = 0;
test('test1', () => counter++);
test('test2', () => expect(counter, 1)); // Falla si test1 no corre

// ✅ CORRECTO: setUp() para cada test
setUp(() { counter = 0; });
test('test1', () => counter++);
test('test2', () => expect(counter, 1)); // Siempre funciona
```

---

## 🔥 PRÓXIMO PASO

**FASE 1: UNIT TESTS - SERVICES (20 horas)**
- AuthService (11 tests)
- BootService (15 tests)
- Y más...

Ver roadmap para detalles.

---

**¡Happy Testing! 🧪**
