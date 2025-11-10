import 'package:flutter/material.dart';
import 'package:evilent_app/features/explore/screens/explore_screen.dart';

/// Sistema de rutas para el módulo de exploración.
class ExploreRoutes {
  ExploreRoutes._();

  static const String explore = '/explore';

  /// Lista de todas las rutas del módulo
  static const List<String> allRoutes = [
    explore,
  ];

  /// Verifica si una ruta pertenece a este módulo
  static bool isExploreRoute(String? routeName) {
    return allRoutes.contains(routeName);
  }

  /// Obtiene la ruta correspondiente
  static Route<dynamic>? getRoute(RouteSettings settings) {
    switch (settings.name) {
      case explore:
        return MaterialPageRoute(
          settings: settings,
          builder: (_) => const ExploreScreen(),
        );
      default:
        return null;
    }
  }
}

