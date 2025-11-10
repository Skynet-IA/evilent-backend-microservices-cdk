import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

/// Un diccionario centralizado para todos los iconos de la aplicación.
///
/// Usar esta clase en lugar de `Icons` o `FontAwesomeIcons` directamente nos permite:
/// 1. Garantizar la consistencia visual en toda la app.
/// 2. Cambiar un icono en un solo lugar y que se actualice en todas partes.
/// 3. Hacer el código de la UI más semántico y legible (`AppIcons.google` vs `FontAwesomeIcons.google`).
class AppIcons {
  // Previene la instanciación de la clase.
  AppIcons._();

  // --- Iconos de Autenticación y UI General ---
  // Usamos FontAwesome para un look más moderno y consistente.
  static const IconData email = FontAwesomeIcons.solidEnvelope;
  static const IconData lock = FontAwesomeIcons.lock;
  static const IconData visibilityOn = FontAwesomeIcons.solidEye;
  static const IconData visibilityOff = FontAwesomeIcons.solidEyeSlash;
  
  // --- Iconos de UI y Estado ---
  static const IconData error = FontAwesomeIcons.circleExclamation;
  static const IconData refresh = FontAwesomeIcons.rotate;

  // --- Iconos Sociales (de intro_screen.dart) ---
  static const IconData google = FontAwesomeIcons.google;
  static const IconData apple = FontAwesomeIcons.apple;
  static const IconData facebook = FontAwesomeIcons.facebook;

  // --- Iconos de Profile Screen ---
  static const IconData person = FontAwesomeIcons.user;
  static const IconData payment = FontAwesomeIcons.creditCard;
  static const IconData location = FontAwesomeIcons.locationDot;
  static const IconData notifications = FontAwesomeIcons.bell;
  // ignore: deprecated_member_use
  static const IconData shoppingBag = FontAwesomeIcons.shoppingBag;
  static const IconData language = FontAwesomeIcons.language;
  static const IconData theme = FontAwesomeIcons.palette;
  static const IconData chevronRight = FontAwesomeIcons.chevronRight;
}
