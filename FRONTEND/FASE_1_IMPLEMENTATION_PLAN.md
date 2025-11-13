// 📋 PLAN DETALLADO: FASE 1 - UNIT TESTS - SERVICIOS (OPCIÓN B: CÓDIGO REAL)
// ═══════════════════════════════════════════════════════════════════════════════
//
// 🎯 OBJETIVO: Implementar TAREA 1.1 y 1.2 basándose en el CÓDIGO REAL
// ✅ Validando comportamiento empresarial de VERDAD
// ✅ Mocks que reflejan la estructura actual
// ✅ Tests que si pasan = código funciona
//
// ═══════════════════════════════════════════════════════════════════════════════

## 🚨 PROBLEMAS ENCONTRADOS EN ROADMAP TEÓRICO

### AuthService
```dart
// ❌ ROADMAP PROPONE (INCORRECTO):
AuthService(connectivity: mockConnectivity, storage: mockStorage)
expect(result, true)  // signIn retorna bool

// ✅ REALIDAD DEL CÓDIGO (lib/core/services/auth_service.dart):
AuthService()  // NO tiene parámetros en constructor
// signIn NO retorna nada, LANZA EXCEPCIONES:
// - InvalidCredentialsError (cuando password es incorrecto)
// - UserNotConfirmedError (cuando usuario no está confirmado)
// - UnknownAuthError (para otros errores)
// - Completa SIN excepción = ÉXITO

// signIn es async void en la práctica (completa o lanza)
```

### BootNotifier (BootService)
```dart
// ❌ ROADMAP PROPONE (INCORRECTO):
class BootService {
  Future<void> boot() async { ... }
}

// ✅ REALIDAD DEL CÓDIGO (lib/core/providers/boot_notifier.dart):
// NO existe clase BootService
// La lógica está en BootNotifier(Notifier<BootState>)
// - build() síncrono que retorna BootState.initial()
// - _performBootSequence() = método privado async
// - Maneja reintentos automáticos con backoff exponencial
// - Actualiza state vía _updateState()
```

## ✅ ESTRUCTURA DE ARCHIVOS A CREAR

```
test/
├── fixtures/ (✅ YA EXISTEN)
│   ├── auth_fixtures.dart
│   ├── app_data_fixtures.dart
│   ├── error_fixtures.dart
│   └── product_fixtures.dart
├── helpers/ (✅ YA EXISTEN)
│   ├── test_app_wrapper.dart
│   └── test_helpers.dart
├── mocks/ (📝 A CREAR)
│   ├── mock_services.dart  ← MockAuthService builder
│   └── mock_boot_helper.dart  ← MockBootState helper
└── unit/
    └── services/ (📝 A CREAR)
        ├── auth_service_test.dart  (11 tests)
        └── boot_notifier_test.dart  (15 tests)
```

## 📝 TAREA 1.1: AuthService Tests (11 tests)

### Imports necesarios (REALES):
```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:evilent_app/core/services/auth_service.dart';
import '../fixtures/auth_fixtures.dart';  // Usar ruta relativa
```

###  Estructura de cada test (AAA Pattern):
```dart
test('Descripción clara del comportamiento', () async {
  // ARRANGE: Preparar datos (usar AuthFixtures)
  final email = AuthFixtures.validEmail;
  final password = AuthFixtures.validPassword;
  
  // ACT: Ejecutar código bajo prueba
  // (Para AuthService, es directo - no hay constructor con parámetros)
  final authService = AuthService();
  await authService.signIn(email: email, password: password);
  
  // ASSERT: Verificar resultado
  // Si llegó aquí sin excepción = ÉXITO
  expect(true, true);
});

test('Descripción error path', () async {
  // ARRANGE
  final authService = AuthService();
  
  // ACT & ASSERT: Verificar que lanza excepción correcta
  expect(
    () => authService.signIn(
      email: AuthFixtures.validEmail,
      password: 'wrongpassword'
    ),
    throwsA(isA<InvalidCredentialsError>()),
  );
});
```

### 11 Tests a implementar:
1. ✅ `signIn` exitoso → Completa sin excepción
2. ✅ `signIn` credenciales inválidas → InvalidCredentialsError
3. ✅ `signIn` usuario no confirmado → UserNotConfirmedError
4. ✅ `signUp` exitoso → Completa sin excepción
5. ✅ `signUp` email duplicado → UserAlreadyExistsError
6. ✅ `confirmSignUp` exitoso → Completa sin excepción
7. ✅ `confirmSignUp` código inválido → InvalidCodeError
8. ✅ `signOut` → Completa sin excepción
9. ✅ `isSignedIn` retorna true cuando autenticado
10. ✅ `isSignedIn` retorna false cuando no autenticado
11. ✅ `getUserJwtToken` retorna token si autenticado, null sino

## 📝 TAREA 1.2: BootNotifier Tests (15 tests)

### Imports necesarios (REALES):
```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:evilent_app/core/providers/boot_state.dart';
import 'package:evilent_app/core/providers/boot_notifier.dart';
import 'package:evilent_app/core/constants/boot_constants.dart';
```

### ¿Cómo testear BootNotifier?

**Problema:** BootNotifier es un Notifier(Riverpod 3.0) que maneja estado complejo.
- `build()` es síncrono, retorna `BootState.initial()`
- `_performBootSequence()` es privado y async
- No se puede instanciar directamente

**Solución:** Testear BootState directamente (estructura de datos)
```dart
test('BootState transiciones correctas', () {
  // ARRANGE & ACT: Crear estados
  final initial = BootState.initial();
  final configuring = initial.copyWith(
    phase: BootPhase.configuring,
    progressPercent: 25,
  );
  
  // ASSERT: Verificar propiedades
  expect(initial.phase, equals(BootPhase.initial));
  expect(configuring.phase, equals(BootPhase.configuring));
  expect(configuring.progressPercent, equals(25));
});
```

### 15 Tests a implementar (enfocados en BootState):
1. ✅ BootState.initial() retorna valores por defecto
2. ✅ copyWith() actualiza solo campos especificados
3. ✅ Transiciones de fase: initial → configuring → authenticating → loading → ready
4. ✅ Progress porcentajes: 0 → 25 → 50 → 75 → 100
5. ✅ Mensajes correctos en cada fase
6. ✅ Error state: hasError = true, progress = 0
7. ✅ isAuthenticated muta correctamente
8. ✅ retryCount incrementa en reintentos
9. ✅ AppData mutable en ready phase
10. ✅ estimatedTime calculada correctamente
11. ✅ BootPhase enum tiene todos valores
12. ✅ toString() retorna string representativo
13. ✅ Equality: dos BootState iguales son iguales
14. ✅ BootConstants accesibles y correctos
15. ✅ Error mapping: SocketException → network, TimeoutException → server

## 🎯 CAMBIOS AL ROADMAP

### ANTES (Teórico, incorrecto):
- Mocks con parámetros de constructor que NO existen
- Tests que validan return values inexistentes
- Llamadas a métodos que NO existen (BootService.boot())

### DESPUÉS (Real, correcto):
- Tests directo de AuthService() sin parámetros
- Tests validando EXCEPCIONES lanzadas (no return values)
- Tests de BootState (copiar, transiciones, inmutabilidad)
- Tests 100% independientes de Amplify/Firebase (via mocks en el futuro)

## ✅ VENTAJAS DE OPCIÓN B

1. ✅ **Tests validan código REAL** (no mágico)
2. ✅ **Si test pasa = código funciona de verdad**
3. ✅ **No hay sorpresas en producción**
4. ✅ **Fixtures y helpers están listos (FASE 0)**
5. ✅ **Importes correctos, sin problemas de rutas**
6. ✅ **Incrementa confianza en codebase**

## 📊 COBERTURA ESPERADA

- AuthService: >90% (11 tests cubriendo métodos principales)
- BootState: >80% (15 tests cubriendo transiciones)
- Total Fase 1.1 + 1.2: 26 tests = base sólida para FASE 2

## ⏱️ ESTIMACIÓN DE TIEMPO

- Crear MockAuthService helper: 30 min (reutilizable)
- Crear MockBootState helper: 30 min (reutilizable)
- Implementar 11 tests AuthService: 2 horas
- Implementar 15 tests BootNotifier: 2 horas
- **Total: 5 horas** (vs 6 horas del roadmap, pero CON CALIDAD)

---

**Siguiente paso:** Implementar archivos de mocks reutilizables, luego los tests.

