// 🧪 Tests para AuthService
//
// En este archivo aprenderás:
// • Cómo testear clases de error personalizadas
// • Cómo verificar que los errores se lanzan correctamente
// • Cómo testear lógica sin mockear dependencias externas (primeros pasos)

import 'package:flutter_test/flutter_test.dart';
import 'package:evilent_app/core/services/auth_service.dart';

void main() {
  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ ❌ TESTS DE ERRORES DE DOMINIO                                           │
  // └─────────────────────────────────────────────────────────────────────────┘
  //
  // Estos tests verifican que nuestras clases de error custom funcionan correctamente.
  // Son errores que el servicio lanza cuando algo falla, y que la UI captura
  // para mostrar mensajes específicos al usuario.

  group('AuthService - Errores de Dominio', () {
    
    // ────────────────────────────────────────────────────────────────────────
    // TEST: UserAlreadyExistsError tiene el mensaje correcto
    // ────────────────────────────────────────────────────────────────────────
    test('UserAlreadyExistsError debe tener mensaje apropiado', () {
      // 🎯 ARRANGE
      const error = UserAlreadyExistsError();
      
      // 🎯 ASSERT
      // Verificamos que el mensaje es el esperado
      expect(error.message, 'Ya existe una cuenta con este correo.');
      // Verificamos que es una instancia de AuthError (clase base)
      expect(error, isA<AuthError>());
      // Verificamos que es una Exception (puede ser lanzada con throw)
      expect(error, isA<Exception>());
    });
    
    // ────────────────────────────────────────────────────────────────────────
    // TEST: InvalidCredentialsError tiene el mensaje correcto
    // ────────────────────────────────────────────────────────────────────────
    test('InvalidCredentialsError debe tener mensaje apropiado', () {
      // 🎯 ARRANGE
      const error = InvalidCredentialsError();
      
      // 🎯 ASSERT
      expect(error.message, 'Correo o contraseña incorrectos.');
      expect(error, isA<AuthError>());
      expect(error, isA<Exception>());
    });
    
    // ────────────────────────────────────────────────────────────────────────
    // TEST: InvalidCodeError tiene el mensaje correcto
    // ────────────────────────────────────────────────────────────────────────
    test('InvalidCodeError debe tener mensaje apropiado', () {
      // 🎯 ARRANGE
      const error = InvalidCodeError();
      
      // 🎯 ASSERT
      expect(error.message, 'El código de verificación es incorrecto.');
      expect(error, isA<AuthError>());
    });
    
    // ────────────────────────────────────────────────────────────────────────
    // TEST: UserNotConfirmedError tiene el mensaje correcto
    // ────────────────────────────────────────────────────────────────────────
    test('UserNotConfirmedError debe tener mensaje apropiado', () {
      // 🎯 ARRANGE
      const error = UserNotConfirmedError();
      
      // 🎯 ASSERT
      expect(
        error.message,
        'La cuenta no ha sido confirmada. Por favor, revisa tu correo.',
      );
      expect(error, isA<AuthError>());
    });
    
    // ────────────────────────────────────────────────────────────────────────
    // TEST: UnknownAuthError tiene el mensaje correcto
    // ────────────────────────────────────────────────────────────────────────
    test('UnknownAuthError debe tener mensaje apropiado', () {
      // 🎯 ARRANGE
      const error = UnknownAuthError();
      
      // 🎯 ASSERT
      expect(
        error.message,
        'Ha ocurrido un error inesperado. Inténtalo de nuevo.',
      );
      expect(error, isA<AuthError>());
    });
    
    // ────────────────────────────────────────────────────────────────────────
    // TEST: UserNotFoundError tiene el mensaje correcto
    // ────────────────────────────────────────────────────────────────────────
    test('UserNotFoundError debe tener mensaje apropiado', () {
      // 🎯 ARRANGE
      const error = UserNotFoundError();
      
      // 🎯 ASSERT
      expect(error.message, 'No se encontró una cuenta con este correo.');
      expect(error, isA<AuthError>());
    });
    
    // ────────────────────────────────────────────────────────────────────────
    // TEST: InvalidPasswordError tiene el mensaje correcto
    // ────────────────────────────────────────────────────────────────────────
    test('InvalidPasswordError debe tener mensaje apropiado', () {
      // 🎯 ARRANGE
      const error = InvalidPasswordError();
      
      // 🎯 ASSERT
      expect(
        error.message,
        'La contraseña no cumple los requisitos de seguridad.',
      );
      expect(error, isA<AuthError>());
    });
    
    // ────────────────────────────────────────────────────────────────────────
    // TEST: toString() retorna el mensaje del error
    // ────────────────────────────────────────────────────────────────────────
    test('toString() debe retornar el mensaje del error', () {
      // 🎯 ARRANGE
      const error = InvalidCredentialsError();
      
      // 🎯 ACT
      final stringRepresentation = error.toString();
      
      // 🎯 ASSERT
      // Cuando imprimes el error, debe mostrar el mensaje
      expect(stringRepresentation, 'Correo o contraseña incorrectos.');
    });
  });

  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 🔢 TESTS DE ENUMS                                                        │
  // └─────────────────────────────────────────────────────────────────────────┘

  group('AuthService - SignInOrSignUpResult Enum', () {
    
    // ────────────────────────────────────────────────────────────────────────
    // TEST: Enum tiene los valores correctos
    // ────────────────────────────────────────────────────────────────────────
    test('SignInOrSignUpResult debe tener valores success y needsConfirmation', () {
      // 🎯 ARRANGE & ASSERT
      // Verificamos que el enum tiene exactamente 2 valores
      expect(SignInOrSignUpResult.values.length, 2);
      
      // Verificamos que existen los valores esperados
      expect(SignInOrSignUpResult.success, isNotNull);
      expect(SignInOrSignUpResult.needsConfirmation, isNotNull);
    });
    
    // ────────────────────────────────────────────────────────────────────────
    // TEST: Los valores del enum son diferentes
    // ────────────────────────────────────────────────────────────────────────
    test('Los valores del enum deben ser diferentes', () {
      // 🎯 ASSERT
      expect(
        SignInOrSignUpResult.success,
        isNot(equals(SignInOrSignUpResult.needsConfirmation)),
      );
    });
  });

  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 🏗️ TESTS DE INSTANCIACIÓN                                               │
  // └─────────────────────────────────────────────────────────────────────────┘

  group('AuthService - Instanciación', () {
    
    // ────────────────────────────────────────────────────────────────────────
    // TEST: Se puede crear una instancia de AuthService
    // ────────────────────────────────────────────────────────────────────────
    test('Debe poder crear instancia de AuthService', () {
      // 🎯 ACT
      final authService = AuthService();
      
      // 🎯 ASSERT
      expect(authService, isNotNull);
      expect(authService, isA<AuthService>());
    });
  });
}

