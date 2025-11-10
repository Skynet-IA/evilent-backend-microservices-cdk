import 'package:flutter/material.dart';

/// Pantalla del carrito de compras.
class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Carrito'),
        centerTitle: true,
      ),
      body: const Center(
        child: Text(
          '🛒 Carrito',
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }
}

