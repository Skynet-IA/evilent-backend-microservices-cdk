// Pantalla de verificación de cuenta con ingreso de código de 6 dígitos.

import 'package:evilent_app/shared/extensions/theme_extensions.dart';
import 'package:evilent_app/core/providers/auth_provider.dart';
import 'package:evilent_app/core/services/auth_service.dart';
import 'package:evilent_app/core/services/secure_storage_service.dart';
import 'package:evilent_app/core/utils/app_routes.dart';
import 'package:evilent_app/core/utils/validation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pinput/pinput.dart';

class ConfirmationScreen extends ConsumerStatefulWidget {
  const ConfirmationScreen({super.key});

  @override
  ConsumerState<ConfirmationScreen> createState() => _ConfirmationScreenState();
}

class _ConfirmationScreenState extends ConsumerState<ConfirmationScreen> {
  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 📝 ESTADO LOCAL DE LA UI                                                │
  // └─────────────────────────────────────────────────────────────────────────┘

  /// 📌 Controlador para el campo PIN de 6 dígitos
  final _pinController = TextEditingController();

  /// 📧 Email pendiente de verificación (se obtiene de SecureStorage)
  String? _pendingEmail;
  
  /// 🔄 Estados de carga independientes para mejor UX
  bool _isLoading = false;
  bool _isResendingCode = false;

  @override
  void initState() {
    super.initState();
    _loadPendingEmail();
  }

  @override
  void dispose() {
    _pinController.dispose();
    super.dispose();
  }

  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 🔄 LÓGICA DE NEGOCIO (Delegada a AuthProvider)                          │
  // └─────────────────────────────────────────────────────────────────────────┘

  /// Obtiene el email pendiente de verificación desde AuthProvider
  Future<void> _loadPendingEmail() async {
    final email = await ref.read(authProvider.notifier).getPendingVerificationEmail();
    if (mounted) {
      setState(() => _pendingEmail = email);
    }
  }

  /// Confirma el código de verificación y activa la cuenta del usuario
  /// 
  /// 🔄 Se ejecuta automáticamente cuando el usuario completa los 6 dígitos.
  /// Previene múltiples envíos verificando `_isLoading` antes de proceder.
  Future<void> _confirmSignUp() async {
    if (_pendingEmail == null || _isLoading) return;

    setState(() => _isLoading = true);

    try {
      await ref.read(authProvider.notifier).confirmSignUp(
        email: _pendingEmail!,
        confirmationCode: _pinController.text.trim(),
      );

      // ✅ Confirmación exitosa: limpiar storage y navegar a login
      await SecureStorageService.instance.clearPendingVerification();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('¡Cuenta confirmada exitosamente! Ya puedes iniciar sesión.'),
            backgroundColor: context.primaryColor,
            duration: const Duration(seconds: 3),
          ),
        );
        
        Navigator.of(context).pushNamedAndRemoveUntil(
          AppRoutes.login,
          (route) => false,
          arguments: {'fromConfirmation': true},
        );
      }
    } on AuthError catch (e) {
      // ❌ Manejo de errores específicos de autenticación
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

  /// Reenvía el código de verificación al email del usuario
  Future<void> _resendCode() async {
    if (_pendingEmail == null || _isResendingCode) return;

    setState(() => _isResendingCode = true);

    try {
      await ref.read(authProvider.notifier).resendSignUpCode(email: _pendingEmail!);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Código reenviado a $_pendingEmail'),
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
                  _pendingEmail ?? 'cargando...',
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
                  onCompleted: (_) => _confirmSignUp(),
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
          
                // Botón secundario para reenviar código
                TextButton(
                  onPressed: (_isLoading || _isResendingCode) ? null : _resendCode,
                  child: _isResendingCode
                      ? SizedBox(
                          height: context.iconSizeSmall,
                          width: context.iconSizeSmall,
                          child: const CircularProgressIndicator(strokeWidth: 2),
                        )
                      : Text(
                          '¿No recibiste el código? Reenviar',
                          style: context.bodyMedium.copyWith(
                            color: context.primaryColor,
                            decoration: TextDecoration.underline,
                          ),
                        ),
                ),

                SizedBox(height: context.spacingXL),
              ],
            ),
          ),
        ),
      ),
    );
  }
}