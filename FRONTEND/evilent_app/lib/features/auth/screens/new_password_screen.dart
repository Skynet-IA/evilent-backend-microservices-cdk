// Pantalla final del flujo de recuperación para establecer nueva contraseña.

import 'package:evilent_app/shared/extensions/theme_extensions.dart';
import 'package:evilent_app/core/providers/auth_provider.dart';
import 'package:evilent_app/core/services/auth_service.dart';
import 'package:evilent_app/core/utils/app_icons.dart';
import 'package:evilent_app/core/utils/app_routes.dart';
import 'package:evilent_app/core/utils/validation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class NewPasswordScreen extends ConsumerStatefulWidget {
  /// Email del usuario que está restableciendo su contraseña
  final String email;
  
  /// Código de verificación válido previamente verificado
  final String code;

  const NewPasswordScreen({
    super.key,
    required this.email,
    required this.code,
  });

  @override
  ConsumerState<NewPasswordScreen> createState() => _NewPasswordScreenState();
}

class _NewPasswordScreenState extends ConsumerState<NewPasswordScreen> {
  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 📝 ESTADO LOCAL DE LA UI                                                │
  // └─────────────────────────────────────────────────────────────────────────┘
  
  /// 🔑 GlobalKey para manejar validación del formulario
  final _formKey = GlobalKey<FormState>();
  
  /// 📌 Keys individuales para validación de campos específicos
  final _passwordFieldKey = GlobalKey<FormFieldState>();
  final _confirmPasswordFieldKey = GlobalKey<FormFieldState>();
  
  /// 🎯 FocusNodes para detectar cuándo los campos pierden el foco
  final _passwordFocusNode = FocusNode();
  final _confirmPasswordFocusNode = FocusNode();
  
  /// 📝 Controladores de texto para capturar input del usuario
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  
  /// 👁️ Estados de visibilidad de contraseñas
  bool _isPasswordVisible = false;
  bool _isConfirmPasswordVisible = false;
  
  /// 🔄 Estado de carga durante el proceso
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    // Agregar listeners para validar cuando los campos pierden el foco
    _passwordFocusNode.addListener(_validatePasswordOnFocusLoss);
    _confirmPasswordFocusNode.addListener(_validateConfirmPasswordOnFocusLoss);
  }

  @override
  void dispose() {
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _passwordFocusNode.removeListener(_validatePasswordOnFocusLoss);
    _confirmPasswordFocusNode.removeListener(_validateConfirmPasswordOnFocusLoss);
    _passwordFocusNode.dispose();
    _confirmPasswordFocusNode.dispose();
    super.dispose();
  }

  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 🔍 VALIDACIONES                                                          │
  // └─────────────────────────────────────────────────────────────────────────┘

  /// Valida el campo de contraseña cuando pierde el foco para UX mejorada
  void _validatePasswordOnFocusLoss() {
    if (!_passwordFocusNode.hasFocus) {
      _passwordFieldKey.currentState?.validate();
    }
  }

  /// Valida el campo de confirmación cuando pierde el foco
  void _validateConfirmPasswordOnFocusLoss() {
    if (!_confirmPasswordFocusNode.hasFocus) {
      _confirmPasswordFieldKey.currentState?.validate();
    }
  }

  /// Validador personalizado para confirmación de contraseña
  /// 
  /// Verifica que:
  /// • El campo no esté vacío
  /// • La confirmación coincida con la contraseña
  String? _validateConfirmPassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Confirma tu nueva contraseña';
    }
    if (value != _passwordController.text) {
      return 'Las contraseñas no coinciden';
    }
    return null;
  }

  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 🔄 LÓGICA DE NEGOCIO (Delegada a AuthProvider)                          │
  // └─────────────────────────────────────────────────────────────────────────┘

  /// Establece la nueva contraseña del usuario
  /// 
  /// 🔄 Validaciones:
  /// 1. Form validation nativa (formato de contraseña, coincidencia)
  /// 2. Delegación a AuthProvider para establecer contraseña
  /// 3. Manejo de errores específicos (InvalidCodeError, InvalidPasswordError)
  /// 4. Navegación a LoginScreen tras éxito
  Future<void> _setNewPassword() async {
    // ✅ Validar formulario antes de proceder
    if (!(_formKey.currentState?.validate() ?? false)) return;
    
    setState(() => _isLoading = true);

    try {
      // 👇 Delegamos a AuthProvider (arquitectura limpia)
      await ref.read(authProvider.notifier).confirmForgotPassword(
        email: widget.email,
        confirmationCode: widget.code,
        newPassword: _passwordController.text.trim(),
      );

      if (mounted) {
        // ✅ Mostrar mensaje de éxito
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('¡Contraseña restablecida exitosamente!'),
            backgroundColor: context.primaryColor,
            duration: const Duration(seconds: 3),
          ),
        );

        // 🚀 Navegar a LoginScreen limpiando toda la pila de navegación
        Navigator.of(context).pushNamedAndRemoveUntil(
          AppRoutes.login,
          (route) => false,
          arguments: {'fromPasswordReset': true},
        );
      }
    } on InvalidCodeError catch (e) {
      // ❌ Código expiró o es inválido - regresar a pantalla anterior
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.message),
            backgroundColor: context.errorColor,
          ),
        );
        Navigator.of(context).pop();
      }
    } on InvalidPasswordError catch (e) {
      // ❌ Contraseña no cumple requisitos - quedarse en pantalla
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.message),
            backgroundColor: context.errorColor,
          ),
        );
      }
    } on AuthError catch (e) {
      // ❌ Otro error de autenticación
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
            padding: EdgeInsets.all(context.spacingLarge),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // ────────────────────────────────────────────────────────────────
                  // 📝 TÍTULO Y CONTEXTO
                  // ────────────────────────────────────────────────────────────────
                  Text(
                    'Establece tu nueva contraseña',
                    style: context.headlineMedium,
                    textAlign: TextAlign.center,
                  ),
                  SizedBox(height: context.spacingMedium),
          
                  Text(
                    widget.email,
                    style: context.bodyMedium.copyWith(
                      color: context.primaryColor,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  SizedBox(height: context.spacingXL),
          
                  // ────────────────────────────────────────────────────────────────
                  // 🔐 CAMPO DE NUEVA CONTRASEÑA
                  // ────────────────────────────────────────────────────────────────
                  // Usa themedTextFormField con validación de Validation class
                  // y sufijo personalizado para toggle de visibilidad
                  Builder(
                    key: _passwordFieldKey,
                    builder: (context) => context.themedTextFormField(
                      controller: _passwordController,
                      focusNode: _passwordFocusNode,
                      labelText: 'Nueva contraseña',
                      hintText: 'Mínimo 8 caracteres',
                      obscureText: !_isPasswordVisible,
                      prefixIcon: AppIcons.lock,
                      suffixIcon: IconButton(
                        icon: Icon(
                          _isPasswordVisible ? AppIcons.visibilityOff : AppIcons.visibilityOn,
                        ),
                        onPressed: () {
                          setState(() {
                            _isPasswordVisible = !_isPasswordVisible;
                          });
                        },
                      ),
                      keyboardType: TextInputType.text,
                      textInputAction: TextInputAction.next,
                      validator: Validation.validatePassword,
                      onFieldSubmitted: (_) => _confirmPasswordFocusNode.requestFocus(),
                      enabled: !_isLoading,
                    ),
                  ),
                  SizedBox(height: context.spacingLarge),
          
                  // ────────────────────────────────────────────────────────────────
                  // ✅ CAMPO DE CONFIRMACIÓN DE CONTRASEÑA
                  // ────────────────────────────────────────────────────────────────
                  // Validación personalizada para verificar que coincidan
                  Builder(
                    key: _confirmPasswordFieldKey,
                    builder: (context) => context.themedTextFormField(
                      controller: _confirmPasswordController,
                      focusNode: _confirmPasswordFocusNode,
                      labelText: 'Confirmar contraseña',
                      hintText: 'Repite tu nueva contraseña',
                      obscureText: !_isConfirmPasswordVisible,
                      prefixIcon: AppIcons.lock,
                      suffixIcon: IconButton(
                        icon: Icon(
                          _isConfirmPasswordVisible ? AppIcons.visibilityOff : AppIcons.visibilityOn,
                        ),
                        onPressed: () {
                          setState(() {
                            _isConfirmPasswordVisible = !_isConfirmPasswordVisible;
                          });
                        },
                      ),
                      keyboardType: TextInputType.text,
                      textInputAction: TextInputAction.done,
                      validator: _validateConfirmPassword,
                      onFieldSubmitted: (_) => _setNewPassword(),
                      enabled: !_isLoading,
                    ),
                  ),

                  SizedBox(height: context.spacingXL),
          
                  // ────────────────────────────────────────────────────────────────
                  // 🚀 BOTÓN DE ACCIÓN PRINCIPAL
                  // ────────────────────────────────────────────────────────────────
                  // Usa themedButton con loading state integrado
                  context.themedButton(
                    text: 'Restablecer contraseña',
                    onPressed: _setNewPassword,
                    isLoading: _isLoading,
                    fullWidth: true,
                  ),

                  SizedBox(height: context.spacingXL),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
