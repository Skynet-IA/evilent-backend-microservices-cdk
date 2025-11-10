import 'package:flutter_secure_storage/flutter_secure_storage.dart';

// Servicio de almacenamiento seguro cifrado usando Keychain (iOS) y Keystore (Android).
// Gestiona datos sensibles como emails de usuarios pendientes de verificación.
class SecureStorageService {
  static final SecureStorageService _instance = SecureStorageService._internal();
  factory SecureStorageService() => _instance;
  SecureStorageService._internal();

  static SecureStorageService get instance => _instance;

  final _storage = const FlutterSecureStorage();

  static const String _keyPendingVerificationEmail = 'pending_verification_email';

  /// Guarda el email de un usuario pendiente de confirmar su cuenta.
  Future<void> setPendingVerificationEmail(String email) async {
    await _storage.write(key: _keyPendingVerificationEmail, value: email);
  }

  /// Recupera el email del usuario pendiente de confirmación.
  Future<String?> getPendingVerificationEmail() async {
    return await _storage.read(key: _keyPendingVerificationEmail);
  }

  /// Elimina el email de verificación pendiente.
  /// Llamar al iniciar signInOrSignUp o después de confirmación exitosa.
  Future<void> clearPendingVerification() async {
    await _storage.delete(key: _keyPendingVerificationEmail);
  }
}
