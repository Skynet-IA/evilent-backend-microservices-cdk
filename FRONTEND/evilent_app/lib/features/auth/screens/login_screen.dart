// Pantalla de autenticación con validación de formulario y manejo de estados via Riverpod.

import 'package:evilent_app/shared/extensions/theme_extensions.dart';
import 'package:evilent_app/core/utils/app_colors.dart';
import 'package:evilent_app/core/utils/app_icons.dart';
import 'package:evilent_app/core/utils/app_routes.dart';
import 'package:evilent_app/core/utils/validation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:evilent_app/core/providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  final bool fromConfirmation;
  final bool fromPasswordReset;
  
  const LoginScreen({
    super.key,
    this.fromConfirmation = false,
    this.fromPasswordReset = false,
  });

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  // ┌─────────────────────────────────────────────────────────────────────────┐
  // │ 📝 ESTADO LOCAL DE LA UI                                                │
  // └─────────────────────────────────────────────────────────────────────────┘
  
  /// 🔑 Form key para validación nativa de Flutter
  /// 
  /// Permite:
  /// • Validar todos los campos con `_formKey.currentState!.validate()`
  /// • Guardar valores con `_formKey.currentState!.save()`
  /// • Resetear el form con `_formKey.currentState!.reset()`
  final _formKey = GlobalKey<FormState>();
  
  /// 📧 Controlador del campo de email
  late final TextEditingController _emailController;
  
  /// 🔐 Controlador del campo de contraseña
  late final TextEditingController _passwordController;

  /// 👁️ Estado de visibilidad de la contraseña
  /// 
  /// Toggle entre texto visible y oscurecido (••••)
  bool _isPasswordVisible = false;

  @override
  void initState() {
    super.initState();
    _emailController = TextEditingController();
    _passwordController = TextEditingController();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
  
  /// 🔐 Función para manejar la autenticación
  /// 
  /// ✅ Valida el formulario usando Form validation nativa
  /// ✅ Delega la lógica de negocio al AuthProvider
  /// ✅ Maneja la navegación según el resultado
  Future<void> _handleAuthentication() async {
    // ✅ VALIDACIÓN DELEGADA: Flutter valida automáticamente todos los campos
    if (!_formKey.currentState!.validate()) {
      return; // ❌ Si no es válido, no continúa
    }

    // ✅ Obtener valores limpios
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    // 👇 Delegamos la lógica de negocio al AuthNotifier
    final response = await ref.read(authProvider.notifier).signInOrSignUp(
      email: email,
      password: password,
    );

    // 👇 Reaccionamos al resultado
    // Usamos 'mounted' para evitar errores si el widget se desmonta durante el await
    if (!mounted) return;

    switch (response.result) {
      case AuthResult.success:
        Navigator.of(context).pushReplacementNamed(AppRoutes.home);
        break;
      case AuthResult.needsConfirmation:
        Navigator.of(context).pushNamed(AppRoutes.confirmation);
        break;
      case AuthResult.error:
        // El error ahora viene directamente en la respuesta, evitando
        // leer el estado del provider que podría haber cambiado.
        final error = response.error;
        if (error != null) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(error.toString()),
              backgroundColor: context.errorColor,
            ),
          );
        }
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    // ┌─────────────────────────────────────────────────────────────────────────┐
    // │ 🔄 ESTADO REACTIVO                                                       │
    // └─────────────────────────────────────────────────────────────────────────┘
    //
    // ref.watch() hace que el widget se reconstruya cuando authProvider cambia
    // Útil para mostrar loading state y deshabilitar botones durante auth
    final authState = ref.watch(authProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text('', style: context.displayMedium),
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
            // Valida todos los TextFormField hijos automáticamente
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                mainAxisSize: MainAxisSize.min,
                children: [
                  SizedBox(height: context.spacingXL),
                  
                  // ┌───────────────────────────────────────────────────────────┐
                  // │ 📧 CAMPO DE EMAIL                                         │
                  // └───────────────────────────────────────────────────────────┘
                  //
                  // • validator: Validation.validateEmail (delegado)
                  // • textInputAction: next → mueve focus al siguiente campo
                  // • onFieldSubmitted: hace focus al campo de contraseña
                  context.themedTextFormField(
                    controller: _emailController,
                    labelText: 'Email',
                    prefixIcon: AppIcons.email,
                    keyboardType: TextInputType.emailAddress,
                    textInputAction: TextInputAction.next,
                    validator: Validation.validateEmail,
                    onFieldSubmitted: (_) => FocusScope.of(context).nextFocus(),
                  ),
                  
                  SizedBox(height: context.spacingLarge),
          
                  // ┌───────────────────────────────────────────────────────────┐
                  // │ 🔐 CAMPO DE CONTRASEÑA                                    │
                  // └───────────────────────────────────────────────────────────┘
                  //
                  // • validator: Validation.validatePassword (delegado)
                  // • obscureText: controlado por _isPasswordVisible
                  // • onFieldSubmitted: ejecuta submit (UX mejorada)
                  // • suffixIcon: toggle de visibilidad
                  context.themedTextFormField(
                    controller: _passwordController,
                    labelText: 'Password',
                    prefixIcon: AppIcons.lock,
                    obscureText: !_isPasswordVisible,
                    textInputAction: TextInputAction.done,
                    validator: Validation.validatePassword,
                    onFieldSubmitted: (_) => _handleAuthentication(),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _isPasswordVisible
                            ? AppIcons.visibilityOff
                            : AppIcons.visibilityOn,
                        color: context.outlineColor,
                      ),
                      onPressed: () => setState(() => _isPasswordVisible = !_isPasswordVisible),
                    ),
                  ),
          
                  SizedBox(height: context.spacingXL),
          
                  // ┌───────────────────────────────────────────────────────────┐
                  // │ 🚀 BOTÓN DE SUBMIT                                        │
                  // └───────────────────────────────────────────────────────────┘
                  //
                  // • isLoading: muestra spinner cuando authState.isLoading
                  // • onPressed: llama _handleAuthentication que valida el form
                  // • fullWidth: ocupa todo el ancho disponible
                  context.themedButton(
                    text: 'Continuar',
                    onPressed: _handleAuthentication,
                    isLoading: authState.isLoading,
                    fullWidth: true,
                  ),
          
                  SizedBox(height: context.spacingLarge),
          
                  // ┌───────────────────────────────────────────────────────────┐
                  // │ 🔗 ENLACE PARA RECUPERAR CONTRASEÑA                      │
                  // └───────────────────────────────────────────────────────────┘
                  //
                  // Deshabilitado cuando está loading para evitar navegación múltiple
                  Align(
                    alignment: Alignment.center,
                    child: TextButton(
                      onPressed: authState.isLoading 
                          ? null 
                          : () {
                              Navigator.of(context).pushNamed(AppRoutes.forgotPassword);
                            },
                      child: Text(
                        '¿Olvidaste tu contraseña?',
                        style: context.bodyMedium.copyWith(
                          color: AppColors.info,
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    ),
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