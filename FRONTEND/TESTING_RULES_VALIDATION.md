# 🎯 CÓMO ESCRIBIR TESTS QUE VALIDEN LA REALIDAD DEL CÓDIGO

**LECCIÓN CRÍTICA:** Los tests NO son para "pasar" - son para **validar que el código hace lo que promete**.

---

## ❌ LO QUE ESTABA MAL

```dart
// ❌ INCORRECTO - Este test "pasa" pero no valida NADA
test('error_fixtures funciona', () {
  final error = ErrorFixtures.validationErrorEmail();
  expect(error, isNotNull);  // ← Solo verifica que existe
});

// Problema: El test pasa AUNQUE cambies el mensaje de error
// Problema: El test pasa AUNQUE ErrorFixtures tenga parámetros inexistentes
// Problema: No valida que AppError tenga esos parámetros
```

---

## ✅ LO QUE DEBE SER

```dart
// ✅ CORRECTO - Este test valida la REALIDAD
test('error_fixtures crea AppError válido', () {
  // ARRANGE: Obtener error del fixture
  final error = ErrorFixtures.validationErrorEmail();
  
  // ASSERT: Validar que tiene estructura REAL de AppError
  expect(error, isA<AppError>());
  expect(error.type, equals(AppErrorType.validation));
  expect(error.message, isNotEmpty);
  expect(error.message, contains('email'));  // ← Valida el mensaje
  
  // NUNCA: expect(error.code, equals('VALIDATION_EMAIL'));
  // Por qué: AppError NO tiene parámetro 'code'
});
```

---

## 🔍 CÓMO VALIDAR REALIDAD

### PASO 1: Leer el código real

```dart
// lib/core/error_system/app_error.dart
class AppError {
  final AppErrorType type;
  final String message;
  final Exception? originalError;
  final StackTrace? stackTrace;
  
  // ✅ Tiene estos parámetros
  // ❌ NO tiene: code, description, context, etc.
}
```

### PASO 2: Crear fixtures que MAPEEN exactamente esa estructura

```dart
// ✅ CORRECTO: Fixture valida estructura real
class ErrorFixtures {
  static AppError validationErrorEmail() => AppError(
    type: AppErrorType.validation,
    message: 'El email es inválido',
    // ✅ Solo estos 2 parámetros obligatorios
  );
}

// ❌ INCORRECTO: Fixture con parámetros inexistentes
class ErrorFixtures {
  static AppError validationErrorEmail() => AppError(
    type: AppErrorType.validation,
    message: 'El email es inválido',
    code: 'VALIDATION_EMAIL',  // ❌ Este NO existe en AppError
  );
}
```

### PASO 3: Tests que validan exactamente lo que el código tiene

```dart
// ✅ CORRECTO - Valida exactamente la estructura real
test('AppDataFixtures.completeProfile tiene estructura válida', () {
  final appData = AppDataFixtures.completeProfile;
  
  // Validar que estructura coincide con código real
  expect(appData.userProfile, isNotNull);
  expect(appData.userProfile!.firstName, isNotEmpty);
  expect(appData.userProfile!.lastName, isNotEmpty);
  expect(appData.userProfile!.phone, isNotEmpty);
  expect(appData.hasCompleteProfile, isTrue);  // ← Valida lógica real
});

// ❌ INCORRECTO - Valida cosas que NO existen
test('AppDataFixtures.completeProfile', () {
  final appData = AppDataFixtures.completeProfile;
  expect(appData.cartItems, equals(5));  // ← AppData NO tiene cartItems
  expect(appData.notifications, equals(2));  // ← NO existe en AppData
});
```

---

## 📋 CHECKLIST: VALIDAR REALIDAD

Antes de crear un fixture o test, pregúntate:

- [ ] ¿Leí el código real que estoy testeando?
- [ ] ¿El fixture usa EXACTAMENTE los parámetros que el código tiene?
- [ ] ¿Valido que el parámetro NO tenga parámetros inexistentes?
- [ ] ¿El test valida la estructura completa? (no solo `isNotNull`)
- [ ] ¿Ejecuté `flutter analyze` y NO hay errores?
- [ ] ¿El test fallería si cambio el comportamiento del código?
- [ ] ¿El test valida happy path + error path?

---

## 🎯 EJEMPLO REAL: AuthFixtures

### LO QUE CAMBIÓ

```dart
// ❌ ANTES - Tenía parámetros inexistentes
class AuthFixtures {
  static const String validToken = 'eyJhbGc...';
  static final invalidCredentialsError = AppError(
    type: AppErrorType.authentication,
    message: 'Credenciales inválidas',
    code: 'INVALID_CREDENTIALS',  // ❌ NO EXISTE
  );
}

// ✅ AHORA - SOLO parámetros reales
class AuthFixtures {
  static const String validToken = 'eyJhbGc...';
  static AppError invalidCredentialsError() => AppError(
    type: AppErrorType.authentication,
    message: 'Credenciales inválidas',
    // ✅ NO incluye 'code'
  );
}
```

### POR QUÉ CAMBIÓ

1. **Lint Error:** `The named parameter 'code' isn't defined`
2. **Razón:** AppError NO tiene parámetro `code`
3. **Solución:** Remover parámetro que no existe

---

## 🚀 PRÓXIMO PASO: TESTS REALES

Ahora con FASE 0 correcta, vamos a crear tests que:

✅ Validen que fixtures reflejan realidad del código
✅ Validen que helpers funcionan con código real
✅ Validen comportamientos del negocio (no solo estructura)

**Ejemplo de test REAL:**

```dart
// ✅ Este test valida REALIDAD
test('AuthService.signIn con credenciales válidas debe retornar token', () async {
  // ARRANGE: Setup
  const email = AuthFixtures.validEmail;
  const password = AuthFixtures.validPassword;
  
  // ACT: Ejecutar
  final result = await authService.signIn(email, password);
  
  // ASSERT: Validar realidad
  expect(result, isNotNull);
  expect(result.isA<String>(), isTrue);  // Retorna String (token)
  expect(result.length, greaterThan(0));
  
  // ✅ Valida comportamiento REAL del código
  // ✅ Fallaría si el código no retorna token
  // ✅ Fallaría si el código retorna null
  // ✅ Fallaría si el código retorna estructura diferente
});
```

---

## 📚 REGLA DE ORO

**"Un test que pasa pero no valida realidad es PEOR que no tener test."**

### Criterios de validación:

1. **¿Refleja fixture la estructura real?** → Verificar con `flutter analyze`
2. **¿Valida el test la realidad?** → Debería fallar si cambio el comportamiento
3. **¿Incluye happy path + error + edge?** → No solo casos exitosos
4. **¿Es independiente?** → No depende de otros tests
5. **¿Es repetible?** → Pasa siempre, no intermitente

---

## ✅ ESTADO ACTUAL

```
✅ FASE 0 CORRECTA:
  ✅ auth_fixtures.dart - Valida estructura real de AuthService
  ✅ app_data_fixtures.dart - Valida estructura real de AppData
  ✅ error_fixtures.dart - Valida estructura real de AppError
  ✅ product_fixtures.dart - Valida estructura real de Productos
  ✅ test_app_wrapper.dart - Valida estructura real de App
  ✅ test_helpers.dart - Funciones que validan realidad
  
✅ SIN ERRORES DE LINT
✅ FIXTURES REFLEJAN CÓDIGO REAL
✅ LISTO PARA FASE 1: Unit Tests
```

---

## 🎓 FILOSOFÍA

**Los tests son un CONTRATO.**

- Contrato dice: "Si cambio esto en el código, el test debe fallar"
- Si el test pasa aunque cambies el código → Contrato roto
- Si el test falla sin razón → Test está mal escrito

**Por lo tanto:**
- Escribe tests que VALIDARÍAN BUGs en producción
- Escribe tests que FALLARÍAN si alguien rompe el contrato
- Escribe tests que un junior entienda qué comportamiento valida

---

## 🚀 PRÓXIMA MISIÓN

**FASE 1: Unit Tests para Services (20 horas)**

Escribir tests REALES que:
- ✅ Validen comportamiento de AuthService
- ✅ Validen comportamiento de BootService
- ✅ Validen que errores se mapean correctamente
- ✅ Validen que excepciones se manejan bien

Cada test DEBE fallar si cambio el código.

---

**Ready? Let's validate reality! 🧪**


