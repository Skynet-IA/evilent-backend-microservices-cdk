/// Sistema de rutas lazy loaded con delegación por features.
/// 
/// Punto de entrada principal del sistema de navegación.
/// Delega a módulos de rutas por feature que cargan pantallas bajo demanda.

import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:evilent_app/features/auth/routes/auth_routes.dart';
import 'package:evilent_app/features/home/routes/home_routes.dart';
import 'package:evilent_app/features/common/routes/common_routes.dart';
import 'package:evilent_app/features/explore/routes/explore_routes.dart';
import 'package:evilent_app/features/cart/routes/cart_routes.dart';
import 'package:evilent_app/features/profile/routes/profile_routes.dart';

/// Coordinador principal de rutas con lazy loading.
class AppRoutes {
  AppRoutes._();

  // Ruta inicial
  static const String authGate = CommonRoutes.root;
  
  // Aliases de rutas para compatibilidad retroactiva
  static const String intro = AuthRoutes.intro;
  static const String login = AuthRoutes.login;
  static const String confirmation = AuthRoutes.confirmation;
  static const String forgotPassword = AuthRoutes.forgotPassword;
  static const String resetCode = AuthRoutes.resetCode;
  static const String newPassword = AuthRoutes.newPassword;
  static const String home = HomeRoutes.home;
  static const String explore = ExploreRoutes.explore;
  static const String cart = CartRoutes.cart;
  static const String profile = ProfileRoutes.profile;
  static const String editProfile = ProfileRoutes.editProfile;
  static const String amplifyError = CommonRoutes.amplifyError;
  static const String notFound = CommonRoutes.notFound;

  /// Generador principal de rutas con delegación a módulos por feature.
  static Route<dynamic> onGenerateRoute(RouteSettings settings) {
    if (kDebugMode) {
      final stopwatch = Stopwatch()..start();
      final route = _generateRoute(settings);
      stopwatch.stop();
      
      final routeName = settings.name ?? 'null';
      final timeMs = stopwatch.elapsedMicroseconds / 1000;
      final module = _getModuleName(routeName);
      
      debugPrint('[ROUTE] $routeName → $module (${timeMs.toStringAsFixed(2)}ms)');
      
      return route;
    }
    
    return _generateRoute(settings);
  }

  /// Genera la ruta delegando al módulo correspondiente.
  static Route<dynamic> _generateRoute(RouteSettings settings) {
    final routeName = settings.name;
    
    // Delegar a AuthRoutes
    if (AuthRoutes.isAuthRoute(routeName)) {
      final route = AuthRoutes.getRoute(settings);
      if (route != null) return route;
    }
    
    // Delegar a HomeRoutes
    if (HomeRoutes.isHomeRoute(routeName)) {
      final route = HomeRoutes.getRoute(settings);
      if (route != null) return route;
    }
    
    // Delegar a ExploreRoutes
    if (ExploreRoutes.isExploreRoute(routeName)) {
      final route = ExploreRoutes.getRoute(settings);
      if (route != null) return route;
    }
    
    // Delegar a CartRoutes
    if (CartRoutes.isCartRoute(routeName)) {
      final route = CartRoutes.getRoute(settings);
      if (route != null) return route;
    }
    
    // Delegar a ProfileRoutes
    if (ProfileRoutes.isProfileRoute(routeName)) {
      final route = ProfileRoutes.getRoute(settings);
      if (route != null) return route;
    }
    
    // Delegar a CommonRoutes
    if (CommonRoutes.isCommonRoute(routeName)) {
      return CommonRoutes.getRoute(settings);
    }
    
    // Fallback: ruta no encontrada (404)
    return CommonRoutes.getRoute(
      RouteSettings(
        name: CommonRoutes.notFound,
        arguments: {'attemptedRoute': routeName},
      ),
    );
  }

  /// Determina qué módulo maneja una ruta (para logging).
  static String _getModuleName(String routeName) {
    if (AuthRoutes.isAuthRoute(routeName)) return 'AuthRoutes';
    if (HomeRoutes.isHomeRoute(routeName)) return 'HomeRoutes';
    if (ExploreRoutes.isExploreRoute(routeName)) return 'ExploreRoutes';
    if (CartRoutes.isCartRoute(routeName)) return 'CartRoutes';
    if (ProfileRoutes.isProfileRoute(routeName)) return 'ProfileRoutes';
    if (CommonRoutes.isCommonRoute(routeName)) return 'CommonRoutes';
    return '404 NotFound';
  }

  /// Lista de todas las rutas disponibles en la aplicación.
  static List<String> getAllRoutes() {
    return [
      ...AuthRoutes.allRoutes,
      ...HomeRoutes.allRoutes,
      ...ExploreRoutes.allRoutes,
      ...CartRoutes.allRoutes,
      ...ProfileRoutes.allRoutes,
      ...CommonRoutes.allRoutes,
    ];
  }

  /// Imprime todas las rutas disponibles (solo en debug).
  static void debugPrintAllRoutes() {
    if (kDebugMode) {
      debugPrint('═══════════════════════════════════════');
      debugPrint('📋 TODAS LAS RUTAS DISPONIBLES:');
      debugPrint('═══════════════════════════════════════');
      
      debugPrint('\n🔐 AUTH ROUTES:');
      for (final route in AuthRoutes.allRoutes) {
        debugPrint('  • $route');
      }
      
      debugPrint('\n🏠 HOME ROUTES:');
      for (final route in HomeRoutes.allRoutes) {
        debugPrint('  • $route');
      }
      
      debugPrint('\n🔍 EXPLORE ROUTES:');
      for (final route in ExploreRoutes.allRoutes) {
        debugPrint('  • $route');
      }
      
      debugPrint('\n🛒 CART ROUTES:');
      for (final route in CartRoutes.allRoutes) {
        debugPrint('  • $route');
      }
      
      debugPrint('\n👤 PROFILE ROUTES:');
      for (final route in ProfileRoutes.allRoutes) {
        debugPrint('  • $route');
      }
      
      debugPrint('\n🌐 COMMON ROUTES:');
      for (final route in CommonRoutes.allRoutes) {
        debugPrint('  • $route');
      }
      
      debugPrint('\n═══════════════════════════════════════');
      debugPrint('📊 TOTAL: ${getAllRoutes().length} rutas');
      debugPrint('═══════════════════════════════════════\n');
    }
  }
}

