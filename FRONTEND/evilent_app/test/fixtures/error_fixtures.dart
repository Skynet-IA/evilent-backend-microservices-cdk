// 🎯 ERROR FIXTURES - Errores de dominio para tests
// REGLA #1: DRY - Centralizar todos los errores de prueba

import 'package:evilent_app/core/error_system/app_error.dart';

/// Errores de autenticación
class ErrorFixtures {
  /// 🚫 ERRORES DE VALIDACIÓN
  static AppError validationErrorEmail() => AppError(
    type: AppErrorType.validation,
    message: 'El email es inválido',
    code: 'VALIDATION_EMAIL',
  );
  
  static AppError validationErrorPassword() => AppError(
    type: AppErrorType.validation,
    message: 'La contraseña debe tener al menos 8 caracteres',
    code: 'VALIDATION_PASSWORD_SHORT',
  );
  
  static AppError validationErrorRequired(String field) => AppError(
    type: AppErrorType.validation,
    message: 'El campo $field es obligatorio',
    code: 'VALIDATION_REQUIRED',
  );
  
  /// 🔐 ERRORES DE AUTENTICACIÓN
  static AppError invalidCredentialsError() => AppError(
    type: AppErrorType.authentication,
    message: 'Credenciales inválidas',
    code: 'INVALID_CREDENTIALS',
  );
  
  static AppError unauthorizedError() => AppError(
    type: AppErrorType.authentication,
    message: 'No autorizado',
    code: 'UNAUTHORIZED',
  );
  
  static AppError sessionExpiredError() => AppError(
    type: AppErrorType.authentication,
    message: 'Tu sesión ha expirado',
    code: 'SESSION_EXPIRED',
  );
  
  /// 🌐 ERRORES DE CONEXIÓN
  static AppError networkError() => AppError(
    type: AppErrorType.network,
    message: 'Error de conexión',
    code: 'NETWORK_ERROR',
  );
  
  static AppError noInternetError() => AppError(
    type: AppErrorType.network,
    message: 'Sin conexión a internet',
    code: 'NO_INTERNET',
  );
  
  static AppError timeoutError() => AppError(
    type: AppErrorType.network,
    message: 'La solicitud tardó demasiado',
    code: 'TIMEOUT',
  );
  
  /// 🔴 ERRORES DEL SERVIDOR
  static AppError serverError() => AppError(
    type: AppErrorType.server,
    message: 'Error en el servidor',
    code: 'SERVER_ERROR',
  );
  
  static AppError notFoundError() => AppError(
    type: AppErrorType.server,
    message: 'Recurso no encontrado',
    code: 'NOT_FOUND',
  );
  
  /// ⚠️ ERRORES DESCONOCIDOS
  static AppError unknownError() => AppError(
    type: AppErrorType.unknown,
    message: 'Ocurrió un error inesperado',
    code: 'UNKNOWN_ERROR',
  );
}

