import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:evilent_app/core/providers/auth_provider.dart';
import 'package:evilent_app/core/services/auth_service.dart';
import 'package:evilent_app/core/utils/locator.dart';
import 'package:evilent_app/features/profile/models/user_profile.dart';
import 'package:evilent_app/features/profile/services/user_profile_service.dart';

/// 📦 Modelo que contiene todos los datos iniciales de la app
/// 
/// Se carga automáticamente cuando el usuario inicia sesión
/// y está disponible en toda la aplicación sin necesidad de recargar.
class AppData {
  final UserProfile? userProfile;
  final Map<String, String>? cognitoAttributes;

  AppData({
    this.userProfile,
    this.cognitoAttributes,
  });

  /// Verifica si el usuario tiene un perfil completo en el backend
  bool get hasCompleteProfile => 
      userProfile != null && 
      userProfile!.firstName != null && 
      userProfile!.lastName != null &&
      userProfile!.phone != null;

  /// Obtiene el nombre para mostrar (firstName o username de Cognito)
  String get displayName {
    if (userProfile?.firstName != null) {
      return userProfile!.firstName!;
    }
    if (cognitoAttributes?['name'] != null) {
      return cognitoAttributes!['name']!;
    }
    if (cognitoAttributes?['email'] != null) {
      return cognitoAttributes!['email']!.split('@').first;
    }
    return 'Usuario';
  }

  /// Obtiene el email del usuario
  String? get email {
    if (userProfile?.cognitoUserId != null) {
      return cognitoAttributes?['email'];
    }
    return cognitoAttributes?['email'];
  }
}

/// 🚀 Provider principal que carga TODOS los datos iniciales
/// 
/// Se ejecuta automáticamente cuando el usuario se autentica.
/// Carga datos en paralelo para máxima velocidad.
/// 
/// **Datos que carga:**
/// - Perfil del usuario desde el backend
/// - Atributos de Cognito (email, username, etc.)
final appDataProvider = FutureProvider<AppData>((ref) async {
  // 1. Verificar que el usuario esté autenticado
  final authState = ref.watch(authProvider);
  
  if (!authState.hasValue || authState.value != true) {
    throw Exception('Usuario no autenticado');
  }

  // 2. Obtener el token JWT
  final authService = locator<AuthService>();
  final token = await authService.getUserJwtToken();
  
  if (token == null) {
    throw Exception('No se pudo obtener el token de autenticación');
  }

  // 3. ⚡ CARGAR TODOS LOS DATOS EN PARALELO
  final results = await Future.wait([
    // Perfil del usuario desde backend
    _loadUserProfile(token),
    
    // Atributos de Cognito (email, etc.)
    authService.getCurrentUserAttributes(),
  ]);

  // 4. Construir el objeto AppData con todos los datos
  return AppData(
    userProfile: results[0] as UserProfile?,
    cognitoAttributes: results[1] as Map<String, String>?,
  );
});

/// 📖 Carga el perfil del usuario desde el backend
/// 
/// Si no existe perfil (404), retorna null para que la app
/// pueda mostrar la pantalla de completar perfil.
Future<UserProfile?> _loadUserProfile(String token) async {
  try {
    return await UserProfileService.getProfile(token);
  } catch (e) {
    // Si no existe el perfil (404) o no está implementado, retornar null
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔍 PROVIDERS DERIVADOS - Acceso rápido a datos específicos
// ═══════════════════════════════════════════════════════════════════════════

/// 👤 Solo el perfil del usuario
/// 
/// Permite que los widgets se suscriban solo al perfil
/// sin necesidad de observar todo el AppData.
final userProfileProvider = Provider<UserProfile?>((ref) {
  final appData = ref.watch(appDataProvider);
  return appData.when(
    data: (data) => data.userProfile,
    loading: () => null,
    error: (_, __) => null,
  );
});

/// 📧 Atributos de Cognito
/// 
/// Proporciona acceso directo a los atributos del usuario
/// almacenados en AWS Cognito (email, sub, etc.)
final cognitoAttributesProvider = Provider<Map<String, String>?>((ref) {
  final appData = ref.watch(appDataProvider);
  return appData.when(
    data: (data) => data.cognitoAttributes,
    loading: () => null,
    error: (_, __) => null,
  );
});

/// ✅ Verificar si el usuario tiene perfil completo
/// 
/// Útil para mostrar notificaciones o redirigir al usuario
/// a completar su perfil.
final hasCompleteProfileProvider = Provider<bool>((ref) {
  final appData = ref.watch(appDataProvider);
  return appData.when(
    data: (data) => data.hasCompleteProfile,
    loading: () => false,
    error: (_, __) => false,
  );
});

/// 📛 Nombre para mostrar del usuario
/// 
/// Retorna el firstName del perfil, o el name de Cognito,
/// o el email (parte antes del @), o "Usuario" por defecto.
final displayNameProvider = Provider<String>((ref) {
  final appData = ref.watch(appDataProvider);
  return appData.when(
    data: (data) => data.displayName,
    loading: () => 'Usuario',
    error: (_, __) => 'Usuario',
  );
});

/// 📧 Email del usuario
/// 
/// Obtiene el email desde los atributos de Cognito.
final userEmailProvider = Provider<String?>((ref) {
  final appData = ref.watch(appDataProvider);
  return appData.when(
    data: (data) => data.email,
    loading: () => null,
    error: (_, __) => null,
  );
});

