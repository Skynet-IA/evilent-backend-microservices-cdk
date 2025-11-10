/// Provider de estado de autenticación usando Riverpod.
/// Actúa como capa intermedia entre la UI y AuthService.
/// NO contiene lógica de negocio - solo gestiona estado reactivo.

import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:evilent_app/core/services/auth_service.dart';
import 'package:evilent_app/core/utils/locator.dart';

enum AuthResult { 
  success,
  needsConfirmation, 
  error 
}

/// Notificador que gestiona el estado de autenticación de la aplicación.
/// Delega toda la lógica de negocio a AuthService.
class AuthNotifier extends AsyncNotifier<bool> {
  
  @override
  FutureOr<bool> build() async {
    // Verifica si hay una sesión activa al inicializar el provider
    final authService = ref.read(authServiceProvider);
    return await authService.isSignedIn();
  }

  /// Gestiona el inicio de sesión o registro del usuario en un solo flujo seguro.
  ///
  /// 📞 **Llamado por:**
  /// • LoginForm._onSubmit() → login_form.dart
  /// • RegisterForm._onSubmit() → register_form.dart
  ///
  /// 🔗 **Llama a:**
  /// • authService.signInOrSignUp() → auth_service.dart
  ///
  /// 🎯 **Flujo:**
  /// ```
  /// Usuario ingresa email y password en formulario
  ///   ↓
  /// signInOrSignUp()
  ///   ↓
  /// Si usuario ya existe → intenta login
  ///   • Si requiere confirmación, retorna needsConfirmation
  ///   • Si credenciales válidas, retorna success
  /// Si usuario NO existe → intenta registro
  ///   • Si se crea pero requiere confirmación, retorna needsConfirmation
  ///   • Si error, retorna error clasificado
  ///   ↓
  /// Actualiza estado (loading, success, error) en Riverpod
  /// ```
  ///
  /// 🔁 **Retorna:**  
  /// • result: AuthResult (success, needsConfirmation, error)  
  /// • error: excepción AuthError específica (para mostrar detalle en UI)
  ///
  /// ⚠️ **Nota:** Siempre actualiza el estado asíncrono para notificar listeners de la UI.
  Future<({AuthResult result, Object? error})> signInOrSignUp({
    required String email,
    required String password,
  }) async {
    state = const AsyncLoading();
    
    try {
      final authService = ref.read(authServiceProvider);
      final serviceResult = await authService.signInOrSignUp(
        email: email,
        password: password,
      );
      
      if (serviceResult == SignInOrSignUpResult.needsConfirmation) {
        state = const AsyncData(false);
        return (result: AuthResult.needsConfirmation, error: null);
      } else {
        state = const AsyncData(true);
        return (result: AuthResult.success, error: null);
      }
    } on InvalidCredentialsError catch (e) {
      state = AsyncError(e, StackTrace.current);
      return (result: AuthResult.error, error: e);
    } on AuthError catch (e) {
      state = AsyncError(e, StackTrace.current);
      return (result: AuthResult.error, error: e);
    } catch (e, s) {
      final unknownError = UnknownAuthError();
      state = AsyncError(unknownError, s);
      return (result: AuthResult.error, error: unknownError);
    }
  }

  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ ✅ CONFIRM SIGN UP - VERIFICACIÓN DE CUENTA                            │
  // └─────────────────────────────────────────────────────────────────────────┘

  /// Confirma el registro del usuario con el código de verificación de 6 dígitos
  /// 
  /// 📞 **Llamado por:**
  /// • ConfirmationScreen._confirmSignUp() → confirmation_screen.dart línea 78
  ///
  /// 🔗 **Llama a:**
  /// • authService.confirmSignUp() → auth_service.dart línea 113
  ///
  /// 🎯 **Flujo:**
  /// ```
  /// ConfirmationScreen
  ///   ↓ usuario ingresa 6 dígitos en Pinput
  ///   ↓ onCompleted → _confirmSignUp()
  ///   ↓ confirmSignUp(email, code)
  /// AuthProvider (aquí)
  ///   ↓ state = AsyncLoading()
  ///   ↓ authService.confirmSignUp()
  /// AuthService
  ///   ↓ Amplify.Auth.confirmSignUp()
  ///   ↓ AWS Cognito verifica código
  /// AuthProvider (aquí)
  ///   ↓ state = AsyncData(true) [cuenta confirmada]
  /// ConfirmationScreen
  ///   ↓ Limpia storage
  ///   ↓ Navega a LoginScreen
  /// ```
  ///
  /// ❌ **Errores que puede lanzar:**
  /// • InvalidCodeError: Código incorrecto o expirado
  /// • AuthError: Otro error de AWS Cognito
  /// • UnknownAuthError: Error inesperado
  ///
  /// 🔑 **Por qué hace rethrow:**
  /// ConfirmationScreen tiene mejor contexto para decidir qué hacer con el error
  /// (mostrar mensaje, limpiar campo, etc.)
  Future<void> confirmSignUp({
    required String email,
    required String confirmationCode,
  }) async {
    // 1️⃣ Actualizar estado a "cargando"
    state = const AsyncLoading();
    
    try {
      final authService = ref.read(authServiceProvider);
      
      // 2️⃣ Delegar confirmación a AuthService
      await authService.confirmSignUp(
        email: email,
        confirmationCode: confirmationCode,
      );
      
      // 3️⃣ Éxito: actualizar estado a autenticado
      state = const AsyncData(true);
    } on InvalidCodeError catch (e) {
      // ❌ Código de verificación incorrecto o expirado
      state = AsyncError(e, StackTrace.current);
      rethrow; // La UI sabe cómo manejar esto
    } on AuthError catch (e) {
      // ❌ Cualquier otro error de autenticación conocido
      state = AsyncError(e, StackTrace.current);
      rethrow;
    } catch (e, s) {
      // ❌ Error inesperado - envolver en UnknownAuthError
      final unknownError = UnknownAuthError();
      state = AsyncError(unknownError, s);
      throw unknownError;
    }
  }

  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 🔄 RESEND SIGN UP CODE - REENVÍO DE CÓDIGO                             │
  // └─────────────────────────────────────────────────────────────────────────┘

  /// Reenvía el código de confirmación al email
  /// 
  /// 📞 **Llamado por:**
  /// • ConfirmationScreen._resendCode() → confirmation_screen.dart línea 150
  ///
  /// 🔗 **Llama a:**
  /// • authService.resendSignUpCode() → auth_service.dart línea 336
  ///
  /// 🎯 **Flujo:**
  /// ```
  /// ConfirmationScreen
  ///   ↓ usuario presiona "Reenviar código"
  ///   ↓ _resendCode()
  /// AuthProvider (aquí)
  ///   ↓ authService.resendSignUpCode()
  /// AuthService
  ///   ↓ Amplify.Auth.resendSignUpCode()
  ///   ↓ AWS Cognito envía nuevo código al email
  /// ConfirmationScreen
  ///   ↓ Muestra mensaje de éxito
  /// ```
  ///
  /// ❌ **Errores que puede lanzar:**
  /// • AuthError: Límite de reintentos alcanzado u otro error
  /// • UnknownAuthError: Error inesperado
  ///
  /// 📌 **Nota:** No actualiza state porque es una operación secundaria
  Future<void> resendSignUpCode({required String email}) async {
    try {
      final authService = ref.read(authServiceProvider);
      await authService.resendSignUpCode(email: email);
    } on AuthError {
      // ❌ Error conocido de autenticación (ej. límite de reintentos)
      rethrow;
    } catch (e) {
      // ❌ Error inesperado - envolver en UnknownAuthError
      throw UnknownAuthError();
    }
  }

  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 📧 GET PENDING VERIFICATION EMAIL - OBTENER EMAIL PENDIENTE            │
  // └─────────────────────────────────────────────────────────────────────────┘

  /// Obtiene el email que está pendiente de verificación desde secure storage
  /// 
  /// 📞 **Llamado por:**
  /// • ConfirmationScreen._loadPendingEmail() → confirmation_screen.dart línea 63
  ///
  /// 🔗 **Llama a:**
  /// • authService.getPendingVerificationEmail() → auth_service.dart línea 330
  ///
  /// 📊 **Retorna:**
  /// • String: El email pendiente de verificación
  /// • null: No hay email pendiente
  ///
  /// 🔒 **Seguridad:**
  /// El email se guarda en secure storage (no en argumentos de navegación)
  /// para evitar que quede expuesto en logs o historial de navegación
  Future<String?> getPendingVerificationEmail() async {
    final authService = ref.read(authServiceProvider);
    return await authService.getPendingVerificationEmail();
  }

  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 🔑 FORGOT PASSWORD - RECUPERACIÓN DE CONTRASEÑA                        │
  // └─────────────────────────────────────────────────────────────────────────┘

  /// Inicia el proceso de recuperación de contraseña enviando código al email
  /// 
  /// 📞 **Llamado por:**
  /// • ForgotPasswordScreen._sendResetCode() → forgot_password_screen.dart línea 59
  /// • ResetCodeScreen._resendCode() → reset_code_screen.dart línea 179
  ///
  /// 🔗 **Llama a:**
  /// • authService.forgotPassword() → auth_service.dart línea 352
  ///
  /// 🎯 **Flujo:**
  /// ```
  /// ForgotPasswordScreen
  ///   ↓ usuario ingresa email y presiona "Enviar código"
  ///   ↓ _sendResetCode()
  /// AuthProvider (aquí)
  ///   ↓ authService.forgotPassword()
  /// AuthService
  ///   ↓ Amplify.Auth.resetPassword()
  ///   ↓ AWS Cognito envía código al email
  /// ForgotPasswordScreen
  ///   ↓ Muestra mensaje ambiguo (seguridad)
  ///   ↓ Navega a ResetCodeScreen (siempre)
  /// ```
  ///
  /// ❌ **Errores que puede lanzar:**
  /// • UserNotFoundError: Email no existe (aunque en la UI se maneja igual)
  /// • AuthError: Otro error de AWS Cognito
  /// • UnknownAuthError: Error inesperado
  ///
  /// 🔒 **Seguridad:**
  /// La UI siempre muestra mensaje ambiguo y navega, incluso si email no existe,
  /// para prevenir ataques de enumeración de usuarios
  Future<void> forgotPassword({required String email}) async {
    try {
      final authService = ref.read(authServiceProvider);
      await authService.forgotPassword(email: email);
    } on UserNotFoundError {
      rethrow;
    } on AuthError {
      rethrow;
    } catch (e) {
      throw UnknownAuthError();
    }
  }

  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 🔍 VALIDATE RESET CODE - VALIDAR CÓDIGO DE RECUPERACIÓN                │
  // └─────────────────────────────────────────────────────────────────────────┘

  /// Valida que el código de recuperación sea correcto usando técnica inteligente
  /// 
  /// 📞 **Llamado por:**
  /// • ResetCodeScreen._validateCode() → reset_code_screen.dart línea 100
  ///
  /// 🔗 **Llama a:**
  /// • authService.confirmForgotPassword() con password temporal → auth_service.dart línea 373
  ///
  /// 📊 **Retorna:**
  /// • true: Código válido → Navegar a NewPasswordScreen
  /// • Lanza InvalidCodeError: Código inválido → Mostrar error y quedarse
  ///
  /// 🎯 **Flujo (Técnica Inteligente):**
  /// ```
  /// ResetCodeScreen
  ///   ↓ usuario completa 6 dígitos en Pinput
  ///   ↓ onCompleted → _validateCode()
  ///   ↓ validateResetCode(email, code)
  /// AuthProvider (aquí)
  ///   ↓ authService.confirmForgotPassword(email, code, '123')
  /// AuthService
  ///   ↓ Amplify.Auth.confirmResetPassword()
  ///   ↓ AWS Cognito procesa...
  ///
  /// CASO 1: Código válido, contraseña rechazada (LO ESPERADO)
  ///   ↓ Lanza InvalidPasswordError
  /// AuthProvider (aquí)
  ///   ↓ Captura InvalidPasswordError
  ///   ↓ return true  ← ¡Código es válido!
  /// ResetCodeScreen
  ///   ↓ Navega a NewPasswordScreen
  ///
  /// CASO 2: Código inválido
  ///   ↓ Lanza InvalidCodeError
  /// AuthProvider (aquí)
  ///   ↓ rethrow InvalidCodeError
  /// ResetCodeScreen
  ///   ↓ Muestra error "Código incorrecto"
  /// ```
  ///
  /// 🧠 **¿Por qué esta técnica?**
  /// AWS Cognito NO tiene un endpoint específico para "solo validar código".
  /// Por eso usamos confirmResetPassword con una contraseña temporal ('123')
  /// que sabemos será rechazada. Si Cognito rechaza la contraseña, significa
  /// que el código SÍ era válido (llegó hasta ese punto de validación).
  ///
  /// 💡 **Ventajas de esta técnica:**
  /// • Valida el código sin establecer una contraseña inválida
  /// • Permite separar la validación del código del establecimiento de contraseña
  /// • Mejora UX: usuario sabe si el código es válido ANTES de elegir contraseña
  ///
  /// ❌ **Errores que puede lanzar:**
  /// • InvalidCodeError: Código incorrecto o expirado
  /// • AuthError: Otro error de AWS Cognito
  /// • UnknownAuthError: Error inesperado
  Future<bool> validateResetCode({
    required String email,
    required String code,
  }) async {
    try {
      final authService = ref.read(authServiceProvider);
      
      // 🎯 Técnica: intentar confirmar con contraseña temporal
      // que SABEMOS será rechazada por no cumplir políticas
      await authService.confirmForgotPassword(
        email: email,
        confirmationCode: code,
        newPassword: '123', // ← Contraseña intencionalmente inválida
      );
      
      // Si llegamos aquí, el código era válido
      // (caso raro donde '123' fue aceptada, pero aún así es válido)
      return true;
    } on InvalidPasswordError {
      // ✅ PERFECTO: Código válido, contraseña temporal rechazada
      // Este es el caso esperado y deseado
      return true;
    } on InvalidCodeError {
      // ❌ Código inválido - AWS Cognito lo rechazó antes de validar contraseña
      rethrow;
    } on AuthError {
      // ❌ Otro error de AWS Cognito
      rethrow;
    } catch (e) {
      // ❌ Error inesperado
      throw UnknownAuthError();
    }
  }

  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 🔐 CONFIRM FORGOT PASSWORD - ESTABLECER NUEVA CONTRASEÑA               │
  // └─────────────────────────────────────────────────────────────────────────┘

  /// Confirma el restablecimiento de contraseña con código y nueva contraseña
  /// 
  /// 📞 **Llamado por:**
  /// • NewPasswordScreen._setNewPassword() → new_password_screen.dart línea 165
  ///
  /// 🔗 **Llama a:**
  /// • authService.confirmForgotPassword() → auth_service.dart línea 373
  ///
  /// 🎯 **Flujo:**
  /// ```
  /// NewPasswordScreen
  ///   ↓ usuario ingresa nueva contraseña y confirmación
  ///   ↓ valida que coincidan
  ///   ↓ presiona "Restablecer contraseña"
  ///   ↓ _setNewPassword()
  ///   ↓ confirmForgotPassword(email, code, newPassword)
  /// AuthProvider (aquí)
  ///   ↓ authService.confirmForgotPassword()
  /// AuthService
  ///   ↓ Amplify.Auth.confirmResetPassword()
  ///   ↓ AWS Cognito valida código y contraseña
  ///   ↓ Establece nueva contraseña
  /// NewPasswordScreen
  ///   ↓ Muestra mensaje de éxito
  ///   ↓ Navega a LoginScreen (limpia toda la pila)
  /// ```
  ///
  /// ❌ **Errores que puede lanzar:**
  /// • InvalidCodeError: Código expiró → Retroceder a pantalla anterior
  /// • InvalidPasswordError: Contraseña no cumple requisitos → Quedarse y mostrar error
  /// • AuthError: Otro error de AWS Cognito
  /// • UnknownAuthError: Error inesperado
  ///
  /// 🔑 **Diferencia con validateResetCode:**
  /// • validateResetCode: Solo valida, usa contraseña temporal
  /// • confirmForgotPassword: Establece contraseña real del usuario
  ///
  /// 📌 **Nota:** El código ya fue validado en ResetCodeScreen, pero AWS Cognito
  /// lo vuelve a validar aquí por seguridad (podría haber expirado entre pantallas)
  Future<void> confirmForgotPassword({
    required String email,
    required String confirmationCode,
    required String newPassword,
  }) async {
    try {
      final authService = ref.read(authServiceProvider);
      
      // Establecer la nueva contraseña del usuario
      await authService.confirmForgotPassword(
        email: email,
        confirmationCode: confirmationCode,
        newPassword: newPassword,
      );
    } on InvalidCodeError {
      // ❌ Código expiró o es inválido - retroceder
      rethrow;
    } on InvalidPasswordError {
      // ❌ Contraseña no cumple requisitos - quedarse y corregir
      rethrow;
    } on AuthError {
      // ❌ Otro error de AWS Cognito
      rethrow;
    } catch (e) {
      // ❌ Error inesperado
      throw UnknownAuthError();
    }
  }

  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 🚪 SIGN OUT - CERRAR SESIÓN                                            │
  // └─────────────────────────────────────────────────────────────────────────┘

  /// Cierra la sesión del usuario actual y actualiza el estado de autenticación
  /// 
  /// 📞 **Llamado por:**
  /// • HomeScreen (logout button) → home_screen.dart línea 30
  ///
  /// 🔗 **Llama a:**
  /// • authService.signOut() → auth_service.dart línea 224
  ///
  /// 🎯 **Flujo:**
  /// ```
  /// HomeScreen
  ///   ↓ usuario presiona botón de logout
  ///   ↓ signOut()
  /// AuthProvider (aquí)
  ///   ↓ state = AsyncLoading()
  ///   ↓ authService.signOut()
  /// AuthService
  ///   ↓ Amplify.Auth.signOut()
  ///   ↓ AWS Cognito elimina tokens y sesión
  /// AuthProvider (aquí)
  ///   ↓ state = AsyncData(false) [usuario desautenticado]
  /// HomeScreen
  ///   ↓ Navega a AuthGate
  ///   ↓ AuthGate detecta state = false
  ///   ↓ Muestra IntroScreen
  /// ```
  ///
  /// 📌 **Características:**
  /// • Actualiza el estado de Riverpod a false (no autenticado)
  /// • No lanza errores - operación silenciosa para mejor UX
  /// • Siempre navega a AuthGate incluso si hay error técnico
  /// • Los tokens se eliminan del dispositivo de forma segura
  ///
  /// ❌ **Manejo de errores:**
  /// Si ocurre un error durante signOut, se captura silenciosamente y
  /// se actualiza el estado igualmente para que la UI pueda proceder.
  /// Esto es intencional: un error al cerrar sesión no debe bloquear al usuario.
  Future<void> signOut() async {
    // 1️⃣ Actualizar estado a "cargando"
    state = const AsyncLoading();
    
    try {
      final authService = ref.read(authServiceProvider);
      
      // 2️⃣ Cerrar sesión en AuthService/Cognito
      await authService.signOut();
      
      // 3️⃣ Actualizar estado a "no autenticado"
      state = const AsyncData(false);
    } catch (e) {
      // ⚠️ Incluso si hay error, marcamos como no autenticado
      // para que la UI pueda proceder con la navegación
      state = const AsyncData(false);
      // Log del error para debugging, pero no se lanza a la UI
    }
  }

}

// ┌─────────────────────────────────────────────────────────────────────────┐
// │ 🏰 PROVIDERS - INSTANCIAS GLOBALES                                      │
// └─────────────────────────────────────────────────────────────────────────┘

/// 🏰 **authProvider - El Provider Principal de Autenticación**
///
/// Este es el punto de acceso principal para toda la funcionalidad de autenticación
/// en la aplicación. Todas las pantallas de auth (Login, Confirmation, etc.) 
/// deben usar este provider para realizar operaciones de autenticación.
///
/// 📊 **Tipo:** AsyncNotifierProvider<AuthNotifier, bool>
/// - Gestiona una instancia única de AuthNotifier (el notifier)
/// - Expone el estado AsyncValue<bool> de autenticación a la UI
/// - bool indica si hay sesión activa (true) o no (false)
///
/// 🎯 **Cómo usarlo en widgets:**
///
/// **1. Para LEER el estado de forma reactiva (ref.watch):**
/// ```dart
/// // En AuthGate, HomeScreen, etc. (widgets que reaccionan al estado de auth)
/// class AuthGate extends ConsumerWidget {
///   @override
///   Widget build(BuildContext context, WidgetRef ref) {
///     final authState = ref.watch(authProvider);  // ← Se reconstruye cuando cambia
///     
///     return authState.when(
///       loading: () => CircularProgressIndicator(),
///       error: (error, _) => ErrorScreen(error: error.toString()),
///       data: (isAuthenticated) => isAuthenticated 
///           ? HomeScreen()  // ← Usuario autenticado
///           : IntroScreen(), // ← Usuario no autenticado
///     );
///   }
/// }
/// ```
///
/// **2. Para EJECUTAR acciones (ref.read):**
/// ```dart
/// // En LoginScreen, ConfirmationScreen, etc. (widgets que ejecutan acciones)
/// class LoginScreen extends ConsumerStatefulWidget { ... }
/// 
/// class _LoginScreenState extends ConsumerState<LoginScreen> {
///   Future<void> _handleAuthentication() async {
///     // ❌ INCORRECTO: ref.watch(authProvider.notifier)
///     // ✅ CORRECTO: ref.read(authProvider.notifier)
///     
///     final result = await ref.read(authProvider.notifier).signInOrSignUp(
///       email: _emailController.text,
///       password: _passwordController.text,
///     );
///     
///     if (result.result == AuthResult.success) {
///       // Navegar a HomeScreen
///     }
///   }
/// }
/// ```
///
/// 📌 **Diferencia ref.watch vs ref.read:**
/// • ref.watch: Escucha cambios, reconstruye widget → Usar para LEER estado
/// • ref.read: No escucha cambios, solo obtiene valor actual → Usar para EJECUTAR acciones
///
/// 🔗 **Pantallas que usan este provider:**
/// • AuthGate: Lee estado para decidir qué mostrar (IntroScreen o HomeScreen)
/// • LoginScreen: Ejecuta signInOrSignUp()
/// • ConfirmationScreen: Ejecuta confirmSignUp(), resendSignUpCode(), getPendingVerificationEmail()
/// • ForgotPasswordScreen: Ejecuta forgotPassword()
/// • ResetCodeScreen: Ejecuta validateResetCode(), forgotPassword()
/// • NewPasswordScreen: Ejecuta confirmForgotPassword()
final authProvider = AsyncNotifierProvider<AuthNotifier, bool>(
  AuthNotifier.new, // ✅ Constructor sin parámetros (Riverpod lo inicializa)
);

/// 🌉 **authServiceProvider - Puente a AuthService (GetIt → Riverpod)**
///
/// Este provider es el "puente" entre el sistema de inyección de dependencias
/// GetIt (usado para AuthService) y Riverpod (usado para estado reactivo).
///
/// 🎯 **Propósito:**
/// Proporciona acceso al AuthService existente (registrado en GetIt/locator)
/// de manera que Riverpod pueda consumirlo como una dependencia nativa.
/// Esto permite que AuthNotifier use ref.read(authServiceProvider) en lugar
/// de locator<AuthService>() directamente.
///
/// 🏗️ **Arquitectura:**
/// ```
/// main.dart → setupLocator() → GetIt registra AuthService como singleton
///     ↓
/// authServiceProvider → locator<AuthService>() → Obtiene instancia
///     ↓
/// AuthNotifier → ref.read(authServiceProvider) → Usa la instancia
///     ↓
/// AuthService → Amplify.Auth → AWS Cognito
/// ```
///
/// 🔧 **Ventajas de usar un provider:**
/// 1. **Testing:** Fácil de mockear usando ProviderScope overrides
/// 2. **Consistencia:** Todo el estado de la app usa Riverpod
/// 3. **Observabilidad:** Puedes usar ProviderObserver para debugging
///
/// 📌 **Ejemplo de override en tests:**
/// ```dart
/// testWidgets('Auth flow test', (tester) async {
///   await tester.pumpWidget(
///     ProviderScope(
///       overrides: [
///         authServiceProvider.overrideWithValue(MockAuthService()),
///       ],
///       child: MyApp(),
///     ),
///   );
/// });
/// ```
///
/// 🔗 **Usado por:**
/// • Todos los métodos de AuthNotifier (build, signInOrSignUp, confirmSignUp, etc.)
final authServiceProvider = Provider<AuthService>((ref) {
  return locator<AuthService>();
});

/// Provider que obtiene los atributos del usuario actual.
/// Retorna un AsyncValue con un mapa de atributos del usuario.
final currentUserProvider = FutureProvider<Map<String, String>?>((ref) async {
  final authService = ref.read(authServiceProvider);
  return await authService.getCurrentUserAttributes();
});
