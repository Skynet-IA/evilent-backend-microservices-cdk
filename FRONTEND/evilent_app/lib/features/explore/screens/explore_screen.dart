import 'package:flutter/material.dart';

/// Pantalla de exploración de productos, categorías y tiendas.
class ExploreScreen extends StatelessWidget {
  const ExploreScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Explorar'),
        centerTitle: true,
      ),
      body: const Center(
        child: Text(
          '🔍 Explorar',
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }
}

