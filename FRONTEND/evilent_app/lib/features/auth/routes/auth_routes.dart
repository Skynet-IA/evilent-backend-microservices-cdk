/// Módulo de rutas lazy loaded para autenticación.
/// 
/// Encapsula todas las rutas relacionadas con auth, permitiendo
/// que Flutter cargue pantallas solo cuando sean necesarias.

import 'package:flutter/material.dart';
import 'package:evilent_app/core/utils/navigation.dart';
import 'package:evilent_app/features/auth/screens/intro_screen.dart';
import 'package:evilent_app/features/auth/screens/login_screen.dart';
import 'package:evilent_app/features/auth/screens/confirmation_screen.dart';
import 'package:evilent_app/features/auth/screens/forgot_password_screen.dart';
import 'package:evilent_app/features/auth/screens/reset_code_screen.dart';
import 'package:evilent_app/features/auth/screens/new_password_screen.dart';

/// Gestor de rutas de autenticación con lazy loading.
class AuthRoutes {
  AuthRoutes._();

  // Constantes de rutas
  static const String intro = '/intro';
  static const String login = '/login';
  static const String confirmation = '/confirmation';
  static const String forgotPassword = '/forgot-password';
  static const String resetCode = '/reset-code';
  static const String newPassword = '/new-password';

  /// Obtiene la Route correspondiente según el nombre de ruta y argumentos.
  /// Retorna null si la ruta no pertenece a este módulo.
  static Route<dynamic>? getRoute(RouteSettings settings) {
    switch (settings.name) {
      case intro:
        return _buildIntroRoute();
      case login:
        return _buildLoginRoute(settings.arguments);
      case confirmation:
        return _buildConfirmationRoute();
      case forgotPassword:
        return _buildForgotPasswordRoute();
      case resetCode:
        return _buildResetCodeRoute(settings.arguments);
      case newPassword:
        return _buildNewPasswordRoute(settings.arguments);
      default:
        return null;
    }
  }

  // Factory methods privados
  
  static Route<dynamic> _buildIntroRoute() {
    return MaterialPageRoute(
      builder: (_) => const IntroScreen(),
    );
  }

  static Route<dynamic> _buildLoginRoute(Object? arguments) {
    final args = arguments as Map<String, dynamic>?;
    final fromConfirmation = args?['fromConfirmation'] ?? false;
    final fromPasswordReset = args?['fromPasswordReset'] ?? false;
    
    return Navigation.createSlideTransition(
      LoginScreen(
        fromConfirmation: fromConfirmation,
        fromPasswordReset: fromPasswordReset,
      ),
    );
  }

  static Route<dynamic> _buildConfirmationRoute() {
    return MaterialPageRoute(
      builder: (_) => const ConfirmationScreen(),
    );
  }

  static Route<dynamic> _buildForgotPasswordRoute() {
    return Navigation.createSlideTransition(
      const ForgotPasswordScreen(),
    );
  }

  static Route<dynamic> _buildResetCodeRoute(Object? arguments) {
    final args = arguments as Map<String, dynamic>;
    final email = args['email'] as String;
    
    return MaterialPageRoute(
      builder: (_) => ResetCodeScreen(email: email),
    );
  }

  static Route<dynamic> _buildNewPasswordRoute(Object? arguments) {
    final args = arguments as Map<String, dynamic>;
    final email = args['email'] as String;
    final code = args['code'] as String;
    
    return MaterialPageRoute(
      builder: (_) => NewPasswordScreen(
        email: email,
        code: code,
      ),
    );
  }

  /// Verifica si una ruta pertenece al módulo de autenticación.
  static bool isAuthRoute(String? routeName) {
    return routeName == intro ||
        routeName == login ||
        routeName == confirmation ||
        routeName == forgotPassword ||
        routeName == resetCode ||
        routeName == newPassword;
  }

  /// Lista de todas las rutas gestionadas por este módulo.
  static List<String> get allRoutes => [
        intro,
        login,
        confirmation,
        forgotPassword,
        resetCode,
        newPassword,
      ];
}
