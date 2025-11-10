// ═══════════════════════════════════════════════════════════════════════════════
// 📐 APP DIMENSIONS - NUESTRO ARQUITECTO DE ESPACIOS Y MEDIDAS
// ═══════════════════════════════════════════════════════════════════════════════
// 
// 🏗️ ESTA CLASE ES COMO UN ARQUITECTO DIGITAL QUE DEFINE:
// ┌─────────────────────────────────────────────────────────────────────────┐
// │ 📏 Todas las medidas y espacios de nuestra aplicación                   │
// │ 🎯 Sistema robusto y escalable sin dependencias externas                │
// │ ⚡ Performance optimizada con valores constantes                         │
// │ 🔧 Fácil mantenimiento centralizado                                      │
// └─────────────────────────────────────────────────────────────────────────┘
//
// 🎨 VENTAJAS DE ESTE SISTEMA:
// • ✨ CONSISTENCIA: Mismos espacios en toda la app
// • 🔄 MANTENIBILIDAD: Un cambio aquí afecta toda la app
// • 📱 ESCALABILIDAD: Fácil agregar nuevas medidas
// • 🚀 PERFORMANCE: Sin cálculos dinámicos innecesarios
//
// 🛠️ CÓMO USAR:
// Container(
//   margin: EdgeInsets.all(AppDimens.spacingMedium),
//   padding: EdgeInsets.symmetric(
//     horizontal: AppDimens.spacingLarge,
//     vertical: AppDimens.spacingSmall,
//   ),
// )
// ═══════════════════════════════════════════════════════════════════════════════

import 'package:flutter/material.dart';

abstract class AppDimens {
  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 🔤 SISTEMA DE TIPOGRAFÍA - TAMAÑOS DE FUENTE PROFESIONALES              │
  // └─────────────────────────────────────────────────────────────────────────┘
  // 
  // 📚 JERARQUÍA TIPOGRÁFICA BASADA EN MATERIAL DESIGN 3:
  // Cada tamaño tiene un propósito específico y probado por Google
  
  /// 🔹 MICRO TEXT - Para disclaimers, copyright, metadatos
  /// 💡 Uso: Text('© 2024 EVILENT', style: TextStyle(fontSize: AppDimens.fontMicro))
  static const double fontMicro = 10.0;
  
  /// 📝 CAPTION - Para textos auxiliares, fechas, contadores
  /// 💡 Uso: Text('Hace 2 horas', style: TextStyle(fontSize: AppDimens.fontCaption))
  static const double fontCaption = 12.0;
  
  /// 📄 BODY - Para texto principal, párrafos, descripciones
  /// 💡 Uso: Text('Descripción del producto...', style: TextStyle(fontSize: AppDimens.fontBody))
  static const double fontBody = 14.0;
  
  /// 🎯 MEDIUM - Para subtítulos importantes, texto en botones
  /// 💡 Uso: ElevatedButton(child: Text('Confirmar', style: TextStyle(fontSize: AppDimens.fontMedium)))
  static const double fontMedium = 16.0;
  
  /// 📋 LARGE - Para títulos de sección, headers de cards
  /// 💡 Uso: Text('Mi Perfil', style: TextStyle(fontSize: AppDimens.fontLarge))
  static const double fontLarge = 18.0;
  
  /// 🏷️ TITLE - Para títulos de pantalla, nombres de sección
  /// 💡 Uso: AppBar(title: Text('Configuración', style: TextStyle(fontSize: AppDimens.fontTitle)))
  static const double fontTitle = 20.0;
  
  /// 🎪 HEADLINE - Para títulos principales, hero text
  /// 💡 Uso: Text('¡Bienvenido!', style: TextStyle(fontSize: AppDimens.fontHeadline))
  static const double fontHeadline = 24.0;
  
  /// 🎊 DISPLAY - Para números grandes, texto hero
  /// 💡 Uso: Text('$1,250', style: TextStyle(fontSize: AppDimens.fontDisplay))
  static const double fontDisplay = 28.0;
  
  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 📏 SISTEMA DE ESPACIADO - CONSISTENT SPACING SCALE                      │
  // └─────────────────────────────────────────────────────────────────────────┘
  //
  // 🎨 ESCALA BASADA EN MÚLTIPLOS DE 4 (DISEÑO MODULAR):
  // Permite alineación perfecta y armonía visual
  
  /// 🔸 TINY - Para ajustes micro, separaciones mínimas
  /// 💡 Uso: SizedBox(width: AppDimens.spacingTiny) entre icono y texto
  static const double spacingTiny = 2.0;
  
  /// 🔹 EXTRA SMALL - Para espacios muy pequeños
  /// 💡 Uso: Padding entre elementos muy cercanos
  static const double spacingXS = 4.0;
  
  /// 📌 SMALL - Para separaciones pequeñas pero visibles
  /// 💡 Uso: Row(children: [Icon(), SizedBox(width: AppDimens.spacingSmall), Text()])
  static const double spacingSmall = 8.0;
  
  /// 📍 MEDIUM - EL MÁS USADO - espaciado estándar
  /// 💡 Uso: Container(padding: EdgeInsets.all(AppDimens.spacingMedium))
  static const double spacingMedium = 16.0;
  
  /// 📎 LARGE - Para separar secciones importantes
  /// 💡 Uso: Column(children: [Widget1(), SizedBox(height: AppDimens.spacingLarge), Widget2()])
  static const double spacingLarge = 24.0;
  
  /// 📋 EXTRA LARGE - Para separaciones muy amplias
  /// 💡 Uso: Padding en pantallas principales, márgenes de contenido
  static const double spacingXL = 32.0;
  
  /// 🎪 HUGE - Para espacios dramáticos, landing pages
  /// 💡 Uso: Espaciado en pantallas de onboarding, separadores principales
  static const double spacingHuge = 48.0;
  
  /// 🎊 MASSIVE - Para espacios heroicos
  /// 💡 Uso: Headers de pantalla, espaciado en pantallas vacías
  static const double spacingMassive = 64.0;
  
  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 🎨 SISTEMA DE BORDES Y FORMAS - BORDER RADIUS SCALE                     │
  // └─────────────────────────────────────────────────────────────────────────┘
  //
  // 🔄 PROGRESIÓN SUAVE DE REDONDEZ:
  // Desde elementos sharp hasta completamente redondeados
  
  /// ⬜ NONE - Sin bordes redondeados (sharp)
  /// 💡 Uso: Container con esquinas rectas, elementos geométricos
  static const double radiusNone = 0.0;
  
  /// 🔸 SMALL - Redondez sutil, moderna
  /// 💡 Uso: TextField, Cards pequeñas, elementos UI básicos
  static const double radiusSmall = 4.0;
  
  /// 🔹 MEDIUM - El radio estándar de la app
  /// 💡 Uso: Botones, Cards principales, Containers importantes
  static const double radiusMedium = 8.0;
  
  /// 🎯 LARGE - Para elementos destacados
  /// 💡 Uso: Modals, Sheets, elementos que necesitan suavidad extra
  static const double radiusLarge = 12.0;
  
  /// 🎪 EXTRA LARGE - Para elementos muy suaves
  /// 💡 Uso: Avatares cuadrados, elementos decorativos
  static const double radiusXL = 16.0;
  
  /// 🎊 HUGE - Para efectos especiales
  /// 💡 Uso: Elementos hero, componentes con mucha personalidad
  static const double radiusHuge = 24.0;
  
  /// ⭕ CIRCULAR - Para elementos completamente redondos
  /// 💡 Uso: math.max(width, height) / 2 para círculos perfectos
  static const double radiusCircular = 999.0;
  
  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 🎯 ELEMENTOS UI ESPECÍFICOS - COMPONENT SIZES                           │
  // └─────────────────────────────────────────────────────────────────────────┘
  
  /// 🔘 ALTURAS ESTÁNDAR PARA ELEMENTOS INTERACTIVOS
  static const double buttonHeightSmall = 32.0;   // Botones compactos
  static const double buttonHeightMedium = 40.0;  // Botones estándar  
  static const double buttonHeightLarge = 48.0;   // Botones prominentes
  static const double inputHeight = 48.0;         // TextFields estándar
  static const double appBarHeight = 56.0;        // AppBar recomendada
  
  /// 📱 ANCHOS COMUNES PARA LAYOUTS
  static const double maxContentWidth = 600.0;    // Ancho máximo de contenido
  static const double sidebarWidth = 280.0;       // Sidebar en tablet/desktop
  static const double fabSize = 56.0;             // FloatingActionButton
  
  /// 🎨 ICONOS Y ELEMENTOS VISUALES
  static const double iconSizeSmall = 16.0;       // Iconos pequeños
  static const double iconSizeMedium = 24.0;      // Iconos estándar
  static const double iconSizeLarge = 32.0;       // Iconos grandes
  static const double avatarSizeSmall = 32.0;     // Avatar pequeño
  static const double avatarSizeMedium = 48.0;    // Avatar estándar
  static const double avatarSizeLarge = 72.0;     // Avatar grande
  
  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 🎪 UTILIDADES HELPER - FUNCIONES CONVENIENTES                           │
  // └─────────────────────────────────────────────────────────────────────────┘
  
  /// 🔧 EdgeInsets predefinidos para uso rápido
  static const EdgeInsets paddingTiny = EdgeInsets.all(spacingTiny);
  static const EdgeInsets paddingXS = EdgeInsets.all(spacingXS);
  static const EdgeInsets paddingSmall = EdgeInsets.all(spacingSmall);
  static const EdgeInsets paddingMedium = EdgeInsets.all(spacingMedium);
  static const EdgeInsets paddingLarge = EdgeInsets.all(spacingLarge);
  static const EdgeInsets paddingXL = EdgeInsets.all(spacingXL);
  
  /// 🔧 EdgeInsets horizontales y verticales
  static const EdgeInsets paddingHorizontalSmall = EdgeInsets.symmetric(horizontal: spacingSmall);
  static const EdgeInsets paddingHorizontalMedium = EdgeInsets.symmetric(horizontal: spacingMedium);
  static const EdgeInsets paddingHorizontalLarge = EdgeInsets.symmetric(horizontal: spacingLarge);
  
  static const EdgeInsets paddingVerticalSmall = EdgeInsets.symmetric(vertical: spacingSmall);
  static const EdgeInsets paddingVerticalMedium = EdgeInsets.symmetric(vertical: spacingMedium);
  static const EdgeInsets paddingVerticalLarge = EdgeInsets.symmetric(vertical: spacingLarge);
}