// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 SISTEMA DE ERRORES - LOGGING CENTRALIZADO
// ═══════════════════════════════════════════════════════════════════════════════
// 
// 🎯 PROPÓSITO:
// Registro centralizado de errores en consola. Punto único de logging.
//
// 📋 FUNCIONALIDAD:
// • logAndReport() - Registra errores en consola con formato detallado
//
// 🔗 ARQUITECTURA:
// ┌──────────────┐
// │   main.dart  │ ← Captura errores globales
// └──────┬───────┘
//        │ llama a
//        ▼
// ┌──────────────┐
// │ ErrorUtils   │ ← logAndReport() - Imprime en consola
// └──────┬───────┘
//        │ usa
//        ▼
// ┌──────────────┐
// │  AppError    │ ← Estructura del error
// └──────────────┘
//
// 📍 UBICACIÓN: /lib/error_system/core/
// 🔗 LLAMADO POR: main.dart (5 veces: líneas 58, 93, 108, 389, 401, 415)
// 🔗 USA: app_error.dart
// ═══════════════════════════════════════════════════════════════════════════════

import 'package:flutter/foundation.dart';
import 'app_error.dart';

class ErrorUtils {
  ErrorUtils._();

  /// Registra el error en consola con timestamp, tipo, mensaje, stack trace y contexto.
  /// Llamado desde los handlers globales en main.dart y desde catch blocks de la app.
  static void logAndReport(AppError error) {
    try {
      // 📝 Registro en consola con formato detallado
      debugPrint('🚨 ═══════════════════════════════════════════════════════════');
      debugPrint('🚨 [ERROR CAPTURADO] ${error.type.value.toUpperCase()}');
      debugPrint('🚨 ═══════════════════════════════════════════════════════════');
      debugPrint('⏰ Timestamp: ${error.timestamp}');
      debugPrint('💬 Mensaje: ${error.message}');
      debugPrint('🎯 Fatal: ${error.isFatal}');
      
      if (error.originalError != null) {
        debugPrint('🔧 Error Original: ${error.originalError}');
      }
      
      // 🔍 Información extendida en modo debug
      if (kDebugMode) {
        debugPrint('');
        debugPrint('🔍 ──── DEBUG INFO ────');
        debugPrint('📊 Tipo: ${error.type}');
        debugPrint('🏷️ Es Fatal: ${error.isFatal}');
        
        if (error.context != null && error.context!.isNotEmpty) {
          debugPrint('📋 Contexto: ${error.context}');
        }
        
        if (error.stackTrace != null) {
          debugPrint('');
          debugPrint('📍 ──── STACK TRACE ────');
          debugPrint('${error.stackTrace}');
        }
      }
      
      debugPrint('🚨 ═══════════════════════════════════════════════════════════');
      
    } catch (e) {
      // 🚨 Fallback: Si falla el logging, usar print básico
      debugPrint('🆘 [CRITICAL] No se pudo registrar el error: $e');
      debugPrint('🆘 [CRITICAL] Error type: ${error.type.value}');
      debugPrint('🆘 [CRITICAL] Error message: ${error.message}');
    }
  }
}
