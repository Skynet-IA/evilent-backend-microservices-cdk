// 🎯 TEST APP WRAPPER - Envuelve widgets para testing
// Valida que tengan TODA la estructura necesaria para funcionar
// Basado en: lib/main.dart - SIMPLIFICADO para funciones básicas

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:evilent_app/core/utils/app_theme.dart';

/// Widget que envuelve tests con TODA la infraestructura necesaria
/// ✅ Incluye: MaterialApp, ProviderScope, Tema
class TestAppWrapper extends StatelessWidget {
  final Widget child;
  
  const TestAppWrapper({
    super.key,
    required this.child,
  });
  
  @override
  Widget build(BuildContext context) {
    return ProviderScope(
      child: MaterialApp(
        theme: AppTheme.lightTheme,
        home: Scaffold(
          body: child,
        ),
      ),
    );
  }
}

/// ✅ Helper para envolver widgets simples
/// Valida que el widget renderice correctamente con el tema y providers
Widget wrapWithTestApp(Widget widget) {
  return TestAppWrapper(
    child: widget,
  );
}

