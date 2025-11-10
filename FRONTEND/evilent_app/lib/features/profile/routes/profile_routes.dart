import 'package:flutter/material.dart';
import 'package:evilent_app/features/profile/screens/profile_screen.dart';
import 'package:evilent_app/features/profile/screens/edit_profile_screen.dart';

/// Sistema de rutas para el módulo de perfil.
class ProfileRoutes {
  ProfileRoutes._();

  static const String profile = '/profile';
  static const String editProfile = '/profile/edit';

  /// Lista de todas las rutas del módulo
  static const List<String> allRoutes = [
    profile,
    editProfile,
  ];

  /// Verifica si una ruta pertenece a este módulo
  static bool isProfileRoute(String? routeName) {
    return allRoutes.contains(routeName);
  }

  /// Obtiene la ruta correspondiente
  static Route<dynamic>? getRoute(RouteSettings settings) {
    switch (settings.name) {
      case profile:
        return MaterialPageRoute(
          settings: settings,
          builder: (_) => const ProfileScreen(),
        );
      case editProfile:
        return MaterialPageRoute(
          settings: settings,
          builder: (_) => const EditProfileScreen(),
        );
      default:
        return null;
    }
  }
}

