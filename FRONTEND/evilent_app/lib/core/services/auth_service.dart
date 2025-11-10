// ═══════════════════════════════════════════════════════════════════════════════
// 🔐 AUTH SERVICE - CAPA DE ABSTRACCIÓN PARA AWS COGNITO
// ═══════════════════════════════════════════════════════════════════════════════
//
// 🎯 CRÍTICO: Este archivo es la ÚNICA capa que conoce Amplify/Cognito.
//
// 📋 RESPONSABILIDADES:
// • Encapsula TODA la comunicación con AWS Cognito vía Amplify
// • Traduce excepciones de Amplify a errores de dominio (ver mapeo abajo)
// • Protege contra ataques de enumeración de usuarios (signInOrSignUp)
// • Permite cambiar el proveedor de auth sin tocar UI/Providers
//
// 🛡️ MAPEO DE EXCEPCIONES (Amplify → Domain):
// • UsernameExistsException → UserAlreadyExistsError
// • CodeMismatchException → InvalidCodeError
// • NotAuthorizedServiceException → InvalidCredentialsError
// • UserNotFoundException → UserNotFoundError
// • InvalidPasswordException → InvalidPasswordError
// • Otros AuthException → UnknownAuthError
//
// ⚠️ PRINCIPIO DE DISEÑO:
// La UI nunca debe importar amplify_flutter ni conocer excepciones de Amplify.
// Esto permite cambiar de Amplify a Firebase/Supabase sin tocar la UI.
// ═══════════════════════════════════════════════════════════════════════════════

import 'package:amplify_auth_cognito/amplify_auth_cognito.dart';
import 'package:amplify_flutter/amplify_flutter.dart';
import 'package:evilent_app/core/services/secure_storage_service.dart';

/// Clase base para todos los errores de autenticación de dominio.
class AuthError implements Exception {
  final String message;
  const AuthError(this.message);

  @override
  String toString() => message;
}

class UserAlreadyExistsError extends AuthError {
  const UserAlreadyExistsError() : super('Ya existe una cuenta con este correo.');
}

class InvalidCredentialsError extends AuthError {
  const InvalidCredentialsError() : super('Correo o contraseña incorrectos.');
}

class InvalidCodeError extends AuthError {
  const InvalidCodeError() : super('El código de verificación es incorrecto.');
}

class UserNotConfirmedError extends AuthError {
  const UserNotConfirmedError() : super('La cuenta no ha sido confirmada. Por favor, revisa tu correo.');
}

class UnknownAuthError extends AuthError {
  const UnknownAuthError() : super('Ha ocurrido un error inesperado. Inténtalo de nuevo.');
}

class UserNotFoundError extends AuthError {
  const UserNotFoundError() : super('No se encontró una cuenta con este correo.');
}

class InvalidPasswordError extends AuthError {
  const InvalidPasswordError() : super('La contraseña no cumple los requisitos de seguridad.');
}

enum SignInOrSignUpResult {
  success,
  needsConfirmation,
}

/// Servicio que encapsula toda la comunicación con AWS Cognito.
class AuthService {
  
  Future<void> signUp({
    required String email,
    required String password,
  }) async {
    try {
      await Amplify.Auth.signUp(
        username: email,
        password: password,
        options: SignUpOptions(
          userAttributes: { AuthUserAttributeKey.email: email },
        ),
      );
    } on UsernameExistsException {
      throw const UserAlreadyExistsError();
    } on AuthException catch (e) {
      safePrint('[AuthService] Error signUp no manejado: ${e.message}');
      throw const UnknownAuthError();
    }
  }

  Future<void> confirmSignUp({
    required String email,
    required String confirmationCode,
  }) async {
    try {
      await Amplify.Auth.confirmSignUp(
        username: email,
        confirmationCode: confirmationCode,
      );
    } on CodeMismatchException {
      throw const InvalidCodeError();
    } on AuthException catch (e) {
      safePrint('[AuthService] Error confirmSignUp no manejado: ${e.message}');
      throw const UnknownAuthError();
    }
  }

  Future<void> signIn({
    required String email,
    required String password,
  }) async {
    try {
      final result = await Amplify.Auth.signIn(
        username: email,
        password: password,
      );
      safePrint('[AuthService] 🔍 signIn result: ${result.runtimeType}');
      safePrint('[AuthService] 🔍 signIn isSignedIn: ${result.isSignedIn}');
      safePrint('[AuthService] 🔍 signIn nextStep: ${result.nextStep.signInStep}');
      
      if (result.nextStep.signInStep == AuthSignInStep.confirmSignUp) {
        safePrint('[AuthService] 🔍 Usuario requiere confirmación');
        throw const UserNotConfirmedError();
      }
      
      if (!result.isSignedIn) {
        safePrint('[AuthService] 🔍 signIn no completado - isSignedIn: false');
        throw const UnknownAuthError();
      }
    } on UserNotConfirmedException {
      safePrint('[AuthService] 🔍 CAPTURADO: UserNotConfirmedException');
      throw const UserNotConfirmedError();
    } on NotAuthorizedServiceException {
      throw const InvalidCredentialsError();
    } on SignedOutException {
      throw const InvalidCredentialsError();
    } on AuthException catch (e) {
      safePrint('[AuthService] 🔍 TIPO NO CAPTURADO: ${e.runtimeType}');
      safePrint('[AuthService] Error signIn no manejado: ${e.message}');
      throw const UnknownAuthError();
    }
  }

  Future<void> signOut() async {
    try {
      await Amplify.Auth.signOut();
    } on AuthException catch (e) {
      safePrint('[AuthService] Error signing out: ${e.message}');
    }
  }

  Future<bool> isSignedIn() async {
    try {
      safePrint('[AuthService] 🔍 Verificando estado de sesión...');
      final session = await Amplify.Auth.fetchAuthSession();
      safePrint('[AuthService] 🔍 Session isSignedIn: ${session.isSignedIn}');
      safePrint('[AuthService] 🔍 Session type: ${session.runtimeType}');
      
      if (session is CognitoAuthSession) {
        safePrint('[AuthService] 🔍 Cognito session userSub: ${session.userSubResult.value}');
        // ignore: unnecessary_null_comparison
        safePrint('[AuthService] 🔍 Cognito session tokens valid: ${session.userPoolTokensResult.value != null}');
      }
      
      return session.isSignedIn;
    } on AuthException catch (e) {
      safePrint('[AuthService] ❌ Error fetching session state: ${e.message}');
      return false;
    }
  }

  /// Retorna el token JWT (idToken) para autenticar peticiones al backend.
  Future<String?> getUserJwtToken() async {
    try {
      final session = await Amplify.Auth.fetchAuthSession();
      if (session.isSignedIn) {
          final cognitoSession = session as CognitoAuthSession;
          return cognitoSession.userPoolTokensResult.value.idToken.raw;
      }
      return null;
    } on AuthException catch (e) {
      safePrint('[AuthService] Error fetching auth session: ${e.message}');
      return null;
    }
  }

  /// Intenta iniciar sesión. Si falla porque el usuario no existe o no está confirmado,
  /// intenta registrarlo o reenviar la confirmación, sin revelar el estado interno.
  ///
  /// Este método es la piedra angular de la seguridad contra ataques de enumeración
  /// de usuarios. El comportamiento visible para el usuario es idéntico
  /// independientemente de si el email existe, no existe o no está confirmado.
  ///
  /// Lanza [InvalidCredentialsError] solo si la contraseña es incorrecta para un
  /// usuario existente y confirmado.
  /// Lanza [UnknownAuthError] para cualquier otro error inesperado.
  /// Si tiene éxito (login, registro iniciado o reenvío de código), el método
  /// completa su ejecución sin lanzar errores.
  Future<SignInOrSignUpResult> signInOrSignUp({
    required String email,
    required String password,
  }) async {
    // DIAGNÓSTICO: Log del inicio del flujo
    safePrint('[AuthService] === INICIO signInOrSignUp para email: $email ===');
    
    // 1. Limpiamos cualquier estado de verificación pendiente de un intento anterior.
    //    Esto asegura que cada flujo de autenticación comience desde un estado limpio.
    await SecureStorageService.instance.clearPendingVerification();
    safePrint('[AuthService] Storage limpiado');

    try {
      // 2. Intentamos el inicio de sesión. Este es el "happy path" más común.
      safePrint('[AuthService] Intentando signIn...');
      await signIn(email: email, password: password);

      // 3. Si `signIn` tiene éxito, el usuario está autenticado. El flujo termina aquí.
      safePrint('[AuthService] ✅ signIn exitoso - usuario autenticado');
      return SignInOrSignUpResult.success;

    } on UserNotConfirmedError {
      // 4. CAPTURA: El usuario existe y la contraseña es correcta, pero la cuenta
      //    no ha sido confirmada con el código.
      safePrint('[AuthService] 📧 Usuario no confirmado - reenviando código');
      
      // 5. Guardamos su email de forma SEGURA. La pantalla de confirmación lo necesitará.
      await SecureStorageService.instance.setPendingVerificationEmail(email);

      // 6. Intentamos reenviar el código de verificación como una cortesía.
      try {
        await Amplify.Auth.resendSignUpCode(username: email);
        safePrint('[AuthService] ✅ Código reenviado exitosamente');
      } on AuthException catch (e) {
        // Si el reenvío falla (ej. límite de reintentos), solo lo registramos.
        // No interrumpimos el flujo, ya que el usuario ya debería tener un código
        // de su registro inicial.
        safePrint('[AuthService] No se pudo reenviar el código a $email. Error: ${e.message}');
      }
      return SignInOrSignUpResult.needsConfirmation;
    } on AuthError {
      // 8. NUEVA LÓGICA: Si signIn falla por CUALQUIER razón (usuario no existe, 
      //    credenciales incorrectas, etc.), procedemos a intentar signUp.
      //    El resultado del signUp nos dirá la verdadera causa del error.
      safePrint('[AuthService] 🔄 signIn falló - continuando a signUp para determinar causa');
    }

    // 10. Si llegamos a este punto, es porque el `signIn` falló por una razón
    //     diferente a credenciales inválidas. El caso más probable es que el usuario no exista.
    //     Procedemos a intentar registrarlo.
    safePrint('[AuthService] 🆕 Procediendo a intentar signUp...');
    try {
      await signUp(email: email, password: password);
      
      // 11. Registro iniciado con éxito. Guardamos el email para la pantalla de confirmación.
      await SecureStorageService.instance.setPendingVerificationEmail(email);
      safePrint('[AuthService] ✅ signUp exitoso - email guardado en storage');
      
      // 12. Flujo de registro exitoso. Retornamos sin error. La UI mostrará
      //     el mensaje genérico, unificando la experiencia.
      safePrint('[AuthService] ✅ Retornando sin error - registro completado');
      return SignInOrSignUpResult.needsConfirmation;

    } on UserAlreadyExistsError {
      // 13. NUEVA LÓGICA: Si signUp falla porque el usuario ya existe, 
      //     significa que el signIn original falló por CONTRASEÑA INCORRECTA.
      //     Este es el único caso donde sabemos con certeza que son credenciales inválidas.
      safePrint('[AuthService] ❌ Usuario ya existe - las credenciales originales eran incorrectas');
      throw const InvalidCredentialsError();
    
    } on AuthException catch (e) {
      // 14. CAPTURA FINAL: Cualquier otro error inesperado durante el `signUp`
      //     se registra y se lanza como un error genérico y seguro para la UI.
      safePrint('[AuthService] ❌ Error inesperado durante signUp en signInOrSignUp: ${e.message}');
      throw const UnknownAuthError();
    }
  }

  /// Útil para que la pantalla de confirmación de código pueda obtener el email
  /// sin necesidad de pasarlo como argumento de navegación, lo cual es más seguro.
  Future<String?> getPendingVerificationEmail() async {
    return await SecureStorageService.instance.getPendingVerificationEmail();
  }

  /// Reenvía el código de confirmación al email especificado.
  /// Lanza [UnknownAuthError] si ocurre un error inesperado.
  Future<void> resendSignUpCode({required String email}) async {
    try {
      await Amplify.Auth.resendSignUpCode(username: email);
    } on AuthException catch (e) {
      safePrint('[AuthService] Error resendSignUpCode: ${e.message}');
      throw const UnknownAuthError();
    }
  }

  // --- MÉTODOS DE RECUPERACIÓN DE CONTRASEÑA ---

  /// Inicia el proceso de recuperación de contraseña enviando un código al email.
  ///
  /// [email] El correo del usuario que quiere recuperar su contraseña.
  /// Lanza [UserNotFoundError] si el email no existe.
  /// Lanza [UnknownAuthError] si ocurre un error inesperado.
  Future<void> forgotPassword({required String email}) async {
    try {
      await Amplify.Auth.resetPassword(username: email);
      safePrint('[AuthService] ✅ Código de recuperación enviado a: $email');
    } on UserNotFoundException {
      // El email no existe en Cognito
      throw const UserNotFoundError();
    } on AuthException catch (e) {
      safePrint('[AuthService] Error forgotPassword: ${e.message}');
      throw const UnknownAuthError();
    }
  }

  /// Confirma la nueva contraseña usando el código de recuperación.
  ///
  /// [email] El correo del usuario.
  /// [confirmationCode] El código de 6 dígitos enviado al email.
  /// [newPassword] La nueva contraseña que el usuario quiere establecer.
  /// Lanza [InvalidCodeError] si el código no es válido o ha expirado.
  /// Lanza [InvalidPasswordError] si la contraseña no cumple las políticas.
  /// Lanza [UnknownAuthError] si ocurre un error inesperado.
  Future<void> confirmForgotPassword({
    required String email,
    required String confirmationCode,
    required String newPassword,
  }) async {
    try {
      await Amplify.Auth.confirmResetPassword(
        username: email,
        newPassword: newPassword,
        confirmationCode: confirmationCode,
      );
      safePrint('[AuthService] ✅ Contraseña restablecida exitosamente para: $email');
    } on CodeMismatchException {
      // El código introducido no coincide o ha expirado
      throw const InvalidCodeError();
    } on InvalidPasswordException {
      // La nueva contraseña no cumple las políticas de Cognito
      throw const InvalidPasswordError();
    } on AuthException catch (e) {
      safePrint('[AuthService] Error confirmForgotPassword: ${e.message}');
      throw const UnknownAuthError();
    }
  }

  /// Obtiene los atributos del usuario actual autenticado.
  /// Retorna un mapa con los atributos del usuario (email, name, etc.)
  /// o null si no hay sesión activa.
  Future<Map<String, String>?> getCurrentUserAttributes() async {
    try {
      final user = await Amplify.Auth.getCurrentUser();
      final attributes = await Amplify.Auth.fetchUserAttributes();
      
      final Map<String, String> attributesMap = {};
      for (final attribute in attributes) {
        attributesMap[attribute.userAttributeKey.key] = attribute.value;
      }
      
      // Agregar el userId
      attributesMap['userId'] = user.userId;
      attributesMap['username'] = user.username;
      
      safePrint('[AuthService] ✅ Atributos del usuario obtenidos: $attributesMap');
      return attributesMap;
    } on AuthException catch (e) {
      safePrint('[AuthService] Error obteniendo atributos del usuario: ${e.message}');
      return null;
    }
  }
}
