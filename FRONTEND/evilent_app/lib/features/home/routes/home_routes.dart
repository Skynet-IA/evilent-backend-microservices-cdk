/// Módulo de rutas lazy loaded para home/dashboard.
/// 
/// Gestiona todas las rutas del área principal de la aplicación.
/// Preparado para escalar a 20-30 pantallas del feature.

import 'package:flutter/material.dart';
import 'package:evilent_app/core/navigation/app_shell.dart';

/// Gestor de rutas del feature Home con lazy loading.
class HomeRoutes {
  HomeRoutes._();

  // Constantes de rutas
  static const String home = '/home';
  
  // Rutas futuras (descomentar cuando se implementen):
  // static const String dashboard = '/dashboard';
  // static const String settings = '/settings';

  /// Obtiene la Route correspondiente según el nombre de ruta.
  /// Retorna null si la ruta no pertenece a este módulo.
  static Route<dynamic>? getRoute(RouteSettings settings) {
    switch (settings.name) {
      case home:
        return _buildHomeRoute(settings.arguments);
      default:
        return null;
    }
  }

  // Factory methods
  
  static Route<dynamic> _buildHomeRoute(Object? arguments) {
    return MaterialPageRoute(
      builder: (_) => const AppShell(),
    );
  }

  /// Verifica si una ruta pertenece al módulo de home.
  static bool isHomeRoute(String? routeName) {
    return routeName == home;
  }

  /// Lista de todas las rutas gestionadas por este módulo.
  static List<String> get allRoutes => [home];
}
