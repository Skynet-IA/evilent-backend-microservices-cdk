// Pantalla de verificación de código de recuperación con auto-submit al completar 6 dígitos.

import 'package:amplify_flutter/amplify_flutter.dart';
import 'package:evilent_app/shared/extensions/theme_extensions.dart';
import 'package:evilent_app/core/providers/auth_provider.dart';
import 'package:evilent_app/core/services/auth_service.dart';
import 'package:evilent_app/core/utils/app_routes.dart';
import 'package:evilent_app/core/utils/validation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pinput/pinput.dart';
/// Implementa validación robusta y manejo de errores específicos.
class ResetCodeScreen extends ConsumerStatefulWidget {
  /// Email del usuario que está recuperando la contraseña
  final String email;

  const ResetCodeScreen({
    super.key,
    required this.email,
  });

  @override
  ConsumerState<ResetCodeScreen> createState() => _ResetCodeScreenState();
}

class _ResetCodeScreenState extends ConsumerState<ResetCodeScreen> {
  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 📝 ESTADO LOCAL DE LA UI                                                │
  // └─────────────────────────────────────────────────────────────────────────┘

  /// 📌 Controlador para el campo PIN de 6 dígitos
  final _pinController = TextEditingController();
  
  /// 🔄 Estados de carga independientes para mejor UX
  bool _isLoading = false;
  bool _isResendingCode = false;

  @override
  void dispose() {
    _pinController.dispose();
    super.dispose();
  }

  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 🔄 LÓGICA DE NEGOCIO (Delegada a AuthProvider)                          │
  // └─────────────────────────────────────────────────────────────────────────┘

  /// SOLUCIÓN SIMPLE: Valida el código con contraseña temporal
  /// 
  /// 🔄 Se ejecuta automáticamente cuando el usuario completa los 6 dígitos.
  /// Previene múltiples envíos verificando `_isLoading` antes de proceder.
  Future<void> _validateCode() async {
    if (_pinController.text.length != 6 || _isLoading) return;

    setState(() => _isLoading = true);

    try {
      safePrint('[ResetCodeScreen] 🔍 Validando código: ${_pinController.text.trim()}');
      
      // 👇 Delegamos la validación al AuthProvider
      final isValid = await ref.read(authProvider.notifier).validateResetCode(
        email: widget.email,
        code: _pinController.text.trim(),
      );
      
      if (isValid) {
        // ✅ Código válido
        safePrint('[ResetCodeScreen] ✅ Código válido - 1 navegando a NewPasswordScreen');
        _navigateToNewPassword();
      }
      
    } on InvalidPasswordError {
      // ✅ PERFECTO: Código válido, contraseña temporal rechazada
      safePrint('[ResetCodeScreen] ✅ Código válido - 2 navegando a NewPasswordScreen');
      _navigateToNewPassword();
      
    } on InvalidCodeError catch (e) {
      // ❌ Código inválido - mostrar error y NO navegar
      safePrint('[ResetCodeScreen] ❌ Código inválido: ${e.message}');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.message),
            backgroundColor: context.errorColor,
          ),
        );
      }
      
    } on AuthError catch (e) {
      // ❌ Verificar si es error de código inválido
      safePrint('[ResetCodeScreen] ❌ AuthError: ${e.message}');
      if (e.message.toLowerCase().contains('invalid code')) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('El código es incorrecto o ha expirado.'),
              backgroundColor: context.errorColor,
            ),
          );
        }
      } else {
        // Otros errores
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(e.message),
              backgroundColor: context.errorColor,
            ),
          );
        }
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }
  
  /// Navega a NewPasswordScreen solo si el código es válido
  void _navigateToNewPassword() {
    if (mounted) {
      Navigator.of(context).pushNamed(
        AppRoutes.newPassword,
        arguments: {
          'email': widget.email,
          'code': _pinController.text.trim(),
        },
      );
    }
  }

  /// Reenvía el código de recuperación al email del usuario
  Future<void> _resendCode() async {
    if (_isResendingCode) return;

    setState(() => _isResendingCode = true);

    try {
      // 👇 Reutilizamos forgotPassword que ya existe
      await ref.read(authProvider.notifier).forgotPassword(email: widget.email);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Código reenviado a ${widget.email}'),
            backgroundColor: context.primaryColor,
          ),
        );
      }
    } on AuthError catch (e) {
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
        setState(() => _isResendingCode = false);
      }
    }
  }

  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 🎨 UI BUILD                                                              │
  // └─────────────────────────────────────────────────────────────────────────┘

  @override
  Widget build(BuildContext context) {
    /// 🎨 Tema personalizado para Pinput usando theme extensions
    final defaultPinTheme = PinTheme(
      width: context.spacingHuge,
      height: context.spacingMassive,
      textStyle: context.displayMedium,
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: BorderRadius.circular(context.radiusMedium),
        border: Border.all(color: context.outlineColor.withOpacity(0.5)),
      ),
    );

    return Scaffold(
      appBar: AppBar(
        centerTitle: true,
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: EdgeInsets.symmetric(horizontal: context.spacingXL + context.spacingMedium),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // ────────────────────────────────────────────────────────────────
                // 📝 INSTRUCCIONES Y EMAIL
                // ────────────────────────────────────────────────────────────────
                Text(
                  'Introduce el código de 6 dígitos:',
                  textAlign: TextAlign.center,
                  style: context.bodyMedium,
                ),
                SizedBox(height: context.spacingSmall),
                Text(
                  widget.email,
                  textAlign: TextAlign.center,
                  style: context.bodyMedium.copyWith(
                    fontWeight: FontWeight.bold,
                    color: context.primaryColor,
                  ),
                ),
                SizedBox(height: context.spacingXL),
                
                // ────────────────────────────────────────────────────────────────
                // 🔢 CAMPO DE CÓDIGO PIN (Solo números, auto-submit al completar 6 dígitos)
                // ────────────────────────────────────────────────────────────────
                Pinput(
                  controller: _pinController,
                  validator: Validation.validateVerificationCode,
                  length: 6,
                  enabled: !_isLoading && !_isResendingCode,
                  keyboardType: TextInputType.number, // 👈 Solo teclado numérico
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly], // 👈 Solo dígitos
                  defaultPinTheme: defaultPinTheme,
                  focusedPinTheme: defaultPinTheme.copyWith(
                    decoration: defaultPinTheme.decoration!.copyWith(
                      border: Border.all(color: context.primaryColor, width: 2),
                    ),
                  ),
                  submittedPinTheme: defaultPinTheme.copyWith(
                    decoration: defaultPinTheme.decoration!.copyWith(
                      border: Border.all(color: context.primaryColor),
                    ),
                  ),
                  onCompleted: (_) => _validateCode(),
                ),
                SizedBox(height: context.spacingMedium),
                
                // ────────────────────────────────────────────────────────────────
                // ⏳ INDICADOR DE CARGA
                // ────────────────────────────────────────────────────────────────
                if (_isLoading)
                  Column(
                    children: [
                      CircularProgressIndicator(
                        color: context.primaryColor,
                      ),
                      SizedBox(height: context.spacingSmall),
                      Text(
                        'Verificando código...',
                        style: context.bodySmall.copyWith(
                          color: context.onSurfaceVariantColor,
                        ),
                      ),
                    ],
                  ),

                SizedBox(height: context.spacingLarge),
          
                // Botón de reenvío
                TextButton(
                  onPressed: _isResendingCode ? null : _resendCode,
                  child: _isResendingCode
                      ? Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            SizedBox(
                              width: context.spacingSmall,
                              height: context.spacingSmall,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(
                                  context.primaryColor,
                                ),
                              ),
                            ),
                            SizedBox(width: context.spacingSmall),
                            Text(
                              'Reenviando...',
                              style: context.bodyMedium.copyWith(
                                color: context.primaryColor,
                              ),
                            ),
                          ],
                        )
                      : Text(
                          '¿No recibiste el código? Reenviar',
                          style: context.bodyMedium.copyWith(
                            color: context.primaryColor,
                          ),
                        ),
                ),
                SizedBox(height: context.spacingLarge),
          
                // Enlace para volver
                TextButton(
                  onPressed: _isLoading ? null : () {
                    Navigator.of(context).pop();
                  },
                  child: Text(
                    'Volver atrás',
                    style: context.bodyMedium.copyWith(
                      color: context.onSurfaceColor.withOpacity(0.7),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
