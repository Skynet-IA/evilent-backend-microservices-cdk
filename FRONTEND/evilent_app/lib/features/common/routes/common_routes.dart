/// Módulo de rutas compartidas y globales.
/// 
/// Gestiona rutas que no pertenecen a un feature específico:
/// AuthGate, pantallas de error, y fallback 404.

import 'package:flutter/material.dart';
import 'package:evilent_app/features/common/screens/auth_gate.dart';
import 'package:evilent_app/features/common/screens/amplify_error_screen.dart';

/// Gestor de rutas compartidas con lazy loading.
class CommonRoutes {
  CommonRoutes._();

  // Constantes de rutas
  static const String root = '/';
  static const String amplifyError = '/error';
  static const String notFound = '/not-found';

  /// Obtiene la Route correspondiente. Siempre retorna una ruta válida.
  static Route<dynamic> getRoute(RouteSettings settings) {
    switch (settings.name) {
      case root:
        return _buildAuthGateRoute();
      case amplifyError:
        return _buildAmplifyErrorRoute(settings.arguments);
      case notFound:
        return _buildNotFoundRoute(settings.name);
      default:
        return _buildNotFoundRoute(settings.name);
    }
  }

  // Factory methods

  static Route<dynamic> _buildAuthGateRoute() {
    return MaterialPageRoute(
      builder: (_) => const AuthGate(),
    );
  }

  static Route<dynamic> _buildAmplifyErrorRoute(Object? arguments) {
    VoidCallback? onRetry;
    
    if (arguments is Map<String, dynamic>) {
      onRetry = arguments['onRetry'] as VoidCallback?;
    }
    
    return MaterialPageRoute(
      builder: (_) => AmplifyErrorScreen(
        onRetry: onRetry ?? () {},
      ),
    );
  }

  /// Pantalla 404 para rutas no encontradas.
  static Route<dynamic> _buildNotFoundRoute(String? routeName) {
    return MaterialPageRoute(
      builder: (context) => Scaffold(
        backgroundColor: Colors.white,
        body: SafeArea(
          child: Center(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.error_outline_rounded,
                    size: 120,
                    color: Colors.red,
                  ),
                  const SizedBox(height: 32),
                  const Text(
                    '404',
                    style: TextStyle(
                      fontSize: 48,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Página no encontrada',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w600,
                      color: Colors.black87,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'La ruta que buscas no existe o fue movida.',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.grey[600],
                    ),
                    textAlign: TextAlign.center,
                  ),
                  if (routeName != null && routeName.isNotEmpty)
                    Container(
                      margin: const EdgeInsets.only(top: 16),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.grey[200],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        'Ruta: $routeName',
                        style: TextStyle(
                          fontSize: 14,
                          fontFamily: 'monospace',
                          color: Colors.grey[800],
                        ),
                      ),
                    ),
                  const SizedBox(height: 48),
                  ElevatedButton.icon(
                    onPressed: () {
                      if (Navigator.canPop(context)) {
                        Navigator.pop(context);
                      } else {
                        Navigator.pushReplacementNamed(context, '/');
                      }
                    },
                    icon: const Icon(Icons.arrow_back),
                    label: const Text('Volver'),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 32,
                        vertical: 16,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  /// Verifica si una ruta pertenece al módulo common.
  static bool isCommonRoute(String? routeName) {
    return routeName == root ||
        routeName == amplifyError ||
        routeName == notFound;
  }

  /// Lista de todas las rutas gestionadas por este módulo.
  static List<String> get allRoutes => [root, amplifyError, notFound];
}

