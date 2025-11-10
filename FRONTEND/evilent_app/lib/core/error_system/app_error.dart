// ═══════════════════════════════════════════════════════════════════════════════
// 🤖 SISTEMA DE CLASIFICACIÓN DE ERRORES
// ═══════════════════════════════════════════════════════════════════════════════
//
// 🎯 CRÍTICO: Define cómo se clasifican y manejan TODOS los errores de la app.
//
// 📋 COMPONENTES:
// • AppErrorType - Enum que clasifica errores por tipo y severidad
// • AppError - Estructura unificada que envuelve excepciones técnicas
// • fromException() - Factory que traduce excepciones a AppError
//
// 🔄 FLUJO:
// Exception → AppError.fromException() → ErrorUtils.logAndReport() → UI
//
// ⚠️ CLASIFICACIÓN POR SEVERIDAD:
// • FATALES (requieren acción inmediata): authentication, server, permission, unknown
// • NO FATALES (la app continúa): network, validation
// ═══════════════════════════════════════════════════════════════════════════════

import 'package:amplify_flutter/amplify_flutter.dart';
import 'package:flutter/services.dart';
import 'dart:io';

/// Tipos de errores clasificados por severidad y contexto.
enum AppErrorType {
  // Errores fatales - requieren acción inmediata
  authentication('authentication'),
  server('server'), 
  permission('permission'),
  unknown('unknown'),
  
  // Errores no fatales - la app puede continuar
  network('network'),
  validation('validation');
  
  const AppErrorType(this.value);
  final String value;
}

/// Estructura unificada para todos los errores de la aplicación.
/// Envuelve excepciones técnicas en un objeto clasificado con metadata adicional.
class AppError implements Exception {
  final AppErrorType type;
  final String message;
  final dynamic originalError;
  final StackTrace? stackTrace;
  final DateTime timestamp;
  final Map<String, dynamic>? context;

  AppError({
    required this.type,
    required this.message,
    this.originalError,
    this.stackTrace,
    DateTime? timestamp,
    this.context,
  }) : timestamp = timestamp ?? DateTime.now();

  // ═════════════════════════════════════════════════════════════════════════════
  // 🧠 FACTORY: TRADUCTOR AUTOMÁTICO DE EXCEPCIONES
  // ═════════════════════════════════════════════════════════════════════════════
  //
  // 🎯 CRÍTICO: Esta función clasifica TODAS las excepciones de la app.
  //
  // 📋 MAPEO DE EXCEPCIONES:
  // • SocketException → network
  // • AuthException → authentication
  // • HttpException (500/502) → server
  // • HttpException (403/401) → permission
  // • FormatException → validation
  // • PlatformException → permission o unknown
  // • Otras → unknown
  //
  // 🔄 FLUJO:
  // Exception → fromException() → ErrorUtils.logAndReport() → UI
  // ═════════════════════════════════════════════════════════════════════════════
  factory AppError.fromException(
    dynamic error, [
    StackTrace? stackTrace,
    Map<String, dynamic>? context,
  ]) {
    AppErrorType type;
    String message;

    if (error is SocketException || 
        error.toString().contains('Network') ||
        error.toString().contains('Connection')) {
      type = AppErrorType.network;
      message = 'Parece que no tienes conexión a internet. Revisa tu WiFi o datos móviles.';
      
    } else if (error is AuthException ||
                error.toString().contains('Authentication') ||
                error.toString().contains('Unauthorized')) {
      type = AppErrorType.authentication;
      message = 'Tu sesión ha expirado. Necesitas iniciar sesión otra vez.';
      
    } else if (error is HttpException) {
      final httpError = error;
      
      if (httpError.message.contains('500') || 
          httpError.message.contains('502') ||
          httpError.message.contains('503') ||
          httpError.message.contains('504')) {
        type = AppErrorType.server;
        message = 'Nuestros servidores están teniendo problemas. Nuestro equipo técnico ha sido notificado.';
        
      } else if (httpError.message.contains('403') || 
                  httpError.message.contains('401')) {
        type = AppErrorType.permission;
        message = 'No tienes permiso para realizar esta acción.';
        
      } else {
        type = AppErrorType.unknown;
        message = 'Ocurrió un error inesperado. Nuestro equipo técnico ha sido notificado.';
      }
      
    } else if (error is PlatformException) {
      final platformError = error;
      
      if (platformError.code.contains('permission') ||
          platformError.code.contains('PERMISSION')) {
        type = AppErrorType.permission;
        message = 'La aplicación necesita permisos adicionales para funcionar correctamente.';
        
      } else {
        type = AppErrorType.unknown;
        message = 'Ocurrió un problema con tu dispositivo. Intenta reiniciar la aplicación.';
      }
      
    } else if (error is FormatException || error is ArgumentError) {
      type = AppErrorType.validation;
      message = 'La información que ingresaste no es válida. Por favor revísala.';
      
    } else {
      type = AppErrorType.unknown;
      message = 'Ocurrió un error inesperado. Nuestro equipo técnico ha sido notificado.';
    }

    return AppError(
      type: type,
      message: message,
      originalError: error,
      stackTrace: stackTrace,
      context: context,
    );
  }

  /// Determina si el error requiere atención inmediata del usuario.
  /// FATALES (true): authentication, server, permission, unknown
  /// NO FATALES (false): network, validation
  bool get isFatal {
    return switch (type) {
      AppErrorType.authentication ||
      AppErrorType.server ||
      AppErrorType.permission ||
      AppErrorType.unknown => true,
      
      AppErrorType.network ||
      AppErrorType.validation => false,
    };
  }

}
