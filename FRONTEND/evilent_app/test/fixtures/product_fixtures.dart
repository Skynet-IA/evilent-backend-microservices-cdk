// 🎯 PRODUCT FIXTURES - Productos y órdenes para tests

import 'package:evilent_app/core/providers/app_data_provider.dart';

/// Productos de ejemplo
class ProductFixtures {
  /// Producto válido
  static Map<String, dynamic> get validProduct => {
    'id': 'prod-001',
    'name': 'Producto Test',
    'description': 'Un producto de prueba',
    'price': 99.99,
    'image': 'https://example.com/image.jpg',
    'stock': 10,
  };
  
  static Map<String, dynamic> get productOutOfStock => {
    'id': 'prod-002',
    'name': 'Producto Agotado',
    'description': 'Producto sin stock',
    'price': 49.99,
    'image': 'https://example.com/image2.jpg',
    'stock': 0,
  };
  
  static Map<String, dynamic> get expensiveProduct => {
    'id': 'prod-003',
    'name': 'Producto Caro',
    'description': 'Un producto premium',
    'price': 999.99,
    'image': 'https://example.com/image3.jpg',
    'stock': 5,
  };
  
  /// Carrito de compras
  static Map<String, dynamic> get emptyCart => {
    'items': [],
    'total': 0.0,
    'itemCount': 0,
  };
  
  static Map<String, dynamic> get cartWithItems => {
    'items': [
      {'productId': 'prod-001', 'quantity': 2, 'price': 99.99},
      {'productId': 'prod-002', 'quantity': 1, 'price': 49.99},
    ],
    'total': 249.97,
    'itemCount': 3,
  };
  
  /// Orden de compra
  static Map<String, dynamic> get validOrder => {
    'id': 'order-001',
    'userId': '123456',
    'items': [
      {'productId': 'prod-001', 'quantity': 2, 'price': 99.99},
    ],
    'total': 199.98,
    'status': 'pending',
    'createdAt': DateTime.now().toIso8601String(),
  };
}

