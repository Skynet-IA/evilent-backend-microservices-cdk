# 🧪 TESTING STRUCTURE GUIDE

**Guía detallada de la estructura de carpetas y archivos para testing**

---

## 📁 ESTRUCTURA COMPLETA (Después de implementar)

```
evilent_app/
├── lib/                          (CÓDIGO FUENTE)
│   ├── core/
│   │   ├── services/
│   │   │   ├── auth_service.dart
│   │   │   ├── boot_service.dart
│   │   │   ├── connectivity_service.dart
│   │   │   ├── secure_storage_service.dart
│   │   │   ├── theme_service.dart
│   │   │   └── user_profile_service.dart
│   │   ├── providers/
│   │   │   ├── auth_provider.dart
│   │   │   ├── boot_provider.dart
│   │   │   ├── boot_notifier.dart
│   │   │   ├── boot_state.dart
│   │   │   ├── app_data_provider.dart
│   │   │   ├── cart_provider.dart
│   │   │   └── theme_provider.dart
│   │   └── utils/
│   │       ├── validation.dart
│   │       ├── app_theme.dart
│   │       └── navigation.dart
│   ├── features/
│   │   ├── auth/screens/
│   │   │   ├── login_screen.dart
│   │   │   ├── forgot_password_screen.dart
│   │   │   └── confirmation_screen.dart
│   │   ├── home/screens/
│   │   │   └── home_screen.dart
│   │   ├── explore/screens/
│   │   │   └── explore_screen.dart
│   │   ├── cart/screens/
│   │   │   └── cart_screen.dart
│   │   ├── profile/screens/
│   │   │   ├── profile_screen.dart
│   │   │   └── edit_profile_screen.dart
│   │   └── common/screens/
│   │       ├── unified_boot_screen.dart
│   │       └── app_shell.dart
│   └── shared/
│       └── widgets/
│           ├── connectivity_banner.dart
│           └── profile_form.dart
│
└── test/                         (TESTS - NUEVA ESTRUCTURA)
    ├── fixtures/                 ✨ NUEVA
    │   ├── auth_fixtures.dart
    │   ├── app_data_fixtures.dart
    │   ├── error_fixtures.dart
    │   ├── product_fixtures.dart
    │   └── provider_fixtures.dart
    │
    ├── helpers/                  ✨ NUEVA
    │   ├── test_app_wrapper.dart
    │   ├── mock_builders.dart
    │   └── test_helpers.dart
    │
    ├── mocks/                    ✨ NUEVA
    │   ├── mocks.dart            (Generados por mockito)
    │   └── custom_mocks/
    │       ├── mock_auth_service.dart
    │       ├── mock_boot_service.dart
    │       └── mock_user_profile_service.dart
    │
    ├── unit/
    │   ├── services/
    │   │   ├── auth_service_test.dart           (11 tests)
    │   │   ├── boot_service_test.dart           (15 tests)
    │   │   ├── connectivity_service_test.dart   (8 tests)
    │   │   ├── secure_storage_service_test.dart (10 tests)
    │   │   ├── theme_service_test.dart          (5 tests)
    │   │   └── user_profile_service_test.dart   (12 tests)
    │   │
    │   ├── providers/
    │   │   ├── boot_provider_test.dart          (20 tests)
    │   │   ├── boot_notifier_test.dart          (15 tests)
    │   │   ├── auth_provider_test.dart          (12 tests)
    │   │   ├── app_data_provider_test.dart      (15 tests)
    │   │   ├── cart_provider_test.dart          (10 tests)
    │   │   └── theme_provider_test.dart         (5 tests)
    │   │
    │   ├── utils/
    │   │   ├── validation_test.dart             (22 tests)
    │   │   ├── app_theme_test.dart              (8 tests)
    │   │   └── navigation_test.dart             (5 tests)
    │   │
    │   └── error_system/
    │       ├── app_error_test.dart              (15 tests)
    │       └── error_utils_test.dart            (10 tests)
    │
    ├── widget/
    │   ├── screens/
    │   │   ├── auth/
    │   │   │   ├── login_screen_test.dart           (15 tests)
    │   │   │   ├── forgot_password_screen_test.dart (10 tests)
    │   │   │   └── confirmation_screen_test.dart    (8 tests)
    │   │   │
    │   │   ├── main/
    │   │   │   ├── home_screen_test.dart       (12 tests)
    │   │   │   ├── explore_screen_test.dart    (12 tests)
    │   │   │   ├── cart_screen_test.dart       (10 tests)
    │   │   │   └── profile_screen_test.dart    (15 tests)
    │   │   │
    │   │   └── common/
    │   │       ├── unified_boot_screen_test.dart (20 tests)
    │   │       ├── app_error_screen_test.dart    (8 tests)
    │   │       ├── app_shell_test.dart           (12 tests)
    │   │       └── auth_gate_test.dart           (10 tests)
    │   │
    │   ├── components/
    │   │   ├── connectivity_banner_test.dart   (8 tests)
    │   │   ├── profile_form_test.dart          (12 tests)
    │   │   └── shared_widgets_test.dart        (15 tests)
    │   │
    │   └── golden/
    │       └── golden_tests.dart               (Snapshots de UI)
    │
    ├── integration/
    │   ├── auth_flow_test.dart                 (Signup → Verify → Login)
    │   ├── boot_flow_test.dart                 (Startup → Auth → Load)
    │   ├── shopping_flow_test.dart             (Explore → Cart → etc)
    │   ├── profile_flow_test.dart              (Edit Profile → Save)
    │   └── error_recovery_test.dart            (Error → Retry → Success)
    │
    ├── README.md                               (Guía de testing)
    └── coverage/                               (Generado por flutter test --coverage)
        ├── lcov.info
        └── html/index.html
```

---

## 📄 ARCHIVOS IMPORTANTES A CREAR

### 1. `test/fixtures/auth_fixtures.dart`

```dart
/// 🎯 REGLA DRY: Datos de prueba centralizados y reutilizables
/// 
/// Contiene:
/// - Usuarios válidos/inválidos
/// - Tokens JWT (válidos/expirados)
/// - Errores estándar
/// - Respuestas API
class AuthFixtures {
  // ✅ USUARIOS VÁLIDOS
  static const String validEmail = 'test@evilent.com';
  static const String validPassword = 'Test@12345';
  static const String validFirstName = 'Juan';
  static const String validLastName = 'Pérez';
  
  // ❌ USUARIOS INVÁLIDOS
  static const String invalidEmail = 'notanemail';
  static const String shortPassword = 'pass';
  static const String emptyEmail = '';
  
  // 🔐 TOKENS
  static const String validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
  static const String expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
  
  // 📱 CREDENCIALES
  static Map<String, dynamic> validCredentials() => {
    'email': validEmail,
    'password': validPassword,
    'firstName': validFirstName,
    'lastName': validLastName,
  };
  
  // 🚫 ERRORES
  static AppError invalidCredentialsError() => AppError(
    type: AppErrorType.authentication,
    message: 'Credenciales inválidas',
    code: 'INVALID_CREDENTIALS',
  );
  
  static AppError networkError() => AppError(
    type: AppErrorType.network,
    message: 'Error de conexión',
    code: 'NETWORK_ERROR',
  );
}
```

---

### 2. `test/helpers/test_app_wrapper.dart`

```dart
/// 🎯 Widget que envuelve componentes para tests
/// 
/// Proporciona:
/// - MaterialApp con tema
/// - ProviderScope para Riverpod
/// - Todas las dependencias globales
class TestAppWrapper extends StatelessWidget {
  final Widget child;
  final ProviderContainer? overrides;
  
  const TestAppWrapper({
    required this.child,
    this.overrides,
  });
  
  @override
  Widget build(BuildContext context) {
    return ProviderScope(
      child: MaterialApp(
        theme: AppTheme.lightTheme,
        home: Scaffold(body: child),
        navigatorObservers: [
          // Para tests de navegación
        ],
      ),
    );
  }
}

// Helper function
Widget wrapWithTestApp(Widget widget) => TestAppWrapper(child: widget);

// Helper con mocks
Widget wrapWithMocks(Widget widget, List<Override> overrides) {
  return ProviderScope(
    overrides: overrides,
    child: MaterialApp(
      theme: AppTheme.lightTheme,
      home: Scaffold(body: widget),
    ),
  );
}
```

---

### 3. `test/mocks/custom_mocks/mock_auth_service.dart`

```dart
/// 🎯 Mock manual de AuthService
/// Más control que mocks auto-generados
import 'package:mockito/mockito.dart';
import 'package:evilent_app/core/services/auth_service.dart';

class MockAuthService extends Mock implements AuthService {
  @override
  Future<bool> signIn({
    required String email,
    required String password,
  }) async {
    return super.noSuchMethod(
      Invocation.method(#signIn, [], {#email: email, #password: password}),
      returnValue: Future.value(false),
    );
  }
  
  @override
  Future<bool> isSignedIn() async {
    return super.noSuchMethod(
      Invocation.method(#isSignedIn, []),
      returnValue: Future.value(false),
    );
  }
}
```

---

### 4. `test/unit/services/auth_service_test.dart` (EJEMPLO COMPLETO)

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:evilent_app/core/services/auth_service.dart';
import 'package:evilent_app/core/services/connectivity_service.dart';
import 'package:evilent_app/core/error_system/app_error.dart';

import '../../fixtures/auth_fixtures.dart';
import '../../mocks/custom_mocks/mock_connectivity_service.dart';

void main() {
  group('AuthService -', () {
    // Setup
    late MockConnectivityService mockConnectivity;
    late AuthService authService;
    
    setUp(() {
      mockConnectivity = MockConnectivityService();
      authService = AuthService(connectivity: mockConnectivity);
    });
    
    tearDown(() {
      reset(mockConnectivity);
    });
    
    // HAPPY PATH TESTS
    group('signIn -', () {
      test('debe retornar true con credenciales válidas', () async {
        // Arrange
        when(mockConnectivity.hasConnection)
            .thenAnswer((_) async => true);
        
        // Act
        final result = await authService.signIn(
          email: AuthFixtures.validEmail,
          password: AuthFixtures.validPassword,
        );
        
        // Assert
        expect(result, isTrue);
      });
      
      test('debe guardar token después de signIn exitoso', () async {
        // Arrange
        when(mockConnectivity.hasConnection)
            .thenAnswer((_) async => true);
        
        // Act
        await authService.signIn(
          email: AuthFixtures.validEmail,
          password: AuthFixtures.validPassword,
        );
        
        // Assert
        final token = await authService.getToken();
        expect(token, isNotNull);
      });
    });
    
    // ERROR PATH TESTS
    group('signIn error handling -', () {
      test('debe lanzar InvalidCredentialsError con password incorrecto', 
        () async {
        // Arrange
        when(mockConnectivity.hasConnection)
            .thenAnswer((_) async => true);
        
        // Act & Assert
        expect(
          () => authService.signIn(
            email: AuthFixtures.validEmail,
            password: 'wrongpassword',
          ),
          throwsA(isA<InvalidCredentialsError>()),
        );
      });
      
      test('debe lanzar NetworkError si no hay conexión', () async {
        // Arrange
        when(mockConnectivity.hasConnection)
            .thenAnswer((_) async => false);
        
        // Act & Assert
        expect(
          () => authService.signIn(
            email: AuthFixtures.validEmail,
            password: AuthFixtures.validPassword,
          ),
          throwsA(isA<NetworkError>()),
        );
      });
    });
    
    // EDGE CASE TESTS
    group('signIn edge cases -', () {
      test('debe rechazar email vacío', () async {
        // Act & Assert
        expect(
          () => authService.signIn(
            email: '',
            password: AuthFixtures.validPassword,
          ),
          throwsA(isA<ValidationError>()),
        );
      });
      
      test('debe rechazar password muy corto', () async {
        // Act & Assert
        expect(
          () => authService.signIn(
            email: AuthFixtures.validEmail,
            password: '12345',
          ),
          throwsA(isA<ValidationError>()),
        );
      });
    });
  });
}
```

---

### 5. `test/widget/screens/auth/login_screen_test.dart` (EJEMPLO WIDGET)

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:evilent_app/features/auth/screens/login_screen.dart';
import 'package:evilent_app/core/providers/auth_provider.dart';

import '../../../fixtures/auth_fixtures.dart';
import '../../../helpers/test_app_wrapper.dart';
import '../../../mocks/custom_mocks/mock_auth_service.dart';

void main() {
  group('LoginScreen -', () {
    late MockAuthService mockAuthService;
    
    setUp(() {
      mockAuthService = MockAuthService();
    });
    
    testWidgets('renderizar correctamente', (WidgetTester tester) async {
      // Arrange
      await tester.pumpWidget(
        wrapWithTestApp(const LoginScreen()),
      );
      
      // Assert
      expect(find.byType(TextField), findsWidgets);
      expect(find.byType(ElevatedButton), findsOneWidget);
      expect(find.text('Iniciar sesión'), findsOneWidget);
    });
    
    testWidgets('mostrar error si email es inválido', 
      (WidgetTester tester) async {
      // Arrange
      await tester.pumpWidget(wrapWithTestApp(const LoginScreen()));
      
      // Act: Escribir email inválido
      await tester.enterText(
        find.byType(TextField).first,
        'notanemail',
      );
      
      // Presionar botón submit
      await tester.tap(find.byType(ElevatedButton));
      await tester.pump();
      
      // Assert: Mostrar error
      expect(find.text('Email inválido'), findsOneWidget);
    });
    
    testWidgets('login exitoso con credenciales válidas',
      (WidgetTester tester) async {
      // Arrange
      when(mockAuthService.signIn(
        email: anyNamed('email'),
        password: anyNamed('password'),
      )).thenAnswer((_) async => true);
      
      await tester.pumpWidget(wrapWithMocks(
        const LoginScreen(),
        [authServiceProvider.overrideWithValue(mockAuthService)],
      ));
      
      // Act: Completar formulario
      await tester.enterText(
        find.byType(TextField).first,
        AuthFixtures.validEmail,
      );
      await tester.enterText(
        find.byType(TextField).last,
        AuthFixtures.validPassword,
      );
      
      // Presionar submit
      await tester.tap(find.byType(ElevatedButton));
      await tester.pumpAndSettle();
      
      // Assert: Navegar a home
      expect(find.byType(HomeScreen), findsOneWidget);
    });
  });
}
```

---

### 6. `test/integration/auth_flow_test.dart` (EJEMPLO INTEGRATION)

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:evilent_app/main.dart';

void main() {
  group('Auth Flow Integration -', () {
    testWidgets('Flujo completo: Signup → Email Verify → Login',
      (WidgetTester tester) async {
      
      // Paso 1: Abrir app
      await tester.pumpWidget(const MyApp());
      await tester.pumpAndSettle();
      
      // Assert: Ver pantalla de login
      expect(find.byType(LoginScreen), findsOneWidget);
      
      // Paso 2: Ir a signup
      await tester.tap(find.text('¿No tienes cuenta? Registrate'));
      await tester.pumpAndSettle();
      
      // Assert: Ver pantalla signup
      expect(find.byType(SignupScreen), findsOneWidget);
      
      // Paso 3: Completar formulario de signup
      await tester.enterText(
        find.byType(TextField).at(0),
        'Juan',
      );
      await tester.enterText(
        find.byType(TextField).at(1),
        'Pérez',
      );
      await tester.enterText(
        find.byType(TextField).at(2),
        'test@example.com',
      );
      await tester.enterText(
        find.byType(TextField).at(3),
        'SecurePass@123',
      );
      
      // Paso 4: Submit signup
      await tester.tap(find.text('Crear cuenta'));
      await tester.pumpAndSettle();
      
      // Assert: Ver pantalla de verificación
      expect(find.byType(ConfirmationScreen), findsOneWidget);
      
      // Paso 5: Entrar código de verificación (mock)
      // ... resto del flujo
    });
  });
}
```

---

## 🎯 CHECKLIST PARA CADA ARCHIVO DE TEST

```dart
// ✅ Todo archivo de test debe tener:

// 1. Imports claros y organizados
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
// ... más imports

// 2. setUp() y tearDown() cuando sea necesario
setUp(() {
  // Crear mocks, fixtures, estado inicial
});

tearDown(() {
  // Limpiar: reset de mocks, etc.
});

// 3. Grouping por funcionalidad
group('NombreClase -', () {
  group('nombreMetodo -', () {
    test('comportamiento esperado', () {
      // Arrange
      // Act
      // Assert
    });
  });
});

// 4. Nombres descriptivos de tests
test('debe retornar true cuando credenciales son válidas', () {
  // NO: test('test 1', () { ... })
});

// 5. Patrón AAA (Arrange-Act-Assert) consistente
test('ejemplo', () {
  // ARRANGE: Preparar
  // ACT: Ejecutar
  // ASSERT: Verificar
});

// 6. Happy path + Error path + Edge cases
group('función -', () {
  group('happy path', () {
    test('...', () { });
  });
  group('error path', () {
    test('...', () { });
  });
  group('edge cases', () {
    test('...', () { });
  });
});
```

---

## 🔄 WORKFLOW DE TESTING

```bash
# 1. Escribir test (falla)
vim test/unit/services/my_service_test.dart

# 2. Ejecutar tests
flutter test test/unit/services/my_service_test.dart

# 3. Red → Green ciclo
# - Tests fallan (RED)
# - Implementar la funcionalidad
# - Tests pasan (GREEN)
# - Refactor si es necesario

# 4. Ejecutar todo para asegurar no rompimos nada
flutter test

# 5. Generar mocks si se necesitan
flutter pub run build_runner build

# 6. Medir cobertura
flutter test --coverage

# 7. Ver reporte
genhtml coverage/lcov.info -o coverage/html
open coverage/html/index.html

# 8. Commit y push
git add test/
git commit -m "test: agregar tests para AuthService"
git push
```

---

## 📊 COMANDO RÁPIDO

```bash
# Ver estado de testing
flutter test 2>&1 | grep -E "^(✓|✗|passed|failed)"

# Solo ver summary
flutter test 2>&1 | tail -20

# Watch mode (re-ejecuta al guardar)
flutter test --watch

# Tests filtrados
flutter test -k "AuthService"
```

---

**LISTO para empezar con FASE 0** 🚀


