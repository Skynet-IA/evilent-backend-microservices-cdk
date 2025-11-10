// Pantalla de recuperación de contraseña donde el usuario ingresa su email.
// No revela si el email existe (previene enumeración de usuarios).

import 'package:evilent_app/shared/extensions/theme_extensions.dart';
import 'package:evilent_app/core/providers/auth_provider.dart';
import 'package:evilent_app/core/services/auth_service.dart';
import 'package:evilent_app/core/utils/app_routes.dart';
import 'package:evilent_app/core/utils/app_icons.dart';
import 'package:evilent_app/core/utils/validation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// 🔑 Pantalla de recuperación de contraseña
///
/// Consume estado reactivo de Riverpod y delega lógica de negocio al AuthProvider.
/// Implementa validación nativa de Flutter y manejo robusto de errores.
class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 📝 ESTADO LOCAL DE LA UI                                                │
  // └─────────────────────────────────────────────────────────────────────────┘
  
  /// 🔑 Form key para validación nativa de Flutter
  final _formKey = GlobalKey<FormState>();
  
  /// 📧 Controlador del campo de email
  final _emailController = TextEditingController();
  
  /// 🔄 Estado de carga durante el envío del código
  bool _isLoading = false;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 🔄 LÓGICA DE NEGOCIO (Delegada a AuthProvider)                          │
  // └─────────────────────────────────────────────────────────────────────────┘

  /// Envía el código de recuperación al email del usuario
  /// 
  /// ✅ Valida el formulario usando Form validation nativa
  /// ✅ Delega la lógica de negocio al AuthProvider
  /// ✅ Maneja la navegación según el resultado
  Future<void> _sendResetCode() async {
    // ✅ VALIDACIÓN DELEGADA: Flutter valida automáticamente el campo
    if (!_formKey.currentState!.validate()) {
      return; // ❌ Si no es válido, no continúa
    }
    
    setState(() => _isLoading = true);

    try {
      // 👇 Delegamos la lógica de negocio al AuthProvider
      await ref.read(authProvider.notifier).forgotPassword(
        email: _emailController.text.trim(),
      );

      // 🔒 NOTA DE SEGURIDAD:
      // AWS Cognito NO revela si un email existe o no por razones de seguridad.
      // Siempre muestra el mismo mensaje, independientemente de si el usuario existe.
      // Esto previene ataques de enumeración de usuarios.
      
      if (mounted) {
        // ✅ Mensaje ambiguo de seguridad (no revela si el email existe)
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text(
              'Si el correo está registrado, recibirás un código de recuperación.'
            ),
            backgroundColor: context.primaryColor,
            duration: const Duration(seconds: 4),
          ),
        );

        // 🚀 Navegar a la pantalla de verificación de código
        // El usuario podrá intentar ingresar el código (si lo recibió)
        Navigator.of(context).pushNamed(
          AppRoutes.resetCode,
          arguments: {'email': _emailController.text.trim()},
        );
      }
    } on UserNotFoundError {
      // ❌ Este catch probablemente nunca se ejecutará debido al comportamiento
      // de seguridad de AWS Cognito, pero lo mantenemos por si acaso.
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text(
              'Si el correo está registrado, recibirás un código de recuperación.'
            ),
            backgroundColor: context.primaryColor,
            duration: const Duration(seconds: 4),
          ),
        );
        
        // Navegamos de todos modos (seguridad por obscuridad)
        Navigator.of(context).pushNamed(
          AppRoutes.resetCode,
          arguments: {'email': _emailController.text.trim()},
        );
      }
    } on AuthError catch (e) {
      // ❌ Solo mostramos errores técnicos reales (red, servidor, etc.)
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.message),
            backgroundColor: context.errorColor,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 🎨 UI BUILD                                                              │
  // └─────────────────────────────────────────────────────────────────────────┘

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        centerTitle: true,
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: EdgeInsets.symmetric(
              horizontal: context.spacingXL + context.spacingMedium,
            ),
            // ┌─────────────────────────────────────────────────────────────────┐
            // │ 📝 FORM WRAPPER                                                 │
            // └─────────────────────────────────────────────────────────────────┘
            //
            // Form + GlobalKey permite validación nativa de Flutter
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  SizedBox(height: context.spacingLarge),
                  
                  // ────────────────────────────────────────────────────────────────
                  // 📝 INSTRUCCIONES
                  // ────────────────────────────────────────────────────────────────
                  Text(
                    'Introduce tu correo electrónico y te enviaremos un código para restablecer tu contraseña.',
                    style: context.bodyMedium.copyWith(
                      color: context.onSurfaceColor.withOpacity(0.7),
                    ),
                    textAlign: TextAlign.center,
                  ),
                  SizedBox(height: context.spacingXL),
                  
                  // ────────────────────────────────────────────────────────────────
                  // 📧 CAMPO DE EMAIL
                  // ────────────────────────────────────────────────────────────────
                  //
                  // • validator: Validation.validateEmail (delegado)
                  // • textInputAction: done → envía el formulario con Enter
                  // • onFieldSubmitted: ejecuta submit (UX mejorada)
                  context.themedTextFormField(
                    controller: _emailController,
                    labelText: 'Correo electrónico',
                    prefixIcon: AppIcons.email,
                    keyboardType: TextInputType.emailAddress,
                    textInputAction: TextInputAction.done,
                    validator: Validation.validateEmail,
                    onFieldSubmitted: (_) => _sendResetCode(),
                    enabled: !_isLoading,
                  ),
                  SizedBox(height: context.spacingXL),
                  
                  // ────────────────────────────────────────────────────────────────
                  // 🔘 BOTÓN DE ENVÍO
                  // ────────────────────────────────────────────────────────────────
                  //
                  // • isLoading: muestra spinner cuando está procesando
                  // • onPressed: llama _sendResetCode que valida el form
                  // • fullWidth: ocupa todo el ancho disponible
                  context.themedButton(
                    text: 'Enviar código',
                    onPressed: _sendResetCode,
                    isLoading: _isLoading,
                    fullWidth: true,
                  ),
                  SizedBox(height: context.spacingLarge),
          
                  // Enlace para volver al login
                  TextButton(
                    onPressed: _isLoading ? null : () {
                      Navigator.of(context).pop(); // Simplemente volver atrás
                    },
                    child: Text(
                      'Inicia sesión',
                      style: context.bodyMedium.copyWith(
                        color: context.primaryColor,
                        decoration: TextDecoration.underline,
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
}
