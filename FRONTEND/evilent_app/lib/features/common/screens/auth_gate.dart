import 'package:amplify_flutter/amplify_flutter.dart';
import 'package:evilent_app/core/services/auth_service.dart';
import 'package:evilent_app/core/utils/app_routes.dart';
import 'package:evilent_app/core/utils/locator.dart';
import 'package:flutter/material.dart';

// Widget guardián que verifica sesión y redirige a la pantalla apropiada.
class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  final _authService = locator<AuthService>();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _redirect();
    });
  }

  /// Verifica sesión con timeout de 5s y navega según el resultado.
  Future<void> _redirect() async {
    try {
      safePrint('[AuthGate] 🚀 Iniciando verificación de sesión...');
      
      final isSignedIn = await _authService.isSignedIn().timeout(
        const Duration(seconds: 5),
        onTimeout: () {
          safePrint('[AuthGate] ⏰ Timeout alcanzado - asumiendo no autenticado');
          return false;
        },
      );

      safePrint('[AuthGate] 🔍 isSignedIn resultado: $isSignedIn');

      if (!mounted) return;

      if (isSignedIn) {
        // El usuario tiene una sesión activa -> vamos a la pantalla principal.
        safePrint('[AuthGate] ✅ Usuario autenticado - navegando a Home');
        Navigator.of(context).pushReplacementNamed(AppRoutes.home);
      } else {
        // Si isSignedIn es `false` (por no tener sesión o por timeout),
        // lo llevamos al flujo de introducción para que pueda iniciar sesión.
        safePrint('[AuthGate] ❌ Usuario no autenticado - navegando a Intro');
        Navigator.of(context).pushReplacementNamed(AppRoutes.intro);
      }
    } catch (e) {
      // Si `isSignedIn()` falla con una excepción inesperada (además del timeout),
      // también es seguro redirigir al flujo de introducción.
      if (!mounted) return;
      Navigator.of(context).pushReplacementNamed(AppRoutes.intro);
    }
  }

  @override
  Widget build(BuildContext context) {
    // Mientras se comprueba la sesión, mostramos una pantalla de carga simple.
    // Esto previene un parpadeo de la pantalla de login antes de la redirección.
    return const Scaffold(
      body: Center(
        child: CircularProgressIndicator(),
      ),
    );
  }
}
