# 🧪 ROADMAP TESTING FRONTEND - DESDE CERO

**Documento:** Plan completo para implementar testing enterprise-grade en EVILENT Flutter App  
**Versión:** 1.0  
**Estado:** Activo  
**Última actualización:** 2025-01-13

---

## 🎯 VISIÓN GENERAL

### Objetivo
Crear una **cobertura de testing del 80%+** en el frontend Flutter siguiendo las 10 REGLAS DE ORO (especialmente Regla #8 🧪).

### Principios
- ✅ **Regla #8:** Tests para TODOS los servicios, providers, widgets críticos
- ✅ **Regla #6:** Separación Services → Providers → Widgets (facilita testing)
- ✅ **Consistencia:** Mocks reflejan código real, tests validan contratos completos
- ✅ **DRY:** Reutilizar fixtures, builders, mocks (no duplicar)
- ✅ **Claridad:** Tests como documentación viva

### Estado Actual
```
🚀 EMPEZAMOS DE CERO:
   ✅ Carpeta test/ existe (VACÍA)
   ✅ Tests viejos eliminados (40 tests removidos)
   ❌ Cero tests implementados
   ❌ Cero fixtures creadas
   ❌ Cero helpers creados
   ❌ Cero mocks generados

🎯 Meta: 280 tests, 80%+ cobertura
   - Unit tests: 140 (Services 60 + Providers 50 + Utils/Errors 30)
   - Widget tests: 120 (Screens + Components)
   - Integration tests: 20 (Flujos completos)
```

---

## 📋 ESTRUCTURA DE TESTING

### Capas de Testing (Pirámide)
```
                   △
                  /E\              Integration Tests (20%)
                 /   \               - Flujos completos
                ╱─────╲              - Boot → Home → Profile
               /       \
              /   W     \            Widget Tests (30%)
             /           \           - Screens
            ╱─────────────╲          - Components
           /               \         - Widgets
          /       U         \        
         ╱─────────────────╲         Unit Tests (50%)
        /                   \        - Services
       /___________________\ \       - Providers
       
       Unit: 50% (servicios, providers, utils)
       Widget: 30% (pantallas, componentes)
       Integration: 20% (flujos end-to-end)
```

### Carpeta de Tests (Estructura)
```
test/
├── fixtures/                       # Datos reutilizables
│   ├── auth_fixtures.dart          # Usuarios, tokens, errores de auth
│   ├── product_fixtures.dart       # Productos, órdenes
│   ├── app_data_fixtures.dart      # AppData mocks
│   └── providers_fixtures.dart     # Estados de providers
│
├── helpers/                        # Utilidades de testing
│   ├── test_app_wrapper.dart       # Widget para envolver tests
│   ├── mock_builders.dart          # Builders para mocks
│   └── test_helpers.dart           # Funciones helper comunes
│
├── mocks/                          # Mocks generados y customs
│   ├── mocks.dart                  # Mocks generados (build_runner)
│   ├── custom_mocks/
│   │   ├── mock_auth_service.dart
│   │   ├── mock_boot_service.dart
│   │   └── mock_user_profile_service.dart
│   └── repositories/
│       └── mock_repositories.dart  # Mocks de APIs
│
├── unit/                           # Tests unitarios (POR CREAR)
│   ├── services/
│   │   ├── auth_service_test.dart (11 tests)
│   │   ├── boot_service_test.dart (15 tests)
│   │   ├── connectivity_service_test.dart (8 tests)
│   │   ├── secure_storage_service_test.dart (10 tests)
│   │   ├── theme_service_test.dart (5 tests)
│   │   └── user_profile_service_test.dart (12 tests)
│   │
│   ├── providers/
│   │   ├── boot_provider_test.dart (20 tests)
│   │   ├── boot_notifier_test.dart (15 tests)
│   │   ├── auth_provider_test.dart (12 tests)
│   │   ├── app_data_provider_test.dart (15 tests)
│   │   ├── cart_provider_test.dart (10 tests)
│   │   └── theme_provider_test.dart (5 tests)
│   │
│   ├── utils/
│   │   ├── validation_test.dart (22 tests)
│   │   ├── app_theme_test.dart (8 tests)
│   │   └── navigation_test.dart (5 tests)
│   │
│   └── error_system/
│       ├── app_error_test.dart (15 tests)
│       └── error_utils_test.dart (10 tests)
│
├── widget/                         # Tests de widgets
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── login_screen_test.dart (15 tests)
│   │   │   ├── forgot_password_screen_test.dart (10 tests)
│   │   │   └── confirmation_screen_test.dart (8 tests)
│   │   │
│   │   ├── main/
│   │   │   ├── home_screen_test.dart (12 tests)
│   │   │   ├── explore_screen_test.dart (12 tests)
│   │   │   ├── cart_screen_test.dart (10 tests)
│   │   │   └── profile_screen_test.dart (15 tests)
│   │   │
│   │   └── common/
│   │       ├── unified_boot_screen_test.dart (20 tests)
│   │       ├── app_error_screen_test.dart (8 tests)
│   │       └── app_shell_test.dart (12 tests)
│   │
│   ├── components/
│   │   ├── connectivity_banner_test.dart (8 tests)
│   │   ├── profile_form_test.dart (12 tests)
│   │   └── shared_widgets_test.dart (15 tests)
│   │
│   └── golden/                    # Screenshot testing (opcional)
│       └── golden_tests.dart      # Guardar snapshots de UI
│
└── integration/                    # Tests de integración
    ├── auth_flow_test.dart        # Signup → Verify → Login
    ├── boot_flow_test.dart        # Startup → Auth → Load Data
    ├── shopping_flow_test.dart    # Explore → Cart → Checkout
    ├── profile_flow_test.dart     # Edit Profile → Save
    └── error_recovery_test.dart   # Error → Retry → Success
```

---

## 🚀 ROADMAP DE IMPLEMENTACIÓN

### FASE 0: PREPARACIÓN (2 horas)

#### ✅ TAREA 0.1: Tests Viejos YA ELIMINADOS
**Estado:** ✅ COMPLETADO
```
✅ Eliminado: test/unit/services/auth_service_test.dart
✅ Eliminado: test/unit/providers/auth_provider_test.dart
✅ Eliminado: test/unit/utils/validation_test.dart

🚀 Partimos de CERO - solo existe carpeta test/ vacía
```

**Tiempo:** ✅ HECHO

---

#### TAREA 0.2: Agregar Dependencias de Testing
**Archivo:** `pubspec.yaml`

**Verificar que existan:**
```yaml
dev_dependencies:
  flutter_test:
    sdk: flutter       # ✅ YA EXISTE
  
  # Mocking
  mockito: ^5.4.4     # ✅ YA EXISTE
  
  # Coverage (AGREGAR SI NO EXISTE)
  coverage: ^1.8.0    # ← VERIFICAR
```

**Comando (si falta coverage):**
```bash
flutter pub add --dev coverage
flutter pub get
flutter pub run build_runner build --delete-conflicting-outputs
```

**Tiempo:** 15 min

---

#### ✅ TAREA 0.3: Crear Base de Fixtures
**Estado:** ✅ CREADAS

**Archivos creados:**
- ✅ `test/fixtures/auth_fixtures.dart` (usuarios, tokens, errores)
- ✅ `test/fixtures/app_data_fixtures.dart` (datos de app)

**Falta crear:**
- `test/fixtures/error_fixtures.dart`
- `test/fixtures/product_fixtures.dart`
- `test/fixtures/provider_fixtures.dart`

**Tiempo:** 30 min (resto)

---

#### ✅ TAREA 0.4: Crear Test App Wrapper
**Estado:** ✅ CREADO

**Archivos creados:**
- ✅ `test/helpers/test_app_wrapper.dart` (MaterialApp + ProviderScope)

**Funciones disponibles:**
- `wrapWithTestApp(widget)` - Envolve widget simple
- `createProviderContainer(overrides)` - Crear container con mocks

**Falta crear:**
- `test/helpers/test_helpers.dart` (funciones helper generales)

**Tiempo:** ✅ 15 min (completado)

---

### FASE 1: UNIT TESTS - SERVICIOS (20 horas)

#### TAREA 1.1: Tests de AuthService (11 tests)
**Archivo:** `test/unit/services/auth_service_test.dart`

```dart
void main() {
  group('AuthService -', () {
    late MockConnectivityService mockConnectivity;
    late MockSecureStorage mockStorage;
    late AuthService authService;
    
    setUp(() {
      // Arrange: Preparar mocks
      mockConnectivity = MockConnectivityService();
      mockStorage = MockSecureStorage();
      
      // Act: Crear servicio con mocks
      authService = AuthService(
        connectivity: mockConnectivity,
        storage: mockStorage,
      );
    });
    
    // Happy path
    test('signIn debe retornar true con credenciales válidas', () async {
      // Arrange
      when(mockConnectivity.hasConnection).thenAnswer((_) async => true);
      when(mockStorage.saveToken(any)).thenAnswer((_) async {});
      
      // Act
      final result = await authService.signIn(
        email: AuthFixtures.validEmail,
        password: AuthFixtures.validPassword,
      );
      
      // Assert
      expect(result, true);
      verify(mockStorage.saveToken(any)).called(1);
    });
    
    // Error path
    test('signIn debe lanzar InvalidCredentialsError con password incorrecto', () async {
      // Arrange
      when(mockConnectivity.hasConnection).thenAnswer((_) async => true);
      
      // Act & Assert
      expect(
        () => authService.signIn(
          email: AuthFixtures.validEmail,
          password: 'wrongpassword',
        ),
        throwsA(isA<InvalidCredentialsError>()),
      );
    });
    
    // Edge case
    test('signIn debe lanzar NetworkError si no hay conexión', () async {
      // Arrange
      when(mockConnectivity.hasConnection).thenAnswer((_) async => false);
      
      // Act & Assert
      expect(
        () => authService.signIn(
          email: AuthFixtures.validEmail,
          password: AuthFixtures.validPassword,
        ),
        throwsA(isA<NetworkError>()),
      );
    });
    
    // 8 más: signOut, refreshToken, isSignedIn, signUp, resetPassword, etc.
  });
}
```

**Cobertura:** 11 tests
**Tiempo:** 3 horas

---

#### TAREA 1.2: Tests de BootService (15 tests)
**Archivo:** `test/unit/services/boot_service_test.dart`

```dart
void main() {
  group('BootService -', () {
    late BootService bootService;
    late MockAmplify mockAmplify;
    late MockAuthService mockAuthService;
    
    setUp(() {
      mockAmplify = MockAmplify();
      mockAuthService = MockAuthService();
      bootService = BootService(
        amplify: mockAmplify,
        authService: mockAuthService,
      );
    });
    
    test('boot completo: Amplify → Auth → AppData', () async {
      // Arrange: Todos los servicios funcionan
      when(mockAmplify.configure()).thenAnswer((_) async {});
      when(mockAuthService.isSignedIn()).thenAnswer((_) async => true);
      
      // Act
      await bootService.boot();
      
      // Assert
      expect(bootService.phase, equals(BootPhase.ready));
      expect(bootService.isAuthenticated, equals(true));
    });
    
    test('retry automático tras fallo temporal', () async {
      // Arrange: Falla 2 veces, éxito en intento 3
      var attempts = 0;
      when(mockAmplify.configure()).thenAnswer((_) async {
        attempts++;
        if (attempts < 3) throw TimeoutException('Timeout');
      });
      
      // Act
      await bootService.boot();
      
      // Assert
      expect(attempts, equals(3));
      expect(bootService.phase, equals(BootPhase.ready));
    });
    
    // 13 más: edge cases, timeouts, error handling, etc.
  });
}
```

**Cobertura:** 15 tests
**Tiempo:** 3 horas

---

#### TAREA 1.3-1.7: Tests de Otros Servicios
- **ConnectivityService:** 8 tests (1 hora)
- **SecureStorageService:** 10 tests (1.5 horas)
- **ThemeService:** 5 tests (45 min)
- **UserProfileService:** 12 tests (2 horas)

**Total Fase 1:** 20 horas

---

### FASE 2: UNIT TESTS - PROVIDERS (15 horas)

#### TAREA 2.1: Tests de BootProvider (20 tests)
**Archivo:** `test/unit/providers/boot_provider_test.dart`

```dart
void main() {
  group('BootProvider -', () {
    late ProviderContainer container;
    late MockBootService mockBootService;
    
    setUp(() {
      mockBootService = MockBootService();
      
      // Override provider con mock
      container = ProviderContainer(
        overrides: [
          bootServiceProvider.overrideWithValue(mockBootService),
        ],
      );
    });
    
    test('estado inicial debe ser initializing', () {
      // Act
      final state = container.read(unifiedBootProvider);
      
      // Assert
      expect(state.phase, equals(BootPhase.initializing));
      expect(state.progressPercent, equals(0));
    });
    
    test('transicionar a ready cuando boot completa', () async {
      // Arrange
      when(mockBootService.boot()).thenAnswer((_) async {});
      
      // Act
      await container.read(unifiedBootProvider.notifier).boot();
      
      // Assert
      final state = container.read(unifiedBootProvider);
      expect(state.phase, equals(BootPhase.ready));
      expect(state.progressPercent, equals(100));
    });
    
    // 18 más: error handling, retry, state transitions
  });
}
```

**Cobertura:** 20 tests
**Tiempo:** 3 horas

---

#### TAREA 2.2-2.5: Tests de Otros Providers
- **AuthProvider:** 12 tests (2 horas)
- **AppDataProvider:** 15 tests (2.5 horas)
- **CartProvider:** 10 tests (1.5 horas)
- **ThemeProvider:** 5 tests (45 min)

**Total Fase 2:** 15 horas

---

### FASE 3: UNIT TESTS - UTILS & ERROR SYSTEM (8 horas)

#### TAREA 3.1: Tests de AppError (15 tests)
**Archivo:** `test/unit/error_system/app_error_test.dart`

```dart
void main() {
  group('AppError -', () {
    test('createFromException debe mapear correctamente', () {
      // Arrange
      final exception = SocketException('Connection failed');
      
      // Act
      final appError = AppError.fromException(exception, StackTrace.current);
      
      // Assert
      expect(appError.type, equals(AppErrorType.network));
      expect(appError.message, contains('Connection failed'));
    });
    
    // 14 más: diferentes tipos de errores, serialización, etc.
  });
}
```

**Tiempo:** 2 horas

---

#### TAREA 3.2: Tests de ErrorUtils (10 tests)
**Tiempo:** 1.5 horas

---

#### TAREA 3.3: Tests de AppTheme (8 tests)
**Tiempo:** 1.5 horas

---

#### TAREA 3.4: Tests de Navigation (5 tests)
**Tiempo:** 1 hora

---

**Total Fase 3:** 8 horas

---

### FASE 4: WIDGET TESTS - SCREENS (25 horas)

#### TAREA 4.1: Tests de Login Screen (15 tests)
**Archivo:** `test/widget/screens/auth/login_screen_test.dart`

```dart
void main() {
  group('LoginScreen -', () {
    testWidgets('renderizar correctamente', (WidgetTester tester) async {
      // Arrange
      await tester.pumpWidget(
        wrapWithTestApp(const LoginScreen()),
      );
      
      // Assert
      expect(find.byType(TextField), findsWidgets);
      expect(find.byType(ElevatedButton), findsOneWidget);
    });
    
    testWidgets('validar email antes de enviar', (WidgetTester tester) async {
      // Arrange
      await tester.pumpWidget(wrapWithTestApp(const LoginScreen()));
      
      // Act: Escribir email inválido
      await tester.enterText(find.byType(TextField).first, 'invalid');
      await tester.tap(find.byType(ElevatedButton));
      await tester.pump();
      
      // Assert: Mostrar error
      expect(find.text('Email inválido'), findsOneWidget);
    });
    
    // 13 más: signup, password reset, error handling
  });
}
```

**Tiempo:** 3 horas

---

#### TAREA 4.2: Tests de Other Auth Screens
- **ForgotPasswordScreen:** 10 tests (2 horas)
- **ConfirmationScreen:** 8 tests (1.5 horas)

**Tiempo:** 3.5 horas

---

#### TAREA 4.3: Tests de Main Screens
- **HomeScreen:** 12 tests (2 horas)
- **ExploreScreen:** 12 tests (2 horas)
- **CartScreen:** 10 tests (1.5 horas)
- **ProfileScreen:** 15 tests (2.5 horas)

**Tiempo:** 8 horas

---

#### TAREA 4.4: Tests de Common Screens
- **UnifiedBootScreen:** 20 tests (3 horas)
- **AppErrorScreen:** 8 tests (1.5 horas)
- **AppShell:** 12 tests (2 horas)

**Tiempo:** 6.5 horas

---

#### TAREA 4.5: Tests de Components
- **ConnectivityBanner:** 8 tests (1.5 horas)
- **ProfileForm:** 12 tests (2 horas)
- **SharedWidgets:** 15 tests (2.5 horas)

**Tiempo:** 6 horas

---

**Total Fase 4:** 25 horas

---

### FASE 5: INTEGRATION TESTS (10 horas)

#### TAREA 5.1: Auth Flow Test (Signup → Verify → Login)
**Archivo:** `test/integration/auth_flow_test.dart`

```dart
void main() {
  group('Auth Flow Integration -', () {
    testWidgets('Flujo completo: Signup → Verificación → Login', 
      (WidgetTester tester) async {
      
      // Paso 1: Abrir app
      await tester.pumpWidget(const MyApp());
      
      // Paso 2: Signup
      await tester.tap(find.text('Crear cuenta'));
      await tester.pumpAndSettle();
      
      // Paso 3: Completar formulario
      await tester.enterText(
        find.byType(TextField).at(0),
        AuthFixtures.validEmail,
      );
      // ... más campos
      
      // Paso 4: Enviar
      await tester.tap(find.text('Registrarse'));
      await tester.pumpAndSettle();
      
      // Assertion: Mostrar verificación
      expect(find.byType(ConfirmationScreen), findsOneWidget);
      
      // ... más steps
    });
  });
}
```

**Tiempo:** 2 horas

---

#### TAREA 5.2: Boot Flow Test
**Tiempo:** 2 horas

---

#### TAREA 5.3: Shopping Flow Test
**Tiempo:** 2 horas

---

#### TAREA 5.4: Profile Flow Test
**Tiempo:** 2 horas

---

#### TAREA 5.5: Error Recovery Test
**Tiempo:** 2 horas

---

**Total Fase 5:** 10 horas

---

### FASE 6: COVERAGE & OPTIMIZATION (5 horas)

#### TAREA 6.1: Medir Cobertura
```bash
flutter test --coverage
genhtml coverage/lcov.info -o coverage/html
open coverage/html/index.html
```

**Target:** 80%+ cobertura

**Tiempo:** 1 hora

---

#### TAREA 6.2: Identificar Gaps
Revisar qué NO está cubierto:
- Handlers no probados
- Edge cases faltantes
- Error paths no validados

**Tiempo:** 2 horas

---

#### TAREA 6.3: Agregar Tests Faltantes
Escribir tests para cerrar gaps.

**Tiempo:** 2 horas

---

**Total Fase 6:** 5 horas

---

## 📊 RESUMEN DE ROADMAP

| Fase | Tarea | Horas | Tests | Estado |
|------|-------|-------|-------|--------|
| **0** | Preparación | 1 | - | 🟢 70% HECHO |
| **1** | Services | 20 | 60 | 🔴 PENDIENTE |
| **2** | Providers | 15 | 50 | 🔴 PENDIENTE |
| **3** | Utils & Errors | 8 | 30 | 🔴 PENDIENTE |
| **4** | Widgets/Screens | 25 | 120 | 🔴 PENDIENTE |
| **5** | Integration | 10 | 20 | 🔴 PENDIENTE |
| **6** | Coverage | 5 | - | 🔴 PENDIENTE |
| **TOTAL** | | **84 horas restantes** | **280 tests** | 📊 80%+ cobertura |

**FASE 0 Progreso:**
- ✅ Tests viejos eliminados
- ✅ Fixtures base creadas (auth, app_data)
- ✅ Test App Wrapper creado
- 🟡 Falta: error_fixtures, product_fixtures, test_helpers

---

## 🎯 PATRÓN AAA (SIEMPRE)

Todos los tests deben seguir este patrón:

```dart
test('descripción clara de qué se prueba', () async {
  // ✅ ARRANGE: Preparar datos y mocks
  final input = 'test@example.com';
  final expected = null;
  
  // ✅ ACT: Ejecutar la función
  final result = Validation.validateEmail(input);
  
  // ✅ ASSERT: Verificar resultado
  expect(result, expected);
});
```

---

## 🚨 REGLAS DE TESTING (CRÍTICAS)

### 1. 🚫 NUNCA ignorar excepciones
```dart
// ❌ INCORRECTO
try {
  await service.doSomething();
} catch (e) {
  // Ignorar
}

// ✅ CORRECTO
expect(
  () => service.doSomething(),
  throwsA(isA<ExpectedException>()),
);
```

### 2. 🔐 Usar fixtures compartidas (NO duplicar datos)
```dart
// ❌ INCORRECTO: Datos duplicados en cada test
test('test 1', () {
  final email = 'test@example.com';
});

test('test 2', () {
  final email = 'test@example.com'; // ← DUPLICADO
});

// ✅ CORRECTO: Fixtures centralizadas
test('test 1', () {
  final email = AuthFixtures.validEmail;
});

test('test 2', () {
  final email = AuthFixtures.validEmail;
});
```

### 3. 🧪 Tests deben ser independientes
```dart
// ❌ INCORRECTO: Estado compartido
var sharedCounter = 0;
test('test 1', () => sharedCounter++);
test('test 2', () => expect(sharedCounter, 1)); // Falla si test 1 no corre

// ✅ CORRECTO: setUp() limpia estado
setUp(() {
  // Recrear estado limpio para cada test
});
```

### 4. 📊 Validar estructura COMPLETA (no solo valores)
```dart
// ❌ INCORRECTO: Solo valida status code
expect(response.statusCode, 200);

// ✅ CORRECTO: Valida estructura completa
final body = json.decode(response.body);
expect(body, hasKeys(['success', 'data']));
expect(body['data'], hasKeys(['errors']));
expect(body['data']['errors'], isA<List>());
```

### 5. 🎯 Un solo "Assert" por comportamiento
```dart
// ❌ INCORRECTO: Múltiples asserts diferentes
test('signup', () async {
  final user = await service.signup(...);
  expect(user.email, 'test@example.com'); // ¿Qué pasó?
  expect(user.verified, false); // Si falla, ¿cuál es el problema?
});

// ✅ CORRECTO: Un assert claro
test('signup debe crear usuario no verificado', () async {
  final user = await service.signup(...);
  expect(user.verified, false);
});
```

---

## 🔧 COMANDOS ÚTILES

```bash
# Ejecutar todos los tests
flutter test

# Ejecutar tests específicos
flutter test test/unit/services/

# Con cobertura
flutter test --coverage

# Watch mode (re-ejecuta al guardar)
flutter test --watch

# Generar mocks
flutter pub run build_runner build

# Ver cobertura en HTML
genhtml coverage/lcov.info -o coverage/html
open coverage/html/index.html

# Limpiar
flutter test --coverage --coverage-path coverage/
rm -rf build/ .dart_tool/
```

---

## 📈 MÉTRICAS Y OBJETIVOS

| Métrica | Actual | Objetivo | Prioridad |
|---------|--------|----------|-----------|
| Tests totales | 40 | 280 | 🔴 |
| Cobertura % | ~20% | 80%+ | 🔴 |
| Services cubiertos | 2/6 | 6/6 | 🔴 |
| Providers cubiertos | 1/5 | 5/5 | 🔴 |
| Screens cubiertos | 0/12 | 12/12 | 🟡 |

---

## ✅ DEFINICIÓN DE COMPLETITUD

Una tarea de testing está **COMPLETA** cuando:

- ✅ Código implementado y testeado localmente
- ✅ Cobertura ≥ 80% para archivos nuevos
- ✅ Tests: happy path + error path + edge cases
- ✅ Todos los tests PASAN
- ✅ git add + git commit + git push ejecutados
- ✅ Documentación actualizada
- ✅ Usuario confirmó que funciona

---

## 📚 REFERENCIAS

- [Flutter Testing Guide](https://docs.flutter.dev/testing)
- [Mockito Docs](https://pub.dev/packages/mockito)
- [Riverpod Testing](https://riverpod.dev/docs/essentials/testing)
- [WidgetTester API](https://api.flutter.dev/flutter/material/WidgetTester-class.html)

---

## 🚀 PRÓXIMOS PASOS

1. **Ejecutar FASE 0** (2 horas) ← EMPEZAR AQUÍ
2. **Ejecutar FASE 1** (20 horas) - Tests de servicios
3. **Ejecutar FASE 2** (15 horas) - Tests de providers
4. Repetir hasta FASE 6

**Estimado total:** 85 horas = ~2 semanas con 6h/día

---

**¿Quieres empezar con FASE 0?** ✅

