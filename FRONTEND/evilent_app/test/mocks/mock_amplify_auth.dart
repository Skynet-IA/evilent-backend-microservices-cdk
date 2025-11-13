// 🎭 MOCKS REALISTAS DE AMPLIFY AUTH - REFLEJA ESTRUCTURA REAL
// ═══════════════════════════════════════════════════════════════════════════════
//
// 🎯 PRINCIPIO: Los mocks DEBEN ser IDÉNTICOS a la estructura real de Amplify
//
// Estructura real (de amplify_auth_cognito):
// - Amplify.Auth.signIn() → AuthSignInResult
//   - result.isSignedIn: bool
//   - result.nextStep.signInStep: AuthSignInStep
// - Exceptions: NotAuthorizedServiceException, UserNotConfirmedException, etc.
//
// ═══════════════════════════════════════════════════════════════════════════════

import 'package:mockito/mockito.dart';

// ═══════════════════════════════════════════════════════════════════════════════
// MOCKS QUE REFLEJAN AMPLIFY REAL
// ═══════════════════════════════════════════════════════════════════════════════

/// Mock de AuthSignInStep (enum de Amplify)
class MockAuthSignInStep {
  static const confirmSignUp = 'CONFIRM_SIGN_UP';
  static const done = 'DONE';
  static const selectMFAType = 'SELECT_MFA_TYPE';
}

/// Mock de AuthSignInNextStep (estructura real de Amplify)
class MockAuthSignInNextStep {
  final String signInStep;
  
  MockAuthSignInNextStep({required this.signInStep});
}

/// Mock de AuthSignInResult (estructura real de Amplify)
/// ✅ CRÍTICO: Refleja EXACTAMENTE lo que Amplify.Auth.signIn() retorna
class MockAuthSignInResult {
  final bool isSignedIn;
  final MockAuthSignInNextStep nextStep;
  
  MockAuthSignInResult({
    required this.isSignedIn,
    required this.nextStep,
  });
}

/// Mock de Amplify.Auth (API real)
/// ✅ Simula comportamiento real de Amplify con estructura completa
class MockAmplifyAuth extends Mock {
  // Configurables por builder
  late MockAuthSignInResult _signInResult;
  late Exception? _signInException;
  late Exception? _signUpException;
  late Exception? _confirmSignUpException;
  late bool _isSignedInResult;

  MockAmplifyAuth() {
    // Defaults
    _signInResult = MockAuthSignInResult(
      isSignedIn: true,
      nextStep: MockAuthSignInNextStep(signInStep: MockAuthSignInStep.done),
    );
    _signInException = null;
    _signUpException = null;
    _confirmSignUpException = null;
    _isSignedInResult = false;
  }

  /// ✅ Simula Amplify.Auth.signIn()
  /// Retorna AuthSignInResult o lanza exception como Amplify real
  Future<MockAuthSignInResult> signIn({
    required String username,
    required String password,
  }) async {
    if (_signInException != null) {
      throw _signInException!;
    }
    return _signInResult;
  }

  /// ✅ Simula Amplify.Auth.signUp()
  /// Lanza exception si email existe (UserAlreadyExistsException)
  Future<MockAuthSignUpResult> signUp({
    required String username,
    required String password,
    required SignUpOptions options,
  }) async {
    if (_signUpException != null) {
      throw _signUpException!;
    }
    return MockAuthSignUpResult(
      userId: 'user-123',
      nextStep: MockAuthSignUpNextStep(signUpStep: 'CONFIRM_SIGN_UP_STEP'),
    );
  }

  /// ✅ Simula Amplify.Auth.confirmSignUp()
  Future<void> confirmSignUp({
    required String username,
    required String confirmationCode,
  }) async {
    if (_confirmSignUpException != null) {
      throw _confirmSignUpException!;
    }
  }

  /// ✅ Simula Amplify.Auth.fetchAuthSession()
  Future<MockCognitoAuthSession> fetchAuthSession() async {
    return MockCognitoAuthSession(isSignedIn: _isSignedInResult);
  }

  /// ✅ Simula Amplify.Auth.signOut()
  Future<void> signOut() async {}

  /// ✅ Simula Amplify.Auth.resendSignUpCode()
  Future<void> resendSignUpCode({required String username}) async {}

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURADORES PARA TESTS
  // ═══════════════════════════════════════════════════════════════════════════

  /// Configurar signIn para ÉXITO
  void setupSignInSuccess() {
    _signInException = null;
    _signInResult = MockAuthSignInResult(
      isSignedIn: true,
      nextStep: MockAuthSignInNextStep(signInStep: MockAuthSignInStep.done),
    );
  }

  /// Configurar signIn para lanzar NotAuthorizedServiceException (credenciales incorrectas)
  void setupSignInNotAuthorized() {
    _signInException = const NotAuthorizedServiceException(
      'Incorrect username or password.',
    );
  }

  /// Configurar signIn para lanzar UserNotConfirmedException (usuario no confirmado)
  void setupSignInUserNotConfirmed() {
    _signInException = const UserNotConfirmedException(
      'User is not confirmed.',
    );
  }

  /// Configurar signUp para lanzar UsernameExistsException (email duplicado)
  void setupSignUpUserAlreadyExists() {
    _signUpException = const UsernameExistsException(
      'An account with the given email already exists.',
    );
  }

  /// Configurar confirmSignUp para lanzar CodeMismatchException (código inválido)
  void setupConfirmSignUpInvalidCode() {
    _confirmSignUpException = const CodeMismatchException(
      'Invalid verification code provided, please try again.',
    );
  }

  /// Configurar isSignedIn
  void setupIsSignedIn(bool value) {
    _isSignedInResult = value;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ESTRUCTURAS AUXILIARES QUE REFLEJAN AMPLIFY
// ═══════════════════════════════════════════════════════════════════════════════

/// Mock de AuthSignUpResult
class MockAuthSignUpResult {
  final String userId;
  final MockAuthSignUpNextStep nextStep;
  
  MockAuthSignUpResult({
    required this.userId,
    required this.nextStep,
  });
}

/// Mock de AuthSignUpNextStep
class MockAuthSignUpNextStep {
  final String signUpStep;
  
  MockAuthSignUpNextStep({required this.signUpStep});
}

/// Mock de CognitoAuthSession
class MockCognitoAuthSession {
  final bool isSignedIn;
  
  MockCognitoAuthSession({required this.isSignedIn});
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXCEPCIONES DE AMPLIFY (REALES)
// ═══════════════════════════════════════════════════════════════════════════════

/// ✅ REAL: NotAuthorizedServiceException de Amplify
/// Lanzada cuando credenciales son incorrectas
class NotAuthorizedServiceException implements Exception {
  final String message;
  const NotAuthorizedServiceException(this.message);
  
  @override
  String toString() => message;
}

/// ✅ REAL: UserNotConfirmedException de Amplify
/// Lanzada cuando usuario no está confirmado
class UserNotConfirmedException implements Exception {
  final String message;
  const UserNotConfirmedException(this.message);
  
  @override
  String toString() => message;
}

/// ✅ REAL: UsernameExistsException de Amplify
/// Lanzada cuando email ya existe
class UsernameExistsException implements Exception {
  final String message;
  const UsernameExistsException(this.message);
  
  @override
  String toString() => message;
}

/// ✅ REAL: CodeMismatchException de Amplify
/// Lanzada cuando código de confirmación es inválido
class CodeMismatchException implements Exception {
  final String message;
  const CodeMismatchException(this.message);
  
  @override
  String toString() => message;
}

/// ✅ REAL: SignUpOptions de Amplify
class SignUpOptions {
  final Map<String, String>? userAttributes;
  
  SignUpOptions({this.userAttributes});
}

