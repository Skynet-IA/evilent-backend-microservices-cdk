import 'package:flutter/material.dart';
import 'package:evilent_app/features/cart/screens/cart_screen.dart';

/// Sistema de rutas para el módulo del carrito.
class CartRoutes {
  CartRoutes._();

  static const String cart = '/cart';

  /// Lista de todas las rutas del módulo
  static const List<String> allRoutes = [
    cart,
  ];

  /// Verifica si una ruta pertenece a este módulo
  static bool isCartRoute(String? routeName) {
    return allRoutes.contains(routeName);
  }

  /// Obtiene la ruta correspondiente
  static Route<dynamic>? getRoute(RouteSettings settings) {
    switch (settings.name) {
      case cart:
        return MaterialPageRoute(
          settings: settings,
          builder: (_) => const CartScreen(),
        );
      default:
        return null;
    }
  }
}

