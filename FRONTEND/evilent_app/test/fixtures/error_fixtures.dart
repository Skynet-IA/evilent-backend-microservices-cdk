// 🎯 ERROR FIXTURES - Errores REALES basados en app_error.dart
// REGLA #1: DRY - Centralizar todos los errores de prueba
// VALIDAMOS la realidad: AppError tiene type, message, originalError, stackTrace

import 'package:evilent_app/core/error_system/app_error.dart';

/// Errores de validación que el código REALMENTE genera
class ErrorFixtures {
  /// 🚫 ERRORES DE VALIDACIÓN
  static AppError validationErrorEmail() => AppError(
    type: AppErrorType.validation,
    message: 'El email es inválido',
  );
  
  static AppError validationErrorPassword() => AppError(
    type: AppErrorType.validation,
    message: 'La contraseña debe tener al menos 8 caracteres',
  );
  
  static AppError validationErrorRequired(String field) => AppError(
    type: AppErrorType.validation,
    message: 'El campo $field es obligatorio',
  );
  
  /// 🔐 ERRORES DE AUTENTICACIÓN
  static AppError invalidCredentialsError() => AppError(
    type: AppErrorType.authentication,
    message: 'Credenciales inválidas',
  );
  
  static AppError unauthorizedError() => AppError(
    type: AppErrorType.authentication,
    message: 'No autorizado',
  );
  
  static AppError sessionExpiredError() => AppError(
    type: AppErrorType.authentication,
    message: 'Tu sesión ha expirado',
  );
  
  /// 🌐 ERRORES DE CONEXIÓN
  static AppError networkError() => AppError(
    type: AppErrorType.network,
    message: 'Error de conexión',
  );
  
  static AppError noInternetError() => AppError(
    type: AppErrorType.network,
    message: 'Sin conexión a internet',
  );
  
  static AppError timeoutError() => AppError(
    type: AppErrorType.network,
    message: 'La solicitud tardó demasiado',
  );
  
  /// 🔴 ERRORES DEL SERVIDOR
  static AppError serverError() => AppError(
    type: AppErrorType.server,
    message: 'Error en el servidor',
  );
  
  static AppError notFoundError() => AppError(
    type: AppErrorType.server,
    message: 'Recurso no encontrado',
  );
  
  /// ⚠️ ERRORES DESCONOCIDOS
  static AppError unknownError() => AppError(
    type: AppErrorType.unknown,
    message: 'Ocurrió un error inesperado',
  );
}

