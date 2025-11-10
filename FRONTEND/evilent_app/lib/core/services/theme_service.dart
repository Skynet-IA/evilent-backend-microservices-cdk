// Servicio de gestión de temas con persistencia usando SharedPreferences.
// Permite cambiar entre modo claro, oscuro y automático (sistema).

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ThemeService extends ChangeNotifier {
  static const String _themeModeKey = 'evilent_theme_mode';
  
  ThemeMode _themeMode = ThemeMode.system;
  SharedPreferences? _prefs;
  
  static ThemeService? _instance;
  static ThemeService get instance => _instance ??= ThemeService._internal();
  
  ThemeService._internal();
  
  ThemeMode get themeMode => _themeMode;
  
  bool get isDarkMode {
    if (_themeMode == ThemeMode.system) {
      return WidgetsBinding.instance.platformDispatcher.platformBrightness == Brightness.dark;
    }
    return _themeMode == ThemeMode.dark;
  }
  
  String get themeName {
    switch (_themeMode) {
      case ThemeMode.light:
        return 'Claro';
      case ThemeMode.dark:
        return 'Oscuro';
      case ThemeMode.system:
        return 'Automático';
    }
  }
  
  IconData get themeIcon {
    switch (_themeMode) {
      case ThemeMode.light:
        return Icons.light_mode;
      case ThemeMode.dark:
        return Icons.dark_mode;
      case ThemeMode.system:
        return Icons.brightness_auto;
    }
  }
  
  /// Inicializa el servicio: carga preferencias y configura listeners del sistema.
  Future<void> initialize() async {
    try {
      _prefs = await SharedPreferences.getInstance();
      await _loadSavedThemeMode();
      _setupSystemThemeListener();
      
      debugPrint('🎨 [ThemeService] Inicializado correctamente - Tema: $themeName');
    } catch (e) {
      debugPrint('❌ [ThemeService] Error en inicialización: $e');
      _themeMode = ThemeMode.system;
    }
  }
  
  Future<void> _loadSavedThemeMode() async {
    try {
      final String? savedTheme = _prefs?.getString(_themeModeKey);
      
      if (savedTheme != null) {
        _themeMode = ThemeMode.values.firstWhere(
          (mode) => mode.toString() == savedTheme,
          orElse: () => ThemeMode.system,
        );
        
        debugPrint('📖 [ThemeService] Tema cargado: $themeName');
      } else {
        _themeMode = ThemeMode.system;
        debugPrint('🆕 [ThemeService] Primera ejecución - usando tema automático');
      }
    } catch (e) {
      debugPrint('❌ [ThemeService] Error cargando tema: $e');
      _themeMode = ThemeMode.system;
    }
  }
  
  void _setupSystemThemeListener() {
    try {
      WidgetsBinding.instance.platformDispatcher.onPlatformBrightnessChanged = () {
        if (_themeMode == ThemeMode.system) {
          notifyListeners();
          debugPrint('🌓 [ThemeService] Cambio detectado en tema del sistema');
        }
      };
    } catch (e) {
      debugPrint('❌ [ThemeService] Error configurando listener del sistema: $e');
    }
  }
  
  /// Cambia el tema de la aplicación y lo persiste en SharedPreferences.
  Future<void> setThemeMode(ThemeMode mode) async {
    try {
      if (_themeMode == mode) {
        debugPrint('⚠️ [ThemeService] Tema ya está configurado como: ${mode.toString()}');
        return;
      }
      
      final String previousTheme = themeName;
      _themeMode = mode;
      
      await _saveThemeMode();
      notifyListeners();
      
      debugPrint('✅ [ThemeService] Tema cambiado: $previousTheme → $themeName');
    } catch (e) {
      debugPrint('❌ [ThemeService] Error cambiando tema: $e');
      notifyListeners();
    }
  }
  
  Future<void> _saveThemeMode() async {
    try {
      await _prefs?.setString(_themeModeKey, _themeMode.toString());
      debugPrint('💾 [ThemeService] Tema guardado: ${_themeMode.toString()}');
    } catch (e) {
      debugPrint('❌ [ThemeService] Error guardando tema: $e');
      throw Exception('No se pudo guardar la preferencia de tema');
    }
  }
  
  /// Alterna entre tema claro y oscuro. Si está en automático, cambia según el sistema actual.
  Future<void> toggleTheme() async {
    try {
      ThemeMode newMode;
      
      switch (_themeMode) {
        case ThemeMode.light:
          newMode = ThemeMode.dark;
          break;
        case ThemeMode.dark:
          newMode = ThemeMode.light;
          break;
        case ThemeMode.system:
          final bool isSystemDark = WidgetsBinding.instance
              .platformDispatcher.platformBrightness == Brightness.dark;
          newMode = isSystemDark ? ThemeMode.light : ThemeMode.dark;
          break;
      }
      
      await setThemeMode(newMode);
      debugPrint('🔄 [ThemeService] Tema alternado a: $themeName');
    } catch (e) {
      debugPrint('❌ [ThemeService] Error alternando tema: $e');
    }
  }
  
  Future<void> setSystemMode() async {
    await setThemeMode(ThemeMode.system);
  }
  
  Future<void> setLightMode() async {
    await setThemeMode(ThemeMode.light);
  }
  
  Future<void> setDarkMode() async {
    await setThemeMode(ThemeMode.dark);
  }
  
  /// Resetea las preferencias de tema a valores por defecto (ThemeMode.system).
  Future<void> resetToDefault() async {
    try {
      await _prefs?.remove(_themeModeKey);
      await setThemeMode(ThemeMode.system);
      debugPrint('🧹 [ThemeService] Preferencias reseteadas a valores por defecto');
    } catch (e) {
      debugPrint('❌ [ThemeService] Error reseteando preferencias: $e');
    }
  }
  
  @override
  void dispose() {
    WidgetsBinding.instance.platformDispatcher.onPlatformBrightnessChanged = null;
    _prefs = null;
    
    debugPrint('🧹 [ThemeService] Recursos limpiados');
    super.dispose();
  }
}
