// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 THEME EXTENSIONS - HERRAMIENTAS MÁGICAS PARA ACCESO RÁPIDO AL TEMA
// ═══════════════════════════════════════════════════════════════════════════════
// 
// ✨ ESTAS EXTENSIONES SON COMO VARITAS MÁGICAS QUE:
// ┌─────────────────────────────────────────────────────────────────────────┐
// │ 🎨 SIMPLIFICAN el acceso a colores y estilos del tema                   │
// │ ⚡ ACELERAN el desarrollo con getters intuitivos                         │
// │ 🛡️ PROPORCIONAN seguridad de tipos y autocompletado                     │
// │ 📚 MANTIENEN el código limpio y legible                                 │
// └─────────────────────────────────────────────────────────────────────────┘
//
// 🔥 TRANSFORMACIÓN MÁGICA:
// ❌ ANTES: Theme.of(context).colorScheme.primary
// ✅ AHORA: context.primaryColor
//
// ❌ ANTES: Theme.of(context).textTheme.headlineLarge
// ✅ AHORA: context.headlineLarge
//
// 🛠️ CÓMO USAR:
// Text('Hola', style: context.bodyLarge.copyWith(color: context.primaryColor))
// Container(color: context.surfaceColor, padding: context.paddingMedium)
// ═══════════════════════════════════════════════════════════════════════════════

import 'package:flutter/material.dart';
import 'package:evilent_app/core/utils/app_dimens.dart';

// ┌─────────────────────────────────────────────────────────────────────────┐
// │ 🎯 ENUMS Y TIPOS - DEFINICIONES PARA HELPERS                            │
// └─────────────────────────────────────────────────────────────────────────┘

/// 🎨 Variantes de botón para diferentes contextos
enum ButtonVariant {
  /// 🔵 Botón primario - Para acciones principales
  primary,
  
  /// 🟢 Botón secundario - Para acciones secundarias
  secondary,
  
  /// 🟠 Botón terciario - Para acciones terciarias
  tertiary,
  
  /// 🔴 Botón de error - Para acciones destructivas
  error,
  
  /// ⚪ Botón de superficie - Para acciones sutiles
  surface,
}

// ┌─────────────────────────────────────────────────────────────────────────┐
// │ 🎨 EXTENSIONES DE COLORES - ACCESO DIRECTO A LA PALETA                  │
// └─────────────────────────────────────────────────────────────────────────┘

/// 🌈 EXTENSIÓN DE COLORES PARA BuildContext
/// 
/// Proporciona acceso directo y tipo-seguro a todos los colores del tema actual.
/// Elimina la verbosidad de `Theme.of(context).colorScheme.nombreColor`
/// y proporciona nombres intuitivos y fáciles de recordar.
extension ThemeColorsExtension on BuildContext {
  // 👑 COLORES PRINCIPALES - La identidad visual de EVILENT
  
  /// 🔵 COLOR PRIMARIO - El azul característico de EVILENT
  /// Perfecto para: Botones principales, AppBar, elementos hero
  Color get primaryColor => Theme.of(this).colorScheme.primary;
  
  /// ⚪ COLOR SOBRE PRIMARIO - Texto/iconos sobre elementos primarios
  /// Perfecto para: Texto en botones primarios, iconos en AppBar
  Color get onPrimaryColor => Theme.of(this).colorScheme.onPrimary;
  
  /// 💙 CONTAINER PRIMARIO - Versión suave del color primario
  /// Perfecto para: Fondos de información, chips seleccionados
  Color get primaryContainerColor => Theme.of(this).colorScheme.primaryContainer;
  
  /// 🔷 TEXTO EN CONTAINER PRIMARIO - Texto sobre containers primarios
  /// Perfecto para: Texto en chips, contenido en containers primarios
  Color get onPrimaryContainerColor => Theme.of(this).colorScheme.onPrimaryContainer;
  
  // 🌟 COLORES SECUNDARIOS - Complementos perfectos
  
  /// 🟢 COLOR SECUNDARIO - El verde de éxito y crecimiento
  /// Perfecto para: Botones secundarios, indicadores de éxito
  Color get secondaryColor => Theme.of(this).colorScheme.secondary;
  
  /// ⚪ COLOR SOBRE SECUNDARIO - Texto/iconos sobre elementos secundarios
  /// Perfecto para: Texto en botones secundarios, iconos de éxito
  Color get onSecondaryColor => Theme.of(this).colorScheme.onSecondary;
  
  /// 💚 CONTAINER SECUNDARIO - Versión suave del color secundario
  /// Perfecto para: Fondos de éxito, notificaciones positivas
  Color get secondaryContainerColor => Theme.of(this).colorScheme.secondaryContainer;
  
  /// 🌿 TEXTO EN CONTAINER SECUNDARIO - Texto sobre containers secundarios
  Color get onSecondaryContainerColor => Theme.of(this).colorScheme.onSecondaryContainer;
  
  // ⚡ COLORES TERCIARIOS - Para destacar sin competir
  
  /// 🟠 COLOR TERCIARIO - El naranja energético de EVILENT
  /// Perfecto para: Badges, elementos que requieren atención
  Color get tertiaryColor => Theme.of(this).colorScheme.tertiary;
  
  /// ⚫ COLOR SOBRE TERCIARIO - Texto/iconos sobre elementos terciarios
  Color get onTertiaryColor => Theme.of(this).colorScheme.onTertiary;
  
  /// 🧡 CONTAINER TERCIARIO - Versión suave del color terciario
  /// Perfecto para: Fondos de advertencia amigables, tooltips
  Color get tertiaryContainerColor => Theme.of(this).colorScheme.tertiaryContainer;
  
  /// 🔸 TEXTO EN CONTAINER TERCIARIO - Texto sobre containers terciarios
  Color get onTertiaryContainerColor => Theme.of(this).colorScheme.onTertiaryContainer;
  
  // 🚨 COLORES DE ERROR - Para comunicar problemas
  
  /// 🔴 COLOR DE ERROR - El rojo que indica problemas
  /// Perfecto para: Mensajes de error, validaciones fallidas
  Color get errorColor => Theme.of(this).colorScheme.error;
  
  /// ⚪ COLOR SOBRE ERROR - Texto/iconos sobre elementos de error
  /// Perfecto para: Texto en botones de error, iconos de alerta
  Color get onErrorColor => Theme.of(this).colorScheme.onError;
  
  /// 🌹 CONTAINER DE ERROR - Versión suave del color de error
  /// Perfecto para: Fondos de mensajes de error, overlays de problema
  Color get errorContainerColor => Theme.of(this).colorScheme.errorContainer;
  
  /// ❌ TEXTO EN CONTAINER DE ERROR - Texto sobre containers de error
  Color get onErrorContainerColor => Theme.of(this).colorScheme.onErrorContainer;
  
  // 🏞️ SUPERFICIES Y FONDOS - La base de todo
  
  /// 🖼️ COLOR DE FONDO - El canvas principal de la aplicación
  /// Perfecto para: Scaffold background, fondo principal
  Color get backgroundColor => Theme.of(this).colorScheme.background;
  
  /// 📝 COLOR SOBRE FONDO - Texto/iconos sobre el fondo principal
  /// Perfecto para: Texto principal, iconos en el scaffold
  Color get onBackgroundColor => Theme.of(this).colorScheme.onBackground;
  
  /// 📄 COLOR DE SUPERFICIE - Para cards, sheets, dialogs
  /// Perfecto para: Fondos de Card, BottomSheet, Dialog
  Color get surfaceColor => Theme.of(this).colorScheme.surface;
  
  /// 🖋️ COLOR SOBRE SUPERFICIE - Texto/iconos sobre superficies
  /// Perfecto para: Texto en cards, contenido de dialogs
  Color get onSurfaceColor => Theme.of(this).colorScheme.onSurface;
  
  /// 📋 VARIANTE DE SUPERFICIE - Superficie alternativa
  /// Perfecto para: TextField backgrounds, elementos sutiles
  Color get surfaceVariantColor => Theme.of(this).colorScheme.surfaceVariant;
  
  /// 📱 COLOR SOBRE VARIANTE DE SUPERFICIE - Texto sobre superficie variante
  /// Perfecto para: Placeholder text, labels, hints
  Color get onSurfaceVariantColor => Theme.of(this).colorScheme.onSurfaceVariant;
  
  // 🖼️ ELEMENTOS DECORATIVOS - Detalles que marcan la diferencia
  
  /// ➖ COLOR DE OUTLINE - Para bordes y separadores
  /// Perfecto para: Bordes de TextField, Divider, separadores
  Color get outlineColor => Theme.of(this).colorScheme.outline;
  
  /// ➖ VARIANTE DE OUTLINE - Bordes más sutiles
  /// Perfecto para: Bordes menos prominentes, separadores suaves
  Color get outlineVariantColor => Theme.of(this).colorScheme.outlineVariant;
  
  /// 🌫️ COLOR DE SOMBRA - Para efectos de profundidad
  /// Perfecto para: Sombras de Card, efectos de elevación
  Color get shadowColor => Theme.of(this).colorScheme.shadow;
  
  /// 🎭 COLOR DE SCRIM - Para overlays modales
  /// Perfecto para: Overlays de Dialog, BottomSheet, modales
  Color get scrimColor => Theme.of(this).colorScheme.scrim;
  
  // 🔄 COLORES INVERTIDOS - Para contextos especiales
  
  /// 🔳 SUPERFICIE INVERTIDA - Opuesto a la superficie normal
  /// Perfecto para: SnackBar, Tooltip, elementos contrastantes
  Color get inverseSurfaceColor => Theme.of(this).colorScheme.inverseSurface;
  
  /// 🔲 COLOR SOBRE SUPERFICIE INVERTIDA - Texto sobre superficie invertida
  Color get onInverseSurfaceColor => Theme.of(this).colorScheme.onInverseSurface;
  
  /// 🔄 PRIMARIO INVERTIDO - Versión invertida del color primario
  /// Perfecto para: Links en SnackBar, acciones en contextos invertidos
  Color get inversePrimaryColor => Theme.of(this).colorScheme.inversePrimary;
  
  /// 🎨 TINTE DE SUPERFICIE - Para efectos de material tintado
  /// Perfecto para: Surface tinting en Material 3
  Color get surfaceTintColor => Theme.of(this).colorScheme.surfaceTint;
}

// ┌─────────────────────────────────────────────────────────────────────────┐
// │ 🔤 EXTENSIONES DE TEXTO - TIPOGRAFÍA AL ALCANCE DE TUS DEDOS            │
// └─────────────────────────────────────────────────────────────────────────┘

/// 📚 EXTENSIÓN DE TIPOGRAFÍA PARA BuildContext
/// 
/// Proporciona acceso directo a todos los estilos de texto del tema.
/// Elimina la verbosidad y hace el código más expresivo y mantenible.
extension ThemeTextExtension on BuildContext {
  // 🎪 DISPLAY STYLES - Para texto hero y números grandes
  
  /// 🎊 DISPLAY LARGE - El texto más grande y dramático
  /// Perfecto para: Pantallas de bienvenida, números destacados, hero text
  TextStyle get displayLarge => Theme.of(this).textTheme.displayLarge!;
  
  /// 🎪 DISPLAY MEDIUM - Texto grande pero controlado
  /// Perfecto para: Títulos de sección principales, destacados importantes
  TextStyle get displayMedium => Theme.of(this).textTheme.displayMedium!;
  
  /// 🎯 DISPLAY SMALL - Texto grande para contextos específicos
  /// Perfecto para: Subtítulos importantes, números en dashboards
  TextStyle get displaySmall => Theme.of(this).textTheme.displaySmall!;
  
  // 🏷️ HEADLINE STYLES - Para títulos y headers
  
  /// 👑 HEADLINE LARGE - Títulos principales de pantalla
  /// Perfecto para: Títulos de AppBar, headers de pantalla principales
  TextStyle get headlineLarge => Theme.of(this).textTheme.headlineLarge!;
  
  /// 📋 HEADLINE MEDIUM - Títulos de sección importantes
  /// Perfecto para: Títulos de Card, headers de formularios
  TextStyle get headlineMedium => Theme.of(this).textTheme.headlineMedium!;
  
  /// 📝 HEADLINE SMALL - Títulos de subsección
  /// Perfecto para: Títulos de grupos, headers de listas
  TextStyle get headlineSmall => Theme.of(this).textTheme.headlineSmall!;
  
  // 📋 TITLE STYLES - Para títulos de contenido
  
  /// 🎯 TITLE LARGE - Títulos prominentes pero no dominantes
  /// Perfecto para: Nombres de pantalla, títulos de modal
  TextStyle get titleLarge => Theme.of(this).textTheme.titleLarge!;
  
  /// 📄 TITLE MEDIUM - Títulos estándar de contenido
  /// Perfecto para: Títulos de ListTile, nombres de items
  TextStyle get titleMedium => Theme.of(this).textTheme.titleMedium!;
  
  /// 🏷️ TITLE SMALL - Títulos compactos
  /// Perfecto para: Títulos de chips, labels importantes
  TextStyle get titleSmall => Theme.of(this).textTheme.titleSmall!;
  
  // 📄 BODY STYLES - Para el contenido principal
  
  /// 📖 BODY LARGE - Texto principal prominente
  /// Perfecto para: Párrafos importantes, contenido destacado
  TextStyle get bodyLarge => Theme.of(this).textTheme.bodyLarge!;
  
  /// 📝 BODY MEDIUM - Texto estándar de la aplicación
  /// Perfecto para: Texto general, descripciones, contenido normal
  TextStyle get bodyMedium => Theme.of(this).textTheme.bodyMedium!;
  
  /// 📄 BODY SMALL - Texto secundario pero legible
  /// Perfecto para: Texto auxiliar, notas, información adicional
  TextStyle get bodySmall => Theme.of(this).textTheme.bodySmall!;
  
  // 🏷️ LABEL STYLES - Para etiquetas y elementos interactivos
  
  /// 🔘 LABEL LARGE - Etiquetas prominentes
  /// Perfecto para: Texto en botones grandes, tabs importantes
  TextStyle get labelLarge => Theme.of(this).textTheme.labelLarge!;
  
  /// 📌 LABEL MEDIUM - Etiquetas estándar
  /// Perfecto para: Texto en botones normales, labels de campos
  TextStyle get labelMedium => Theme.of(this).textTheme.labelMedium!;
  
  /// 🏷️ LABEL SMALL - Etiquetas compactas
  /// Perfecto para: Texto en chips, badges, elementos pequeños
  TextStyle get labelSmall => Theme.of(this).textTheme.labelSmall!;
}

// ┌─────────────────────────────────────────────────────────────────────────┐
// │ 📏 EXTENSIONES DE DIMENSIONES - ESPACIADO INTELIGENTE                   │
// └─────────────────────────────────────────────────────────────────────────┘

/// 📐 EXTENSIÓN DE DIMENSIONES PARA BuildContext
/// 
/// Proporciona acceso directo a todas las dimensiones de AppDimens
/// con nombres más cortos y contextuales para mayor productividad.
extension ThemeDimensExtension on BuildContext {
  // 📏 ESPACIADOS - Para margins y paddings perfectos
  
  /// 🔸 ESPACIADO TINY - Para ajustes micro
  double get spacingTiny => AppDimens.spacingTiny;
  
  /// 🔹 ESPACIADO EXTRA SMALL - Para separaciones mínimas
  double get spacingXS => AppDimens.spacingXS;
  
  /// 📌 ESPACIADO SMALL - Para elementos cercanos
  double get spacingSmall => AppDimens.spacingSmall;
  
  /// 📍 ESPACIADO MEDIUM - El más usado en la app
  double get spacingMedium => AppDimens.spacingMedium;
  
  /// 📎 ESPACIADO LARGE - Para separar secciones
  double get spacingLarge => AppDimens.spacingLarge;
  
  /// 📋 ESPACIADO EXTRA LARGE - Para márgenes amplios
  double get spacingXL => AppDimens.spacingXL;
  
  /// 🎪 ESPACIADO HUGE - Para espacios dramáticos
  double get spacingHuge => AppDimens.spacingHuge;
  
  /// 🎊 ESPACIADO MASSIVE - Para espacios heroicos
  double get spacingMassive => AppDimens.spacingMassive;
  
  // 🎨 RADIOS - Para bordes redondeados consistentes
  
  /// ⬜ RADIO NONE - Sin redondez
  double get radiusNone => AppDimens.radiusNone;
  
  /// 🔸 RADIO SMALL - Redondez sutil
  double get radiusSmall => AppDimens.radiusSmall;
  
  /// 🔹 RADIO MEDIUM - Redondez estándar
  double get radiusMedium => AppDimens.radiusMedium;
  
  /// 🎯 RADIO LARGE - Redondez prominente
  double get radiusLarge => AppDimens.radiusLarge;
  
  /// 🎪 RADIO EXTRA LARGE - Muy redondeado
  double get radiusXL => AppDimens.radiusXL;
  
  /// 🎊 RADIO HUGE - Extremadamente redondeado
  double get radiusHuge => AppDimens.radiusHuge;
  
  /// ⭕ RADIO CIRCULAR - Completamente redondo
  double get radiusCircular => AppDimens.radiusCircular;
  
  // 🎯 TAMAÑOS DE ELEMENTOS - Para componentes específicos
  
  /// 🔘 ALTURA DE BOTÓN SMALL - Botones compactos
  double get buttonHeightSmall => AppDimens.buttonHeightSmall;
  
  /// 🔘 ALTURA DE BOTÓN MEDIUM - Botones estándar
  double get buttonHeightMedium => AppDimens.buttonHeightMedium;
  
  /// 🔘 ALTURA DE BOTÓN LARGE - Botones prominentes
  double get buttonHeightLarge => AppDimens.buttonHeightLarge;
  
  /// ✏️ ALTURA DE INPUT - TextFields estándar
  double get inputHeight => AppDimens.inputHeight;
  
  /// 📱 ALTURA DE APP BAR - AppBar recomendada
  double get appBarHeight => AppDimens.appBarHeight;
  
  // 🎨 TAMAÑOS DE ICONOS - Para elementos visuales
  
  /// 🔸 ICONO SMALL - Iconos pequeños
  double get iconSizeSmall => AppDimens.iconSizeSmall;
  
  /// 🔹 ICONO MEDIUM - Iconos estándar
  double get iconSizeMedium => AppDimens.iconSizeMedium;
  
  /// 🎯 ICONO LARGE - Iconos grandes
  double get iconSizeLarge => AppDimens.iconSizeLarge;
  
  /// 👤 AVATAR SMALL - Avatar pequeño
  double get avatarSizeSmall => AppDimens.avatarSizeSmall;
  
  /// 👤 AVATAR MEDIUM - Avatar estándar
  double get avatarSizeMedium => AppDimens.avatarSizeMedium;
  
  /// 👤 AVATAR LARGE - Avatar grande
  double get avatarSizeLarge => AppDimens.avatarSizeLarge;
  
  // 🔧 PADDINGS PREDEFINIDOS - EdgeInsets listos para usar
  
  /// 🔸 PADDING TINY - Mínimo padding
  EdgeInsets get paddingTiny => AppDimens.paddingTiny;
  
  /// 🔹 PADDING EXTRA SMALL - Padding muy pequeño
  EdgeInsets get paddingXS => AppDimens.paddingXS;
  
  /// 📌 PADDING SMALL - Padding pequeño
  EdgeInsets get paddingSmall => AppDimens.paddingSmall;
  
  /// 📍 PADDING MEDIUM - Padding estándar
  EdgeInsets get paddingMedium => AppDimens.paddingMedium;
  
  /// 📎 PADDING LARGE - Padding amplio
  EdgeInsets get paddingLarge => AppDimens.paddingLarge;
  
  /// 📋 PADDING EXTRA LARGE - Padding muy amplio
  EdgeInsets get paddingXL => AppDimens.paddingXL;
  
  // 🔧 PADDINGS DIRECCIONALES - Para layouts específicos
  
  /// ↔️ PADDING HORIZONTAL SMALL - Solo horizontal pequeño
  EdgeInsets get paddingHorizontalSmall => AppDimens.paddingHorizontalSmall;
  
  /// ↔️ PADDING HORIZONTAL MEDIUM - Solo horizontal medio
  EdgeInsets get paddingHorizontalMedium => AppDimens.paddingHorizontalMedium;
  
  /// ↔️ PADDING HORIZONTAL LARGE - Solo horizontal grande
  EdgeInsets get paddingHorizontalLarge => AppDimens.paddingHorizontalLarge;
  
  /// ↕️ PADDING VERTICAL SMALL - Solo vertical pequeño
  EdgeInsets get paddingVerticalSmall => AppDimens.paddingVerticalSmall;
  
  /// ↕️ PADDING VERTICAL MEDIUM - Solo vertical medio
  EdgeInsets get paddingVerticalMedium => AppDimens.paddingVerticalMedium;
  
  /// ↕️ PADDING VERTICAL LARGE - Solo vertical grande
  EdgeInsets get paddingVerticalLarge => AppDimens.paddingVerticalLarge;
}

// ┌─────────────────────────────────────────────────────────────────────────┐
// │ 🌓 EXTENSIONES DE ESTADO DEL TEMA - INFORMACIÓN CONTEXTUAL              │
// └─────────────────────────────────────────────────────────────────────────┘

/// 🎭 EXTENSIÓN DE ESTADO DEL TEMA PARA BuildContext
/// 
/// Proporciona información útil sobre el estado actual del tema
/// para tomar decisiones inteligentes en la UI.
extension ThemeStateExtension on BuildContext {
  /// 🌓 ¿ESTÁ EN MODO OSCURO? - Detector del tema actual
  /// 
  /// Retorna true si actualmente se está mostrando el tema oscuro.
  /// Útil para: Cambiar iconos, ajustar colores, lógica condicional.
  /// 
  /// Ejemplo:
  /// ```dart
  /// Icon(context.isDarkMode ? Icons.light_mode : Icons.dark_mode)
  /// ```
  bool get isDarkMode => Theme.of(this).brightness == Brightness.dark;
  
  /// ☀️ ¿ESTÁ EN MODO CLARO? - Detector del tema claro
  /// 
  /// Retorna true si actualmente se está mostrando el tema claro.
  /// Útil para: Lógica inversa, condiciones específicas del tema claro.
  bool get isLightMode => Theme.of(this).brightness == Brightness.light;
  
  /// 🎨 BRILLO ACTUAL - El Brightness del tema actual
  /// 
  /// Retorna el Brightness actual (light o dark).
  /// Útil para: Comparaciones, switches, lógica más compleja.
  Brightness get currentBrightness => Theme.of(this).brightness;
  
  /// 🔍 ¿USANDO MATERIAL 3? - Detector de versión de Material Design
  /// 
  /// Retorna true si el tema está usando Material Design 3.
  /// Útil para: Lógica condicional, fallbacks, debugging.
  bool get useMaterial3 => Theme.of(this).useMaterial3;
}

// ┌─────────────────────────────────────────────────────────────────────────┐
// │ 🚀 EXTENSIONES DE UTILIDADES - HELPERS PARA CASOS COMUNES              │
// └─────────────────────────────────────────────────────────────────────────┘

/// 🛠️ EXTENSIÓN DE UTILIDADES DE TEMA PARA BuildContext
/// 
/// Proporciona métodos helper para casos de uso comunes
/// que combinan múltiples aspectos del tema.
extension ThemeUtilsExtension on BuildContext {
  /// 🎨 CONTAINER CON TEMA - Container pre-configurado con el tema
  /// 
  /// Crea un Container con estilos consistentes del tema actual.
  /// Parámetros opcionales para personalización rápida.
  /// 
  /// Ejemplo:
  /// ```dart
  /// context.themedContainer(
  ///   child: Text('Hola'),
  ///   padding: context.paddingMedium,
  /// )
  /// ```
  Container themedContainer({
    Widget? child,
    EdgeInsetsGeometry? padding,
    EdgeInsetsGeometry? margin,
    double? borderRadius,
    Color? backgroundColor,
    bool elevated = false,
  }) {
    return Container(
      padding: padding ?? paddingMedium,
      margin: margin,
      decoration: BoxDecoration(
        color: backgroundColor ?? surfaceColor,
        borderRadius: BorderRadius.circular(borderRadius ?? radiusMedium),
        boxShadow: elevated ? [
          BoxShadow(
            color: shadowColor.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ] : null,
      ),
      child: child,
    );
  }
  
  /// 🌈 CONTAINER CON GRADIENTE - Container con gradiente personalizable
  /// 
  /// Crea un Container con gradiente lineal usando los colores del tema.
  /// Perfecto para overlays, fondos decorativos y efectos visuales.
  /// 
  /// Ejemplo básico:
  /// ```dart
  /// context.themedGradientContainer(
  ///   child: Text('Texto sobre gradiente'),
  /// )
  /// ```
  /// 
  /// Ejemplo avanzado:
  /// ```dart
  /// context.themedGradientContainer(
  ///   gradientColors: [Colors.blue, Colors.purple],
  ///   begin: Alignment.topLeft,
  ///   end: Alignment.bottomRight,
  ///   child: MyWidget(),
  /// )
  /// ```
  Container themedGradientContainer({
    Widget? child,
    List<Color>? gradientColors,
    AlignmentGeometry begin = Alignment.topCenter,
    AlignmentGeometry end = Alignment.bottomCenter,
    List<double>? stops,
    EdgeInsetsGeometry? padding,
    EdgeInsetsGeometry? margin,
    double? borderRadius,
  }) {
    return Container(
      padding: padding,
      margin: margin,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: gradientColors ?? [primaryColor, secondaryColor],
          begin: begin,
          end: end,
          stops: stops,
        ),
        borderRadius: borderRadius != null 
            ? BorderRadius.circular(borderRadius) 
            : null,
      ),
      child: child,
    );
  }
  
  /// 🎭 OVERLAY CON GRADIENTE - Overlay posicionado con gradiente
  /// 
  /// Crea un overlay que cubre toda su área con gradiente.
  /// Perfecto para oscurecer imágenes de fondo y mejorar legibilidad.
  /// 
  /// Ejemplo:
  /// ```dart
  /// Stack(
  ///   children: [
  ///     Image.asset('background.jpg'),
  ///     context.themedGradientOverlay(
  ///       startColor: Colors.transparent,
  ///       endColor: context.primaryColor.withOpacity(0.9),
  ///       startPosition: 0.6,
  ///     ),
  ///     // Tu contenido aquí
  ///   ],
  /// )
  /// ```
  Positioned themedGradientOverlay({
    Color? startColor,
    Color? endColor,
    AlignmentGeometry begin = Alignment.topCenter,
    AlignmentGeometry end = Alignment.bottomCenter,
    double startPosition = 0.6,
    double endPosition = 1.0,
  }) {
    return Positioned.fill(
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              startColor ?? Colors.transparent,
              endColor ?? primaryColor.withOpacity(0.9),
            ],
            begin: begin,
            end: end,
            stops: [startPosition, endPosition],
          ),
        ),
      ),
    );
  }
  
  /// 🔘 BOTÓN CON TEMA - ElevatedButton pre-configurado y super flexible
  /// 
  /// Crea un ElevatedButton con estilos consistentes y múltiples opciones.
  /// Soporta estados de carga, íconos, ancho completo y personalización.
  /// 
  /// Ejemplo básico:
  /// ```dart
  /// context.themedButton(
  ///   text: 'Continuar',
  ///   onPressed: _handleSubmit,
  /// )
  /// ```
  /// 
  /// Ejemplo con loading:
  /// ```dart
  /// context.themedButton(
  ///   text: 'Guardar',
  ///   onPressed: _isLoading ? null : _save,
  ///   isLoading: _isLoading,
  ///   fullWidth: true,
  /// )
  /// ```
  /// 
  /// Ejemplo con ícono:
  /// ```dart
  /// context.themedButton(
  ///   text: 'Iniciar Sesión',
  ///   icon: Icons.login,
  ///   onPressed: _login,
  ///   variant: ButtonVariant.secondary,
  /// )
  /// ```
  Widget themedButton({
    required String text,
    required VoidCallback? onPressed,
    IconData? icon,
    bool isLoading = false,
    bool fullWidth = false,
    ButtonVariant variant = ButtonVariant.primary,
    bool isSecondary = false, // Retrocompatibilidad
    double? borderRadius,
    EdgeInsetsGeometry? padding,
    Color? backgroundColor,
    Color? foregroundColor,
    TextStyle? textStyle,
  }) {
    // Si isSecondary es true, usar variante secundaria (retrocompatibilidad)
    final effectiveVariant = isSecondary ? ButtonVariant.secondary : variant;
    
    // Determinar colores según la variante
    final Color bgColor = backgroundColor ?? _getButtonBackgroundColor(effectiveVariant);
    final Color fgColor = foregroundColor ?? _getButtonForegroundColor(effectiveVariant);
    
    // Construir el hijo del botón
    Widget buttonChild;
    
    if (isLoading) {
      // Mostrar loading spinner
      buttonChild = SizedBox(
        height: iconSizeMedium,
        width: iconSizeMedium,
        child: CircularProgressIndicator(
          strokeWidth: 2,
          valueColor: AlwaysStoppedAnimation<Color>(fgColor),
        ),
      );
    } else if (icon != null) {
      // Botón con ícono y texto
      buttonChild = Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: iconSizeMedium),
          SizedBox(width: spacingSmall),
          Text(text, style: textStyle ?? labelLarge),
        ],
      );
    } else {
      // Solo texto
      buttonChild = Text(text, style: textStyle ?? labelLarge);
    }

    final button = ElevatedButton(
      onPressed: isLoading ? null : onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: bgColor,
        foregroundColor: fgColor,
        padding: padding ?? EdgeInsets.symmetric(
          vertical: spacingMedium,
          horizontal: spacingLarge,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(borderRadius ?? radiusMedium),
        ),
        disabledBackgroundColor: onSurfaceColor.withOpacity(0.12),
        disabledForegroundColor: onSurfaceColor.withOpacity(0.38),
      ),
      child: buttonChild,
    );

    // Si es fullWidth, envolver en SizedBox
    if (fullWidth) {
      return SizedBox(
        width: double.infinity,
        child: button,
      );
    }

    return button;
  }
  
  /// Helper privado para obtener color de fondo según variante
  Color _getButtonBackgroundColor(ButtonVariant variant) {
    switch (variant) {
      case ButtonVariant.primary:
        return primaryColor;
      case ButtonVariant.secondary:
        return secondaryColor;
      case ButtonVariant.tertiary:
        return tertiaryColor;
      case ButtonVariant.error:
        return errorColor;
      case ButtonVariant.surface:
        return surfaceColor;
    }
  }
  
  /// Helper privado para obtener color de texto según variante
  Color _getButtonForegroundColor(ButtonVariant variant) {
    switch (variant) {
      case ButtonVariant.primary:
        return onPrimaryColor;
      case ButtonVariant.secondary:
        return onSecondaryColor;
      case ButtonVariant.tertiary:
        return onTertiaryColor;
      case ButtonVariant.error:
        return onErrorColor;
      case ButtonVariant.surface:
        return onSurfaceColor;
    }
  }
  
  /// 📋 CAMPO DE FORMULARIO CON TEMA - TextFormField pre-configurado
  /// 
  /// Versión mejorada y más flexible para formularios con validación.
  /// Soporta todos los parámetros comunes de TextFormField.
  /// 
  /// Ejemplo:
  /// ```dart
  /// context.themedTextFormField(
  ///   controller: _emailController,
  ///   labelText: 'Email',
  ///   prefixIcon: Icons.email,
  ///   keyboardType: TextInputType.emailAddress,
  /// )
  /// ```
  TextFormField themedTextFormField({
    TextEditingController? controller,
    FocusNode? focusNode,
    String? labelText,
    String? hintText,
    bool obscureText = false,
    IconData? prefixIcon,
    Widget? suffixIcon,
    TextInputType? keyboardType,
    TextInputAction? textInputAction,
    FormFieldValidator<String>? validator,
    ValueChanged<String>? onChanged,
    ValueChanged<String>? onFieldSubmitted,
    bool enabled = true,
    bool readOnly = false,
    int? maxLines = 1,
    int? maxLength,
    Color? prefixIconColor,
    Color? fillColor,
  }) {
    return TextFormField(
      controller: controller,
      focusNode: focusNode,
      obscureText: obscureText,
      keyboardType: keyboardType,
      textInputAction: textInputAction,
      validator: validator,
      onChanged: onChanged,
      onFieldSubmitted: onFieldSubmitted,
      enabled: enabled,
      readOnly: readOnly,
      maxLines: maxLines,
      maxLength: maxLength,
      style: bodyMedium,
      decoration: InputDecoration(
        labelText: labelText,
        hintText: hintText,
        prefixIcon: prefixIcon != null 
            ? Icon(prefixIcon, color: prefixIconColor ?? outlineColor) 
            : null,
        suffixIcon: suffixIcon,
        fillColor: fillColor,
        contentPadding: EdgeInsets.symmetric(
          vertical: spacingMedium,
          horizontal: spacingMedium,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusMedium),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusMedium),
          borderSide: BorderSide(color: outlineColor),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusMedium),
          borderSide: BorderSide(color: primaryColor, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusMedium),
          borderSide: BorderSide(color: errorColor),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radiusMedium),
          borderSide: BorderSide(color: errorColor, width: 2),
        ),
      ),
    );
  }
  
  /// 🃏 CARD CON TEMA - Card pre-configurada con estilos
  /// 
  /// Crea una Card con estilos consistentes del tema.
  /// Perfecta para contenido agrupado y organizado.
  Card themedCard({
    required Widget child,
    EdgeInsetsGeometry? padding,
    EdgeInsetsGeometry? margin,
    bool elevated = true,
  }) {
    return Card(
      color: surfaceColor,
      elevation: elevated ? 2 : 0,
      margin: margin ?? paddingSmall,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(radiusLarge),
      ),
      child: Padding(
        padding: padding ?? paddingMedium,
        child: child,
      ),
    );
  }
  
  /// 🎨 COLOR CON OPACIDAD - Helper para colores transparentes
  /// 
  /// Crea una versión semitransparente de cualquier color del tema.
  /// Útil para overlays, backgrounds sutiles, estados disabled.
  Color colorWithOpacity(Color color, double opacity) {
    return color.withOpacity(opacity);
  }
  
  /// 🌈 GRADIENTE DEL TEMA - Gradiente basado en colores del tema
  /// 
  /// Crea un gradiente lineal usando los colores del tema actual.
  /// Perfecto para fondos llamativos y elementos hero.
  LinearGradient themedGradient({
    List<Color>? colors,
    AlignmentGeometry begin = Alignment.topLeft,
    AlignmentGeometry end = Alignment.bottomRight,
  }) {
    return LinearGradient(
      colors: colors ?? [primaryColor, secondaryColor],
      begin: begin,
      end: end,
    );
  }
}
