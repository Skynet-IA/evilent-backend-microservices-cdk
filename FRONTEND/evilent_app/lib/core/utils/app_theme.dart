// ═══════════════════════════════════════════════════════════════════════════════
// 🎭 APP THEME - EL DIRECTOR DE ORQUESTA VISUAL DE EVILENT
// ═══════════════════════════════════════════════════════════════════════════════
// 
// 🎨 ESTA CLASE ES COMO UN DIRECTOR DE ORQUESTA QUE ARMONIZA:
// ┌─────────────────────────────────────────────────────────────────────────┐
// │ 🌞 TEMA CLARO: Para días productivos y espacios luminosos               │
// │ 🌙 TEMA OSCURO: Para noches largas y ambientes relajados                │
// │ 🎼 TIPOGRAFÍA: Jerarquía musical de textos y estilos                    │
// │ 🎯 COMPONENTES: Todos los elementos UI perfectamente sincronizados      │
// └─────────────────────────────────────────────────────────────────────────┘
//
// 🔥 FILOSOFÍA DE DISEÑO EVILENT:
// • 🚀 MODERNO: Material Design 3 + nuestra personalidad
// • ♿ ACCESIBLE: Contrastes AAA, tamaños apropiados
// • 🔄 CONSISTENTE: Misma experiencia en todos los dispositivos
// • ⚡ PERFORMANTE: Widgets optimizados, caching inteligente
//
// 🛠️ CÓMO USAR:
// MaterialApp(
//   theme: AppTheme.lightTheme,
//   darkTheme: AppTheme.darkTheme,
//   themeMode: ThemeMode.system,
// )
// ═══════════════════════════════════════════════════════════════════════════════

import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_dimens.dart';

class AppTheme {
  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 🌞 TEMA CLARO - COMO UN AMANECER BRILLANTE Y ENERGÉTICO                 │
  // └─────────────────────────────────────────────────────────────────────────┘
  //
  // ☀️ PERFECTO PARA:
  // • Trabajo diurno y espacios bien iluminados
  // • Lectura prolongada y tareas detalladas
  // • Usuarios que prefieren interfaces tradicionales
  // • Maximizar legibilidad y contraste
  static ThemeData get lightTheme {
    final ColorScheme colorScheme = _lightColorScheme;
    
    return ThemeData(
      // 🏗️ FUNDACIÓN DEL TEMA
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: colorScheme,
      
      // 🔤 SISTEMA TIPOGRÁFICO
      textTheme: _buildTextTheme(colorScheme),
      
      // 📱 CONFIGURACIÓN DE ELEMENTOS UI
      appBarTheme: _buildAppBarTheme(colorScheme, true),
      elevatedButtonTheme: _buildElevatedButtonTheme(colorScheme),
      inputDecorationTheme: _buildInputDecorationTheme(colorScheme, true),
      cardTheme: _buildCardTheme(colorScheme, true),
      floatingActionButtonTheme: _buildFABTheme(colorScheme),
      
      // 🎯 CONFIGURACIONES ESPECÍFICAS
      splashColor: AppColors.withOpacity(colorScheme.primary, 0.1),
      highlightColor: AppColors.withOpacity(colorScheme.primary, 0.05),
      dividerColor: colorScheme.outline,
      scaffoldBackgroundColor: colorScheme.background,
    );
  }
  
  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 🌙 TEMA OSCURO - COMO UNA NOCHE ESTRELLADA Y MISTERIOSA                 │
  // └─────────────────────────────────────────────────────────────────────────┘
  //
  // 🌃 PERFECTO PARA:
  // • Trabajo nocturno y ambientes con poca luz
  // • Reducir fatiga visual en sesiones largas
  // • Ahorrar batería en pantallas OLED/AMOLED
  // • Crear ambiente inmersivo y moderno
  static ThemeData get darkTheme {
    final ColorScheme colorScheme = _darkColorScheme;
    
    return ThemeData(
      // 🏗️ FUNDACIÓN DEL TEMA
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: colorScheme,
      
      // 🔤 SISTEMA TIPOGRÁFICO  
      textTheme: _buildTextTheme(colorScheme),
      
      // 📱 CONFIGURACIÓN DE ELEMENTOS UI
      appBarTheme: _buildAppBarTheme(colorScheme, false),
      elevatedButtonTheme: _buildElevatedButtonTheme(colorScheme),
      inputDecorationTheme: _buildInputDecorationTheme(colorScheme, false),
      cardTheme: _buildCardTheme(colorScheme, false),
      floatingActionButtonTheme: _buildFABTheme(colorScheme),
      
      // 🎯 CONFIGURACIONES ESPECÍFICAS
      splashColor: AppColors.withOpacity(colorScheme.primary, 0.2),
      highlightColor: AppColors.withOpacity(colorScheme.primary, 0.1),
      dividerColor: colorScheme.outline,
      scaffoldBackgroundColor: colorScheme.background,
    );
  }
  
  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 🎨 COLOR SCHEMES - PALETAS MAESTRAS DE COLORES                          │
  // └─────────────────────────────────────────────────────────────────────────┘
  
  /// 🌞 ESQUEMA DE COLORES PARA TEMA CLARO
  static const ColorScheme _lightColorScheme = ColorScheme(
    brightness: Brightness.light,
    primary: AppColors.primary,
    onPrimary: AppColors.white,
    primaryContainer: AppColors.primarySurface,
    onPrimaryContainer: AppColors.primaryDark,
    secondary: AppColors.secondary,
    onSecondary: AppColors.white,
    secondaryContainer: AppColors.successLight,
    onSecondaryContainer: AppColors.secondaryDark,
    tertiary: AppColors.accent,
    onTertiary: AppColors.black,
    tertiaryContainer: AppColors.warningLight,
    onTertiaryContainer: AppColors.accent,
    error: AppColors.error,
    onError: AppColors.white,
    errorContainer: AppColors.errorLight,
    onErrorContainer: AppColors.error,
    background: AppColors.grey50,
    onBackground: AppColors.grey900,
    surface: AppColors.white,
    onSurface: AppColors.grey900,
    surfaceVariant: AppColors.grey100,
    onSurfaceVariant: AppColors.grey700,
    outline: AppColors.grey200,
    outlineVariant: AppColors.grey100,
    shadow: AppColors.black,
    scrim: AppColors.black,
    inverseSurface: AppColors.grey900,
    onInverseSurface: AppColors.white,
    inversePrimary: AppColors.primaryLight,
    surfaceTint: AppColors.primary,
  );
  
  /// 🌙 ESQUEMA DE COLORES PARA TEMA OSCURO
  static const ColorScheme _darkColorScheme = ColorScheme(
    brightness: Brightness.dark,
    primary: AppColors.primary,
    onPrimary: AppColors.white,
    primaryContainer: AppColors.primaryDark,
    onPrimaryContainer: AppColors.primaryLight,
    secondary: AppColors.secondary,
    onSecondary: AppColors.black,
    secondaryContainer: AppColors.secondaryDark,
    onSecondaryContainer: AppColors.secondary,
    tertiary: AppColors.accent,
    onTertiary: AppColors.black,
    tertiaryContainer: AppColors.accentLight,
    onTertiaryContainer: AppColors.accent,
    error: AppColors.error,
    onError: AppColors.white,
    errorContainer: AppColors.error,
    onErrorContainer: AppColors.errorLight,
    background: AppColors.grey900,
    onBackground: AppColors.white,
    surface: AppColors.grey800,
    onSurface: AppColors.white,
    surfaceVariant: AppColors.grey700,
    onSurfaceVariant: AppColors.grey200,
    outline: AppColors.grey500,
    outlineVariant: AppColors.grey700,
    shadow: AppColors.black,
    scrim: AppColors.black,
    inverseSurface: AppColors.grey100,
    onInverseSurface: AppColors.grey900,
    inversePrimary: AppColors.primaryDark,
    surfaceTint: AppColors.primary,
  );
  
  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 🔤 SISTEMA TIPOGRÁFICO - LA VOZ VISUAL DE EVILENT                       │
  // └─────────────────────────────────────────────────────────────────────────┘
  
  /// 📚 CONSTRUYE EL TEMA TIPOGRÁFICO COMPLETO
  static TextTheme _buildTextTheme(ColorScheme colorScheme) {
    final Color textColor = colorScheme.onSurface;
    final Color displayColor = colorScheme.onBackground;
    
    return TextTheme(
      // 🎪 DISPLAY - Para números grandes, hero text
      displayLarge: TextStyle(
        fontSize: AppDimens.fontDisplay,
        fontWeight: FontWeight.w400,
        letterSpacing: -0.25,
        height: 1.12,
        color: displayColor,
      ),
      displayMedium: TextStyle(
        fontSize: AppDimens.fontHeadline,
        fontWeight: FontWeight.w400,
        letterSpacing: 0,
        height: 1.16,
        color: displayColor,
      ),
      displaySmall: TextStyle(
        fontSize: AppDimens.fontTitle,
        fontWeight: FontWeight.w400,
        letterSpacing: 0,
        height: 1.22,
        color: displayColor,
      ),
      
      // 🏷️ HEADLINE - Para títulos principales
      headlineLarge: TextStyle(
        fontSize: AppDimens.fontHeadline,
        fontWeight: FontWeight.w600,
        letterSpacing: 0,
        height: 1.25,
        color: textColor,
      ),
      headlineMedium: TextStyle(
        fontSize: AppDimens.fontTitle,
        fontWeight: FontWeight.w600,
        letterSpacing: 0,
        height: 1.29,
        color: textColor,
      ),
      headlineSmall: TextStyle(
        fontSize: AppDimens.fontLarge,
        fontWeight: FontWeight.w600,
        letterSpacing: 0,
        height: 1.33,
        color: textColor,
      ),
      
      // 📋 TITLE - Para títulos de sección
      titleLarge: TextStyle(
        fontSize: AppDimens.fontLarge,
        fontWeight: FontWeight.w500,
        letterSpacing: 0,
        height: 1.27,
        color: textColor,
      ),
      titleMedium: TextStyle(
        fontSize: AppDimens.fontMedium,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.15,
        height: 1.50,
        color: textColor,
      ),
      titleSmall: TextStyle(
        fontSize: AppDimens.fontBody,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.1,
        height: 1.43,
        color: textColor,
      ),
      
      // 📄 BODY - Para texto principal
      bodyLarge: TextStyle(
        fontSize: AppDimens.fontMedium,
        fontWeight: FontWeight.w400,
        letterSpacing: 0.5,
        height: 1.50,
        color: textColor,
      ),
      bodyMedium: TextStyle(
        fontSize: AppDimens.fontBody,
        fontWeight: FontWeight.w400,
        letterSpacing: 0.25,
        height: 1.43,
        color: textColor,
      ),
      bodySmall: TextStyle(
        fontSize: AppDimens.fontCaption,
        fontWeight: FontWeight.w400,
        letterSpacing: 0.4,
        height: 1.33,
        color: textColor,
      ),
      
      // 🏷️ LABEL - Para etiquetas y botones
      labelLarge: TextStyle(
        fontSize: AppDimens.fontBody,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.1,
        height: 1.43,
        color: textColor,
      ),
      labelMedium: TextStyle(
        fontSize: AppDimens.fontCaption,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.5,
        height: 1.33,
        color: textColor,
      ),
      labelSmall: TextStyle(
        fontSize: AppDimens.fontMicro,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.5,
        height: 1.45,
        color: textColor,
      ),
    );
  }
  
  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 🎯 TEMAS DE COMPONENTES ESPECÍFICOS                                      │
  // └─────────────────────────────────────────────────────────────────────────┘
  
  /// 📱 TEMA PARA APP BAR
  static AppBarTheme _buildAppBarTheme(ColorScheme colorScheme, bool isLight) {
    return AppBarTheme(
      backgroundColor: colorScheme.surface,
      foregroundColor: colorScheme.onSurface,
      elevation: 0,
      scrolledUnderElevation: 1,
      surfaceTintColor: colorScheme.surfaceTint,
      centerTitle: true,
      titleSpacing: AppDimens.spacingMedium,
      titleTextStyle: TextStyle(
        fontSize: AppDimens.fontTitle,
        fontWeight: FontWeight.w600,
        color: colorScheme.onSurface,
      ),
      iconTheme: IconThemeData(
        color: colorScheme.onSurface,
        size: AppDimens.iconSizeMedium,
      ),
    );
  }
  
  /// 🔘 TEMA PARA BOTONES ELEVADOS
  static ElevatedButtonThemeData _buildElevatedButtonTheme(ColorScheme colorScheme) {
    return ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: colorScheme.primary,
        foregroundColor: colorScheme.onPrimary,
        disabledBackgroundColor: colorScheme.onSurface.withOpacity(0.12),
        disabledForegroundColor: colorScheme.onSurface.withOpacity(0.38),
        elevation: 1,
        shadowColor: colorScheme.shadow,
        surfaceTintColor: colorScheme.surfaceTint,
        padding: AppDimens.paddingHorizontalLarge.add(AppDimens.paddingVerticalMedium),
        minimumSize: Size(0, AppDimens.buttonHeightMedium),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppDimens.radiusMedium),
        ),
        textStyle: TextStyle(
          fontSize: AppDimens.fontBody,
          fontWeight: FontWeight.w500,
          letterSpacing: 0.1,
        ),
      ),
    );
  }
  
  /// ✏️ TEMA PARA CAMPOS DE TEXTO
  static InputDecorationTheme _buildInputDecorationTheme(ColorScheme colorScheme, bool isLight) {
    return InputDecorationTheme(
      filled: true,
      fillColor: colorScheme.surfaceVariant,
      hintStyle: TextStyle(
        color: colorScheme.onSurfaceVariant,
        fontSize: AppDimens.fontBody,
      ),
      labelStyle: TextStyle(
        color: colorScheme.onSurfaceVariant,
        fontSize: AppDimens.fontBody,
      ),
      floatingLabelStyle: TextStyle(
        color: colorScheme.primary,
        fontSize: AppDimens.fontCaption,
      ),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppDimens.radiusMedium),
        borderSide: BorderSide(color: colorScheme.outline),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppDimens.radiusMedium),
        borderSide: BorderSide(color: colorScheme.outline),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppDimens.radiusMedium),
        borderSide: BorderSide(color: colorScheme.primary, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppDimens.radiusMedium),
        borderSide: BorderSide(color: colorScheme.error),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppDimens.radiusMedium),
        borderSide: BorderSide(color: colorScheme.error, width: 2),
      ),
      contentPadding: AppDimens.paddingMedium,
    );
  }
  
  /// 🃏 TEMA PARA CARDS
  static CardThemeData _buildCardTheme(ColorScheme colorScheme, bool isLight) {
    return CardThemeData(
      color: colorScheme.surface,
      surfaceTintColor: colorScheme.surfaceTint,
      shadowColor: colorScheme.shadow,
      elevation: 1,
      margin: AppDimens.paddingSmall,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppDimens.radiusLarge),
      ),
    );
  }
  
  /// ⭕ TEMA PARA FLOATING ACTION BUTTON
  static FloatingActionButtonThemeData _buildFABTheme(ColorScheme colorScheme) {
    return FloatingActionButtonThemeData(
      backgroundColor: colorScheme.primary,
      foregroundColor: colorScheme.onPrimary,
      elevation: 6,
      focusElevation: 8,
      hoverElevation: 8,
      highlightElevation: 12,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppDimens.radiusLarge),
      ),
    );
  }
}
