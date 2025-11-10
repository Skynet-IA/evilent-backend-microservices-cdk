// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 APP COLORS - NUESTRO LABORATORIO DE ALQUIMIA CROMÁTICA
// ═══════════════════════════════════════════════════════════════════════════════
// 
// 🌈 ESTA CLASE ES COMO UN LABORATORIO DE COLORES MÁGICO DONDE:
// ┌─────────────────────────────────────────────────────────────────────────┐
// │ 🎭 Creamos la personalidad visual de EVILENT                            │
// │ 🔬 Definimos paletas científicamente equilibradas                       │
// │ 🌓 Preparamos colores para temas claro y oscuro                        │
// │ ♿ Garantizamos accesibilidad con contrastes perfectos                   │
// └─────────────────────────────────────────────────────────────────────────┘
//
// 🔥 FILOSOFÍA DE COLORES DE EVILENT:
// • 💙 AZUL: Confianza, tecnología, profesionalismo
// • 🌿 VERDE: Éxito, crecimiento, sostenibilidad  
// • 🔥 ROJO: Urgencia, error, pasión
// • ⚫ NEUTROS: Elegancia, legibilidad, versatilidad
//
// 🛠️ CÓMO USAR:
// Container(
//   color: AppColors.primary,
//   child: Text('Hola', style: TextStyle(color: AppColors.onPrimary)),
// )
// ═══════════════════════════════════════════════════════════════════════════════

import 'package:flutter/material.dart';

abstract class AppColors {
  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 👑 COLORES PRIMARIOS - LA CORONA DE EVILENT                             │
  // └─────────────────────────────────────────────────────────────────────────┘
  //
  // 💙 FAMILIA AZUL PRINCIPAL - Inspirada en la confianza digital
  // Estos azules transmiten profesionalismo, tecnología y confiabilidad
  
  /// 🔵 AZUL PRINCIPAL - El corazón de la marca EVILENT
  /// 🎯 Uso: Botones principales, AppBar, elementos hero, CTA primarios
  /// 📱 Compatible: Excelente en ambos temas, contraste AAA con blanco
  static const Color primary = Color(0xFF0066CC);
  
  /// 🔷 AZUL INTENSO - Versión más profunda y dramática
  /// 🎯 Uso: Estados hover/pressed, variantes de acento, sombras coloreadas
  /// 📱 Compatible: Perfecto para interacciones, maintaining brand consistency
  static const Color primaryDark = Color(0xFF004499);
  
  /// 💠 AZUL CIELO - Versión suave y ethereal
  /// 🎯 Uso: Fondos sutiles, highlights, estados disabled suaves
  /// 📱 Compatible: Ideal para superficies secundarias, overlays
  static const Color primaryLight = Color(0xFF66A3FF);
  
  /// 🌊 AZUL EXTRA CLARO - Para superficies delicadas
  /// 🎯 Uso: Backgrounds de notificaciones, chips, badges informativos
  /// 📱 Compatible: Contraste suave, perfecto para información contextual
  static const Color primarySurface = Color(0xFFE3F2FF);
  
  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 🌟 COLORES SECUNDARIOS - LOS COMPAÑEROS DE VIAJE                        │
  // └─────────────────────────────────────────────────────────────────────────┘
  //
  // 🌿 FAMILIA VERDE - Representa crecimiento y éxito
  // 🔥 FAMILIA NARANJA - Para energía y llamadas a la acción
  
  /// 💚 VERDE CRECIMIENTO - Para éxito y progreso
  /// 🎯 Uso: Botones secundarios, indicadores de éxito, progress bars completos
  /// 📱 Compatible: Excelente legibilidad, asociación positiva universal
  static const Color secondary = Color(0xFF66BB6A);
  
  /// 🌱 VERDE BOSQUE - Versión más rica y madura
  /// 🎯 Uso: Estados hover del verde, texto sobre fondos claros verdes
  /// 📱 Compatible: Mantiene la cohesión con el verde principal
  static const Color secondaryDark = Color(0xFF4CAF50);
  
  /// 🧡 NARANJA ENERGÍA - Para destacar sin competir
  /// 🎯 Uso: Badges de notificación, elementos que requieren atención inmediata
  /// 📱 Compatible: Alto contraste, perfecto para alerts y warnings amigables
  static const Color accent = Color(0xFFFF9800);
  
  /// 🔸 NARANJA SUAVE - Para contextos más sutiles
  /// 🎯 Uso: Iconos de advertencia, fondos de chips informativos
  /// 📱 Compatible: Versión suavizada para UI menos dramática
  static const Color accentLight = Color(0xFFFFCC02);
  
  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ ⚫ ESCALA DE NEUTROS - LA COLUMNA VERTEBRAL VISUAL                       │
  // └─────────────────────────────────────────────────────────────────────────┘
  //
  // 🎨 SISTEMA TONAL COMPLETO (50-950):
  // Basado en Material Design 3 con refinamientos para EVILENT
  
  /// ⚪ BLANCO PURO - La base de todo
  /// 🎯 Uso: Fondos principales tema claro, texto sobre fondos oscuros
  /// 📱 Compatible: Base universal, máximo contraste con negro
  static const Color white = Color(0xFFFFFFFF);
  
  /// ❄️ GRIS NIEVE - Sutilmente diferente del blanco puro
  /// 🎯 Uso: Fondos de pantalla tema claro, separación visual sutil
  /// 📱 Compatible: Reduce fatiga visual vs blanco puro
  static const Color grey50 = Color(0xFFFAFAFA);
  
  /// ☁️ GRIS NUBE - Para superficies secundarias
  /// 🎯 Uso: Cards en tema claro, fondos de secciones, separadores
  /// 📱 Compatible: Excelente para jerarquía visual
  static const Color grey100 = Color(0xFFF5F5F5);
  
  /// 🌫️ GRIS NIEBLA - Bordes y divisores
  /// 🎯 Uso: Borders de TextField, divisores entre secciones
  /// 📱 Compatible: Visible pero no intrusivo
  static const Color grey200 = Color(0xFFEEEEEE);
  
  /// 🌪️ GRIS TORMENTA - Para elementos deshabilitados
  /// 🎯 Uso: Texto disabled, iconos inactivos, placeholders
  /// 📱 Compatible: Indica claramente estados inactivos
  static const Color grey400 = Color(0xFFBDBDBD);
  
  /// 🪨 GRIS PIEDRA - Texto secundario
  /// 🎯 Uso: Subtítulos, descripciones, metadatos, iconos secundarios
  /// 📱 Compatible: Buena legibilidad sin competir con texto principal
  static const Color grey500 = Color(0xFF9E9E9E);
  
  /// ⚫ GRIS CARBÓN - Para texto principal en tema claro
  /// 🎯 Uso: Texto principal, iconos importantes en tema claro
  /// 📱 Compatible: Contraste excelente con fondos claros
  static const Color grey700 = Color(0xFF616161);
  
  /// 🖤 GRIS ANTRACITA - Superficies tema oscuro
  /// 🎯 Uso: Cards en tema oscuro, superficies elevadas
  /// 📱 Compatible: Base sólida para modo nocturno
  static const Color grey800 = Color(0xFF424242);
  
  /// 🌃 GRIS MEDIANOCHE - Fondos principales tema oscuro
  /// 🎯 Uso: Scaffold background modo oscuro, base de la aplicación nocturna
  /// 📱 Compatible: Reduce fatiga visual, ahorra batería en OLED
  static const Color grey900 = Color(0xFF212121);
  
  /// ⚫ NEGRO ABSOLUTO - Para máximo contraste
  /// 🎯 Uso: Texto principal en tema claro, elementos gráficos definidos
  /// 📱 Compatible: Máximo contraste, use con moderación
  static const Color black = Color(0xFF000000);
  
  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 🚦 COLORES SEMÁNTICOS - LENGUAJE VISUAL UNIVERSAL                       │
  // └─────────────────────────────────────────────────────────────────────────┘
  //
  // 🎭 COLORES QUE HABLAN SIN PALABRAS:
  // Utilizamos la psicología del color para comunicación instantánea
  
  /// ✅ VERDE ÉXITO - "¡Todo salió bien!"
  /// 🎯 Uso: Mensajes de éxito, checkmarks, indicadores positivos
  /// 📱 Compatible: Color universalmente asociado con éxito
  /// 🔗 Contraste: AAA con blanco, AA con gris claro
  static const Color success = Color(0xFF4CAF50);
  
  /// 🌿 VERDE ÉXITO CLARO - Para fondos de éxito
  /// 🎯 Uso: Backgrounds de snackbars de éxito, overlays positivos
  /// 📱 Compatible: Suave pero claramente positivo
  static const Color successLight = Color(0xFFE8F5E8);
  
  /// ⚠️ ÁMBAR ADVERTENCIA - "Presta atención"
  /// 🎯 Uso: Advertencias, estados pendientes, información importante
  /// 📱 Compatible: Llama la atención sin ser alarmante
  /// 🔗 Contraste: AAA con negro, cuidado con fondos claros
  static const Color warning = Color(0xFFFFC107);
  
  /// 🌻 ÁMBAR ADVERTENCIA CLARO - Para fondos de advertencia
  /// 🎯 Uso: Backgrounds de alerts de advertencia, highlights de precaución
  /// 📱 Compatible: Visible pero no agresivo
  static const Color warningLight = Color(0xFFFFF8E1);
  
  /// ❌ ROJO ERROR - "Algo está mal"
  /// 🎯 Uso: Errores, validaciones fallidas, acciones destructivas
  /// 📱 Compatible: Color universalmente asociado con error/peligro
  /// 🔗 Contraste: AAA con blanco, perfecto para textos de error
  static const Color error = Color(0xFFF44336);
  
  /// 🌹 ROJO ERROR CLARO - Para fondos de error
  /// 🎯 Uso: Backgrounds de snackbars de error, overlays de problema
  /// 📱 Compatible: Alerta sin ser abrumador
  static const Color errorLight = Color(0xFFFFEBEE);
  
  /// ℹ️ AZUL INFORMACIÓN - "Aquí tienes información útil"
  /// 🎯 Uso: Tooltips, mensajes informativos, ayuda contextual
  /// 📱 Compatible: Neutral y profesional, no competitivo
  /// 🔗 Contraste: Excelente legibilidad en la mayoría de fondos
  static const Color info = Color(0xFF2196F3);
  
  /// 💠 AZUL INFORMACIÓN CLARO - Para fondos informativos
  /// 🎯 Uso: Backgrounds de tooltips, overlays educativos
  /// 📱 Compatible: Suave y educativo
  static const Color infoLight = Color(0xFFE3F2FD);
  
  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 🌈 COLORES ESPECIALES - PARA MOMENTOS ÚNICOS                            │
  // └─────────────────────────────────────────────────────────────────────────┘
  
  /// 💜 PÚRPURA PREMIUM - Para elementos VIP o premium
  /// 🎯 Uso: Badges premium, características especiales, elementos destacados
  /// 📱 Compatible: Elegante y diferenciador
  static const Color premium = Color(0xFF9C27B0);
  
  /// 🌸 ROSA ESPECIAL - Para elementos femeninos o suaves
  /// 🎯 Uso: Elementos de categorías específicas, toques especiales
  /// 📱 Compatible: Suave pero distintivo
  static const Color special = Color(0xFFE91E63);
  
  /// 🖤 TRANSPARENTE - Para overlays y efectos
  /// 🎯 Uso: Overlays de modal, efectos de transición
  /// 📱 Compatible: Universal para efectos
  static const Color transparent = Colors.transparent;
  
  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 🎪 UTILIDADES DE COLOR - HELPERS INTELIGENTES                           │
  // └─────────────────────────────────────────────────────────────────────────┘
  
  /// 📊 Función para obtener color con opacidad específica
  /// 💡 Uso: AppColors.withOpacity(AppColors.primary, 0.1)
  static Color withOpacity(Color color, double opacity) {
    return color.withOpacity(opacity);
  }
  
  /// 🌗 Función para determinar si un color es oscuro
  /// 💡 Uso: if (AppColors.isDark(myColor)) { /* usar texto blanco */ }
  static bool isDark(Color color) {
    return color.computeLuminance() < 0.5;
  }
  
  /// ⚡ Función para obtener color de texto apropiado
  /// 💡 Uso: Text('Hola', style: TextStyle(color: AppColors.getTextColor(backgroundColor)))
  static Color getTextColor(Color backgroundColor) {
    return isDark(backgroundColor) ? white : black;
  }
  
  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 🎨 PALETAS PREDEFINIDAS - COMBINACIONES ARMONIOSAS                      │
  // └─────────────────────────────────────────────────────────────────────────┘
  
  /// 🌅 Paleta para onboarding y bienvenida
  static const List<Color> onboardingGradient = [
    Color(0xFF0066CC),
    Color(0xFF66A3FF),
    Color(0xFFE3F2FF),
  ];
  
  /// 💼 Paleta profesional para dashboards
  static const List<Color> businessPalette = [
    primary,
    secondary,
    grey700,
    grey100,
  ];
  
  /// 🌈 Paleta de estado completa
  static const Map<String, Color> statusColors = {
    'success': success,
    'warning': warning,
    'error': error,
    'info': info,
  };
}