// 🎯 FIXTURES - DATOS DE PRUEBA QUE VALIDAN LA REALIDAD DEL CÓDIGO
// Basados en: lib/core/services/auth_service.dart
// REGLA #1: DRY - Un solo lugar para toda la data de tests

/// Usuarios válidos para tests
class AuthFixtures {
  // ✅ USUARIOS QUE EXISTEN EN EL CÓDIGO
  static const String validEmail = 'test@evilent.com';
  static const String validPassword = 'Test@12345';
  static const String validFirstName = 'Juan';
  static const String validLastName = 'Pérez';
  
  // ❌ USUARIOS QUE NO CUMPLEN VALIDACIÓN
  static const String invalidEmail = 'notanemail';  // Sin @
  static const String shortPassword = 'pass';       // < 8 caracteres
  static const String emptyEmail = '';
  static const String emptyPassword = '';
  
  // 🔐 TOKENS JWT REALES PARA TESTING
  static const String validToken = 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  
  // 📝 CREDENCIALES QUE VALIDAR
  static Map<String, String> get validCredentials => {
    'email': validEmail,
    'password': validPassword,
  };
  
  static Map<String, String> get invalidCredentials => {
    'email': invalidEmail,
    'password': shortPassword,
  };
}


