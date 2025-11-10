// ignore_for_file: deprecated_member_use

// Pantalla de bienvenida con imagen de fondo, opciones de autenticación social y navegación a login.

import 'package:evilent_app/shared/extensions/theme_extensions.dart';
import 'package:evilent_app/core/utils/app_colors.dart';
import 'package:evilent_app/core/utils/app_images.dart';
import 'package:evilent_app/core/utils/app_routes.dart';
import 'package:flutter/material.dart';
import 'dart:ui';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:evilent_app/core/utils/app_icons.dart';

/// Pantalla de introducción/bienvenida
///
/// Pantalla stateless que presenta la marca y opciones de autenticación.
/// Primera pantalla que ve el usuario al abrir la app.
///
/// **Características:**
/// • Imagen de fondo con overlay gradiente
/// • Botones de autenticación social (Google, Apple, Facebook)
/// • Navegación a LoginScreen
class IntroScreen extends StatelessWidget {
  const IntroScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // ┌─────────────────────────────────────────────────────────────────┐
          // │ 🖼️ IMAGEN DE FONDO                                              │
          // └─────────────────────────────────────────────────────────────────┘
          //
          // Positioned.fill hace que la imagen cubra toda la pantalla
          // BoxFit.cover asegura que cubra sin distorsión
          Positioned.fill(
            child: Image.asset(
              AppImages.fondo,
              fit: BoxFit.cover,
            ),
          ),

          // ┌─────────────────────────────────────────────────────────────────┐
          // │ 🌈 OVERLAY CON GRADIENTE                                        │
          // └─────────────────────────────────────────────────────────────────┘
          //
          // Gradiente que oscurece la parte inferior de la imagen
          // Mejora la legibilidad del contenido sobre la imagen
          //
          // • startColor: Transparente (no afecta la parte superior)
          // • endColor: primaryColor con opacidad (oscurece abajo)
          // • startPosition: 0.6 → gradiente comienza al 60% de altura
          // • endPosition: 1.0 → gradiente termina al 100% (abajo)
          context.themedGradientOverlay(
            startColor: AppColors.transparent,
            endColor: context.primaryColor.withOpacity(0.9),
            startPosition: 0.6,
            endPosition: 1.0,
          ),

          // ┌─────────────────────────────────────────────────────────────────┐
          // │ 📝 CONTENIDO PRINCIPAL                                          │
          // └─────────────────────────────────────────────────────────────────┘
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: EdgeInsets.symmetric(
                  horizontal: context.spacingXL + context.spacingXL,
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    SizedBox(height: context.spacingXL),
                    
                    // ┌─────────────────────────────────────────────────────────┐
                    // │ 🏷️ LOGO Y MARCA                                         │
                    // └─────────────────────────────────────────────────────────┘
                    //
                    // Logo con color del tema (se adapta a tema claro/oscuro)
                    Image.asset(
                      AppImages.logo,
                      height: context.avatarSizeLarge,
                      color: context.onPrimaryColor,
                    ),
                    Text(
                      'Evilent',
                      style: context.headlineLarge.copyWith(letterSpacing: 1.2),
                    ),
                    SizedBox(height: context.spacingMassive * 3),

                    // ┌─────────────────────────────────────────────────────────┐
                    // │ 🔗 BOTONES DE AUTENTICACIÓN SOCIAL                      │
                    // └─────────────────────────────────────────────────────────┘
                    //
                    // Botones con efecto glassmorphism (ver _SocialButton)
                    // TODO: Implementar funcionalidad de OAuth cuando esté lista
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        _SocialButton(icon: AppIcons.google),
                        _SocialButton(icon: AppIcons.apple),
                        _SocialButton(icon: AppIcons.facebook),
                      ],
                    ),
                    
                    SizedBox(height: context.spacingLarge),
                    _buildDivider(context),
                    SizedBox(height: context.spacingLarge),
                    
                    // ┌─────────────────────────────────────────────────────────┐
                    // │ 🚀 BOTÓN PRINCIPAL                                      │
                    // └─────────────────────────────────────────────────────────┘
                    //
                    // Navega a LoginScreen usando rutas nombradas
                    // • fullWidth: ocupa todo el ancho disponible
                    // • backgroundColor: personalizado para destacar
                    context.themedButton(
                      text: 'Adelante',
                      onPressed: () {
                        Navigator.pushNamed(context, AppRoutes.login);
                      },
                      fullWidth: true,
                      borderRadius: context.radiusLarge,
                      backgroundColor: context.onSecondaryColor,
                    ),
                    
                    SizedBox(height: context.spacingXL),

                    // ┌─────────────────────────────────────────────────────────┐
                    // │ 🔗 ENLACES DE AYUDA                                     │
                    // └─────────────────────────────────────────────────────────┘
                    //
                    // Enlaces adicionales (contacto, soporte, etc.)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        TextButton(
                          onPressed: () {
                            // TODO: Implementar pantalla de contacto
                          },
                          child: Text(
                            'Contacta con nosotros',
                            style: context.labelMedium.copyWith(
                              color: context.onPrimaryColor,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// 📏 Helper para crear divisor visual
  /// 
  /// Crea un Divider con color del tema y opacidad reducida
  /// para separar secciones de contenido visualmente
  Widget _buildDivider(BuildContext context) {
    return Divider(
      color: context.onPrimaryColor.withOpacity(0.3),
      indent: context.spacingXS,
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🧊 WIDGET REUTILIZABLE: BOTÓN SOCIAL CON GLASSMORPHISM
// ═══════════════════════════════════════════════════════════════════════════════
//
// 🎯 **PROPÓSITO:**
// Widget privado reutilizable que muestra un botón social con efecto de cristal.
//
// 🎨 **EFECTO GLASSMORPHISM:**
// • BackdropFilter con blur → efecto de cristal esmerilado
// • Color con baja opacidad (0.15) → transparencia
// • Border sutil → definición de bordes
//
// 📝 **USO:**
// ```dart
// _SocialButton(icon: AppIcons.google)
// ```
//
// 🔧 **PARÁMETROS:**
// • [icon] - IconData del ícono a mostrar (Google, Apple, Facebook)
// ═══════════════════════════════════════════════════════════════════════════════

/// 🧊 Botón social con efecto glassmorphism
///
/// Widget privado que crea un botón con efecto de cristal esmerilado.
/// Usa BackdropFilter para el blur y colores semitransparentes.
///
/// **Parámetros:**
/// • [icon] - Ícono del proveedor social (FontAwesome)
class _SocialButton extends StatelessWidget {
  final IconData icon;
  
  const _SocialButton({required this.icon});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(context.radiusLarge),
      child: BackdropFilter(
        // ┌─────────────────────────────────────────────────────────────┐
        // │ 🪟 GLASSMORPHISM EFFECT                                     │
        // └─────────────────────────────────────────────────────────────┘
        //
        // BackdropFilter aplica blur al contenido detrás del widget
        // sigmaX/sigmaY: intensidad del blur (8.0 = blur moderado)
        filter: ImageFilter.blur(sigmaX: 8.0, sigmaY: 8.0),
        child: Container(
          width: context.spacingHuge,
          height: context.spacingHuge,
          decoration: BoxDecoration(
            // Color semitransparente (0.15) para efecto de cristal
            color: context.onPrimaryColor.withOpacity(0.15),
            borderRadius: BorderRadius.circular(context.radiusLarge),
            // Border sutil para definir el contorno
            border: Border.all(
              color: context.onPrimaryColor.withOpacity(0.2),
              width: context.spacingTiny,
            ),
          ),
          child: Center(
            child: FaIcon(
              icon,
              color: context.onPrimaryColor,
              size: context.spacingLarge,
            ),
          ),
        ),
      ),
    );
  }
}