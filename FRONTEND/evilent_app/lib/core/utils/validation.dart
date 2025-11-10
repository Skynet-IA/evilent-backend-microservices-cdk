/// Utilidades de validación para formularios.
/// Centraliza reglas de validación para mantener consistencia en toda la app.
class Validation {
  
  static String? validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return 'El email es requerido';
    }
    
    final trimmedValue = value.trim();
    
    if (!isValidEmail(trimmedValue)) {
      return 'Ingresa un email válido';
    }
    
    return null;
  }
  
  static bool isValidEmail(String email) {
    final emailRegex = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');
    return emailRegex.hasMatch(email);
  }

  /// Valida contraseña según políticas de AWS Cognito:
  /// Mínimo 8 caracteres, mayúscula, minúscula, número, carácter especial
  static String? validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'La contraseña es requerida';
    }
    
    if (value.length < 8) {
      return 'Mínimo 8 caracteres';
    }
    
    if (!RegExp(r'[A-Z]').hasMatch(value)) {
      return 'Debe contener una mayúscula';
    }
    
    if (!RegExp(r'[a-z]').hasMatch(value)) {
      return 'Debe contener una minúscula';
    }
    
    if (!RegExp(r'[0-9]').hasMatch(value)) {
      return 'Debe contener un número';
    }
    
    if (!RegExp(r'[!@#$%^&*(),.?":{}|<>]').hasMatch(value)) {
      return 'Debe contener un carácter especial';
    }
    
    return null;
  }
  
  static String? validateRequired(String? value, {String? fieldName}) {
    if (value == null || value.trim().isEmpty) {
      return '${fieldName ?? "Este campo"} es requerido';
    }
    return null;
  }
  
  static String? validateVerificationCode(String? value) {
    if (value == null || value.isEmpty) {
      return 'El código es requerido';
    }
    
    if (value.length != 6) {
      return 'El código debe tener 6 dígitos';
    }
    
    if (!RegExp(r'^[0-9]{6}$').hasMatch(value)) {
      return 'El código debe contener solo números';
    }
    
    return null;
  }
  
  /// Valida nombre (solo letras y espacios)
  /// Coincide con backend: 3-32 caracteres
  static String? validateName(String? value, {String? fieldName}) {
    if (value == null || value.trim().isEmpty) {
      return '${fieldName ?? "El nombre"} es requerido';
    }
    
    final trimmedValue = value.trim();
    
    if (trimmedValue.length < 3) {
      return '${fieldName ?? "El nombre"} debe tener al menos 3 caracteres';
    }
    
    if (trimmedValue.length > 32) {
      return '${fieldName ?? "El nombre"} no puede tener más de 32 caracteres';
    }
    
    if (!RegExp(r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$').hasMatch(trimmedValue)) {
      return '${fieldName ?? "El nombre"} solo puede contener letras';
    }
    
    return null;
  }
  
  /// Valida apellido (opcional, pero si se proporciona debe ser válido)
  /// El backend marca last_name como opcional
  static String? validateLastName(String? value) {
    if (value == null || value.trim().isEmpty) {
      return null; // Opcional, permitir vacío
    }
    
    final trimmedValue = value.trim();
    
    if (trimmedValue.length < 2) {
      return 'El apellido debe tener al menos 2 caracteres';
    }
    
    if (trimmedValue.length > 32) {
      return 'El apellido no puede tener más de 32 caracteres';
    }
    
    if (!RegExp(r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$').hasMatch(trimmedValue)) {
      return 'El apellido solo puede contener letras';
    }
    
    return null;
  }
  
  /// Valida teléfono (formato internacional o nacional)
  /// Coincide con backend: 10-15 caracteres (se limpia antes de enviar)
  static String? validatePhone(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'El teléfono es requerido';
    }
    
    final trimmedValue = value.trim();
    
    // Eliminar espacios, guiones y paréntesis para validación
    final cleanPhone = trimmedValue.replaceAll(RegExp(r'[\s\-\(\)]'), '');
    
    // Validar que contenga solo números y opcionalmente + al inicio
    if (!RegExp(r'^\+?[0-9]+$').hasMatch(cleanPhone)) {
      return 'El teléfono solo puede contener números';
    }
    
    // Validar longitud (mínimo 10 dígitos sin contar el +)
    final phoneDigits = cleanPhone.replaceAll('+', '');
    if (phoneDigits.length < 10) {
      return 'El teléfono debe tener al menos 10 dígitos';
    }
    
    if (phoneDigits.length > 15) {
      return 'El teléfono no puede tener más de 15 dígitos';
    }
    
    return null;
  }
  
  /// Limpia el teléfono para enviarlo al backend
  /// Elimina espacios, guiones y paréntesis, pero mantiene el +
  static String cleanPhone(String phone) {
    return phone.trim().replaceAll(RegExp(r'[\s\-\(\)]'), '');
  }
}
