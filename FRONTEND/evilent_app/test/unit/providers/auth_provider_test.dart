// 🧪 Tests para AuthProvider
//
// En este archivo aprenderás:
// • Cómo testear providers de Riverpod
// • Cómo mockear servicios (AuthService) manualmente
// • Cómo testear estados asíncronos (AsyncValue)
// • Cómo verificar cambios de estado

import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:evilent_app/core/providers/auth_provider.dart';
import 'package:evilent_app/core/services/auth_service.dart';

// ┌─────────────────────────────────────────────────────────────────────────┐
// │ 🎭 MOCK MANUAL DE AuthService                                            │
// └─────────────────────────────────────────────────────────────────────────┘
//
// 📚 **¿Qué es un Mock?**
// Un mock es una "simulación" de una clase real. En tests, no queremos llamar
// al AuthService real (que se conecta a AWS), sino simular sus respuestas.
//
// 💡 **Ventajas:**
// • Los tests no dependen de servicios externos (AWS, Internet)
// • Son más rápidos (no hay llamadas HTTP reales)
// • Puedes simular errores fácilmente
// • Son predecibles y repetibles
//
// 🔧 **Cómo funciona:**
// 1. Creamos MockAuthService que extiende Mock e implementa AuthService
// 2. Mockito automáticamente crea métodos "falsos" para todos los métodos
// 3. Usamos when() para decirle qué retornar cuando se llame a un método
// 4. Usamos verify() para confirmar que un método fue llamado
//
// Ejemplo:
// when(mockAuthService.isSignedIn()).thenAnswer((_) async => true);
//   ↑ "Cuando se llame a isSignedIn(), retorna true"
//
// verify(mockAuthService.isSignedIn()).called(1);
//   ↑ "Verifica que isSignedIn() fue llamado exactamente 1 vez"
class MockAuthService extends Mock implements AuthService {
  @override
  Future<bool> isSignedIn() => super.noSuchMethod(
        Invocation.method(#isSignedIn, []),
        returnValue: Future.value(false),
        returnValueForMissingStub: Future.value(false),
      );

  @override
  Future<SignInOrSignUpResult> signInOrSignUp({
    required String email,
    required String password,
  }) =>
      super.noSuchMethod(
        Invocation.method(#signInOrSignUp, [], {#email: email, #password: password}),
        returnValue: Future.value(SignInOrSignUpResult.success),
        returnValueForMissingStub: Future.value(SignInOrSignUpResult.success),
      );

  @override
  Future<void> signOut() => super.noSuchMethod(
        Invocation.method(#signOut, []),
        returnValue: Future.value(),
        returnValueForMissingStub: Future.value(),
      );

  @override
  Future<void> confirmSignUp({
    required String email,
    required String confirmationCode,
  }) =>
      super.noSuchMethod(
        Invocation.method(#confirmSignUp, [], {#email: email, #confirmationCode: confirmationCode}),
        returnValue: Future.value(),
        returnValueForMissingStub: Future.value(),
      );
}

void main() {
  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 🌱 TESTS DE ESTADO INICIAL                                              │
  // └─────────────────────────────────────────────────────────────────────────┘
  //
  // Estos tests verifican que el provider inicia correctamente consultando
  // si hay una sesión activa.

  group('AuthProvider - Estado Inicial', () {
    
    // ────────────────────────────────────────────────────────────────────────
    // TEST: El provider inicia con sesión NO activa
    // ────────────────────────────────────────────────────────────────────────
    test('Estado inicial debe retornar false si no hay sesión', () async {
      // 🎯 ARRANGE
      final mockAuthService = MockAuthService();
      
      // 🔑 IMPORTANTE: Configurar el mock ANTES de crear el container
      // Esto es crucial porque el provider llama a isSignedIn() en build()
      // y si no está configurado, retorna null y causa un error de tipo
      when(mockAuthService.isSignedIn())
          .thenAnswer((_) async => false);
      
      // Ahora sí crear el container
      final container = ProviderContainer(
        overrides: [
          authServiceProvider.overrideWithValue(mockAuthService),
        ],
      );
      
      // 🎯 ACT
      // Esperar a que el provider termine de inicializar
      final result = await container.read(authProvider.future);
      
      // 🎯 ASSERT
      // Verificar que llamó al servicio
      verify(mockAuthService.isSignedIn()).called(1);
      
      // Verificar que el resultado es false (no autenticado)
      expect(result, false);
      
      // Limpiar
      container.dispose();
    });
    
    // ────────────────────────────────────────────────────────────────────────
    // TEST: El provider inicia con sesión activa
    // ────────────────────────────────────────────────────────────────────────
    test('Estado inicial debe retornar true si hay sesión activa', () async {
      // 🎯 ARRANGE
      final mockAuthService = MockAuthService();
      
      when(mockAuthService.isSignedIn())
          .thenAnswer((_) async => true);
      
      final container = ProviderContainer(
        overrides: [
          authServiceProvider.overrideWithValue(mockAuthService),
        ],
      );
      
      // 🎯 ACT
      final result = await container.read(authProvider.future);
      
      // 🎯 ASSERT
      verify(mockAuthService.isSignedIn()).called(1);
      expect(result, true);
      
      container.dispose();
    });
    
    // ────────────────────────────────────────────────────────────────────────
    // TEST: El estado inicial es AsyncLoading antes de completarse
    // ────────────────────────────────────────────────────────────────────────
    test('Estado inicial debe ser AsyncLoading mientras carga', () {
      // 🎯 ARRANGE
      final mockAuthService = MockAuthService();
      
      when(mockAuthService.isSignedIn())
          .thenAnswer((_) async => false);
      
      final container = ProviderContainer(
        overrides: [
          authServiceProvider.overrideWithValue(mockAuthService),
        ],
      );
      
      // 🎯 ACT & ASSERT
      // Antes de esperar, el estado debe ser Loading
      final state = container.read(authProvider);
      expect(state, isA<AsyncLoading>());
      
      container.dispose();
    });
  });

  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 🔐 TESTS DE signInOrSignUp                                              │
  // └─────────────────────────────────────────────────────────────────────────┘

  group('AuthProvider - signInOrSignUp', () {
    
    // ────────────────────────────────────────────────────────────────────────
    // TEST: Login exitoso debe retornar success
    // ────────────────────────────────────────────────────────────────────────
    test('signInOrSignUp exitoso debe retornar success y state = true', () async {
      // 🎯 ARRANGE
      final mockAuthService = MockAuthService();
      
      // Mock inicial: sin sesión
      when(mockAuthService.isSignedIn())
          .thenAnswer((_) async => false);
      
      // Mock del signInOrSignUp: login exitoso
      when(mockAuthService.signInOrSignUp(
        email: 'test@example.com',
        password: 'TestPass123!',
      )).thenAnswer((_) async => SignInOrSignUpResult.success);
      
      final container = ProviderContainer(
        overrides: [
          authServiceProvider.overrideWithValue(mockAuthService),
        ],
      );
      
      // Esperar a que inicialice
      await container.read(authProvider.future);
      
      // 🎯 ACT
      final result = await container.read(authProvider.notifier).signInOrSignUp(
        email: 'test@example.com',
        password: 'TestPass123!',
      );
      
      // 🎯 ASSERT
      // Verificar que se llamó al servicio
      verify(mockAuthService.signInOrSignUp(
        email: 'test@example.com',
        password: 'TestPass123!',
      )).called(1);
      
      // Verificar el resultado
      expect(result.result, AuthResult.success);
      expect(result.error, isNull);
      
      // Verificar que el estado se actualizó a true (autenticado)
      final state = container.read(authProvider);
      expect(state.value, true);
      
      container.dispose();
    });
    
    // ────────────────────────────────────────────────────────────────────────
    // TEST: Registro que requiere confirmación
    // ────────────────────────────────────────────────────────────────────────
    test('signInOrSignUp que requiere confirmación debe retornar needsConfirmation', () async {
      // 🎯 ARRANGE
      final mockAuthService = MockAuthService();
      
      when(mockAuthService.isSignedIn())
          .thenAnswer((_) async => false);
      
      when(mockAuthService.signInOrSignUp(
        email: 'newuser@example.com',
        password: 'NewPass123!',
      )).thenAnswer((_) async => SignInOrSignUpResult.needsConfirmation);
      
      final container = ProviderContainer(
        overrides: [
          authServiceProvider.overrideWithValue(mockAuthService),
        ],
      );
      
      await container.read(authProvider.future);
      
      // 🎯 ACT
      final result = await container.read(authProvider.notifier).signInOrSignUp(
        email: 'newuser@example.com',
        password: 'NewPass123!',
      );
      
      // 🎯 ASSERT
      expect(result.result, AuthResult.needsConfirmation);
      expect(result.error, isNull);
      
      // Estado debe seguir siendo false (no autenticado aún)
      final state = container.read(authProvider);
      expect(state.value, false);
      
      container.dispose();
    });
    
    // ────────────────────────────────────────────────────────────────────────
    // TEST: Credenciales inválidas deben retornar error
    // ────────────────────────────────────────────────────────────────────────
    test('signInOrSignUp con credenciales inválidas debe retornar error', () async {
      // 🎯 ARRANGE
      final mockAuthService = MockAuthService();
      
      when(mockAuthService.isSignedIn())
          .thenAnswer((_) async => false);
      
      const invalidCredsError = InvalidCredentialsError();
      when(mockAuthService.signInOrSignUp(
        email: 'user@example.com',
        password: 'WrongPass123!',
      )).thenThrow(invalidCredsError);
      
      final container = ProviderContainer(
        overrides: [
          authServiceProvider.overrideWithValue(mockAuthService),
        ],
      );
      
      await container.read(authProvider.future);
      
      // 🎯 ACT
      final result = await container.read(authProvider.notifier).signInOrSignUp(
        email: 'user@example.com',
        password: 'WrongPass123!',
      );
      
      // 🎯 ASSERT
      expect(result.result, AuthResult.error);
      expect(result.error, isA<InvalidCredentialsError>());
      
      // Estado debe ser AsyncError
      final state = container.read(authProvider);
      expect(state, isA<AsyncError>());
      expect(state.error, isA<InvalidCredentialsError>());
      
      container.dispose();
    });
  });

  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 🚪 TESTS DE signOut                                                      │
  // └─────────────────────────────────────────────────────────────────────────┘

  group('AuthProvider - signOut', () {
    
    // ────────────────────────────────────────────────────────────────────────
    // TEST: signOut debe actualizar estado a false
    // ────────────────────────────────────────────────────────────────────────
    test('signOut debe actualizar estado a false', () async {
      // 🎯 ARRANGE
      final mockAuthService = MockAuthService();
      
      // Inicializar con sesión activa
      when(mockAuthService.isSignedIn())
          .thenAnswer((_) async => true);
      
      // Mock del signOut
      when(mockAuthService.signOut())
          .thenAnswer((_) async => {});
      
      final container = ProviderContainer(
        overrides: [
          authServiceProvider.overrideWithValue(mockAuthService),
        ],
      );
      
      await container.read(authProvider.future);
      
      // Verificar que inició con true
      expect(container.read(authProvider).value, true);
      
      // 🎯 ACT
      await container.read(authProvider.notifier).signOut();
      
      // 🎯 ASSERT
      verify(mockAuthService.signOut()).called(1);
      
      // Estado debe cambiar a false
      final state = container.read(authProvider);
      expect(state.value, false);
      
      container.dispose();
    });
  });
}
