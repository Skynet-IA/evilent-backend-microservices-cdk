# 🛡️ Sistema de Errores - Guía de Producción

**Arquitectura simplificada: Captura global + Logging centralizado + Manejo en UI**

---

## 📁 Estructura del Sistema

```
lib/error_system/core/
├── GUIA_ERROR_SYSTEM.md  ← Esta guía
├── app_error.dart        ← Clasificador automático de errores
└── error_utils.dart      ← Logging en consola
```

**🎯 Filosofía:** Capturar globalmente en `main.dart`, clasificar con `AppError`, registrar con `ErrorUtils`, y manejar específicamente en cada screen/provider.

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────┐
│          FLUJO DE MANEJO DE ERRORES             │
├─────────────────────────────────────────────────┤
│                                                 │
│  1️⃣ CAPTURA GLOBAL (main.dart)                 │
│     ├─ runZonedGuarded         → Async errors  │
│     ├─ FlutterError.onError    → Widget errors │
│     └─ PlatformDispatcher      → Platform err. │
│                                                 │
│  2️⃣ CLASIFICACIÓN (app_error.dart)             │
│     └─ AppError.fromException()                │
│        Exception → AppError tipado             │
│                                                 │
│  3️⃣ LOGGING (error_utils.dart)                 │
│     └─ ErrorUtils.logAndReport()               │
│        └─ debugPrint (consola)                 │
│                                                 │
│  4️⃣ MANEJO EN UI (screens/providers)           │
│     └─ try-catch + SnackBar/Dialog             │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## ⚡ Instalación

El sistema está **completamente configurado** en `main.dart`:

```dart
// main.dart - YA IMPLEMENTADO ✅
void main() async {
  runZonedGuarded(() async {
    // Tu app...
  }, (error, stackTrace) {
    final appError = AppError.fromException(error, stackTrace);
    ErrorUtils.logAndReport(appError);  // ← Logging automático
  });
}
```

**✅ No necesitas configurar nada adicional.**

---

## 🎨 Pantalla de Error Crítico

El proyecto incluye una **pantalla de error personalizada** que se muestra en producción cuando un widget falla, reemplazando la pantalla roja de Flutter.

**🎯 Características:**
- ✅ Diseño profesional con glassmorphism
- ✅ Gradiente de fondo acorde al diseño de la app
- ✅ Mensaje amigable para el usuario
- ✅ Información técnica en modo debug
- ✅ Consistente con el sistema de theming

**📍 Ubicación:** `main.dart` → `_buildProductionErrorWidget()`

**🔧 Cuándo se muestra:**
- Solo en modo **release** (producción)
- Cuando un widget falla durante build/layout/paint
- El error ya fue registrado automáticamente

**💡 En modo debug:** Se muestra la pantalla roja de Flutter para debugging.

---

## 🎯 Uso en Producción

### 1. En Providers

**📍 Ejemplo: auth_provider.dart**

```dart
import 'package:evilent_app/error_system/core/app_error.dart';

class AuthNotifier extends AsyncNotifier<bool> {
  Future<void> signIn(String email, String password) async {
    state = const AsyncLoading();
    try {
      final authService = ref.read(authServiceProvider);
      await authService.signIn(email, password);
      state = const AsyncData(true);
    } on InvalidCredentialsError {
      // Error específico de dominio - manejar con lógica de negocio
      state = AsyncError(
        InvalidCredentialsError('Email o contraseña incorrectos'),
        StackTrace.current,
      );
    } on AuthError catch (e) {
      // Otros errores de autenticación
      state = AsyncError(e, StackTrace.current);
    } catch (e, stack) {
      // Errores inesperados - se capturan en main.dart automáticamente
      final appError = AppError.fromException(e, stack);
      ErrorUtils.logAndReport(appError);
      rethrow; // UI manejará el error
    }
  }
}
```

**🎯 Principio:** Provider maneja errores de negocio, UI muestra feedback al usuario.

---

### 2. En Screens

**📍 Ejemplo: login_screen.dart**

```dart
import 'package:evilent_app/error_system/core/app_error.dart';

class LoginScreen extends ConsumerStatefulWidget {
  Future<void> _handleLogin() async {
    try {
      // Validación local primero
      if (!_formKey.currentState!.validate()) return;

      // Delegar a provider
      await ref.read(authProvider.notifier).signIn(email, password);
      
      // Éxito - navegar
      if (mounted) Navigator.pushReplacementNamed(context, '/home');
      
    } on InvalidCredentialsError {
      // Mostrar feedback específico
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('❌ Email o contraseña incorrectos'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e, stack) {
      // Errores inesperados
      final appError = AppError.fromException(e, stack);
      ErrorUtils.logAndReport(appError);
      
      // Feedback genérico al usuario
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('❌ ${appError.message}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }
}
```

**🎯 Principio:** Screen captura errores del provider y muestra feedback visual inmediato.

---

### 3. En Services

**📍 Ejemplo: auth_service.dart**

```dart
class AuthService {
  Future<void> signIn(String email, String password) async {
    try {
      final result = await Amplify.Auth.signIn(
        username: email,
        password: password,
      );
      return result.isSignedIn;
    } on InvalidStateException {
      throw InvalidCredentialsError('Email o contraseña incorrectos');
    } on NotAuthorizedException {
      throw InvalidCredentialsError('Email o contraseña incorrectos');
    } on AuthException catch (e) {
      safePrint('[AuthService] Error: ${e.message}');
      throw AuthError(e.message);
    }
    // ❌ NO hacer try-catch genérico aquí
    // Dejar que errores inesperados se propaguen a main.dart
  }
}
```

**🎯 Principio:** Service solo convierte excepciones técnicas a errores de dominio, no captura todo.

---

### 4. Operaciones Locales

**📍 Ejemplo: Storage**

```dart
Future<bool> saveUserPreferences(Map<String, dynamic> data) async {
  try {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user_data', jsonEncode(data));
    return true;
  } catch (e, stack) {
    // Registrar error
    final appError = AppError.fromException(e, stack, {
      'operation': 'saveUserPreferences',
      'dataKeys': data.keys.toList(),
    });
    ErrorUtils.logAndReport(appError);
    
    // Mostrar feedback al usuario
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('❌ No se pudieron guardar las preferencias'),
        ),
      );
    }
    return false;
  }
}
```

---

## 📊 Tipos de Error (AppErrorType)

| Tipo | Fatal | Clasificación Automática | Cuándo Usar |
|------|-------|--------------------------|-------------|
| `authentication` | 🔴 Sí | AuthException, "Authentication", "Unauthorized" | Sesión expirada, login fallido |
| `server` | 🔴 Sí | HTTP 500/502/503/504 | Servidor caído, error interno |
| `permission` | 🔴 Sí | HTTP 403/401, PlatformException("permission") | Permisos denegados |
| `network` | 🟡 No | SocketException, "Network", "Connection" | Sin internet, timeout |
| `validation` | 🟡 No | FormatException, ArgumentError | Datos inválidos, formato incorrecto |
| `unknown` | 🔴 Sí | Cualquier otro error | Errores no clasificados |

**🎯 Clasificación Automática:** `AppError.fromException()` analiza el error y asigna el tipo correcto.

---

## 🔧 Funciones Principales

### ✅ `AppError.fromException()` (Clasificador Automático)

**🎯 Propósito:** Convierte cualquier excepción técnica en un AppError clasificado.

```dart
// Uso:
try {
  await rieskyOperation();
} catch (e, stack) {
  final appError = AppError.fromException(e, stack, {
    'context': 'user_profile',
    'userId': currentUser.id,
  });
  ErrorUtils.logAndReport(appError);
}
```

**📍 Llamado desde:**
- main.dart (captura global)
- Screens (errores locales)
- Providers (errores inesperados)

---

### ✅ `ErrorUtils.logAndReport()` (Logging en Consola)

**🎯 Propósito:** Registra errores en consola con formato detallado.

```dart
// Uso:
final appError = AppError.fromException(e, stack);
ErrorUtils.logAndReport(appError);
```

**📋 Qué registra:**
- Timestamp del error
- Tipo y clasificación (AppErrorType)
- Mensaje legible
- Error original técnico
- Stack trace completo (en debug)
- Contexto adicional

**📍 Llamado desde:**
- main.dart (5 veces: captura global)
- Screens/Providers (errores específicos que necesitan logging)

---

### ✅ `AppError.isFatal` (Determinar Severidad)

**🎯 Propósito:** Indica si el error requiere atención inmediata del usuario.

```dart
// Uso:
if (appError.isFatal) {
  // Mostrar diálogo modal o pantalla completa
  showDialog(
    context: context,
    barrierDismissible: false,
    builder: (context) => AlertDialog(
      title: Text('Error Crítico'),
      content: Text(appError.message),
    ),
  );
} else {
  // Mostrar SnackBar pequeño
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text(appError.message)),
  );
}
```

---

## 🎨 Personalización

### Cambiar Mensajes de Error

**Archivo:** `lib/error_system/core/app_error.dart`

```dart
// Línea ~215-275, modificar mensajes en AppError.fromException():

if (error is SocketException) {
  type = AppErrorType.network;
  message = 'Tu mensaje personalizado para sin internet'; // ← Cambiar aquí
}

// O agregar nuevos casos:
} else if (error.toString().contains('tu_error_custom')) {
  type = AppErrorType.validation;
  message = 'Tu mensaje específico para este caso';
```

### Agregar Nuevo Tipo de Error

**Paso 1:** Agregar al enum

```dart
// app_error.dart, línea ~45
enum AppErrorType {
  authentication('authentication'),
  server('server'),
  permission('permission'),
  unknown('unknown'),
  network('network'),
  validation('validation'),
  customType('custom_type'), // ← Agregar nuevo tipo
}
```

**Paso 2:** Agregar clasificación en `fromException()`

```dart
// app_error.dart, línea ~275
} else if (error.toString().contains('tu_condición')) {
  type = AppErrorType.customType;
  message = 'Tu mensaje específico';
```

**Paso 3:** Actualizar `isFatal` si es necesario

```dart
// app_error.dart, línea ~380
bool get isFatal {
  return switch (type) {
    AppErrorType.customType => true, // ← Si es fatal
    // ... resto
  };
}
```

---

## 🚨 Troubleshooting

### Problema: Errores no se están registrando

```dart
// ✅ Solución: Verificar que main.dart tiene runZonedGuarded
void main() {
  runZonedGuarded(() async {
    // Tu app
  }, (error, stackTrace) {
    final appError = AppError.fromException(error, stackTrace);
    ErrorUtils.logAndReport(appError);  // ← Debe estar aquí
  });
}
```

### Problema: Errores se clasifican como "unknown"

```dart
// ✅ Solución: Agregar patrón específico en AppError.fromException()
// app_error.dart, agregar antes del else final:
} else if (error.toString().contains('tu_error_específico')) {
  type = AppErrorType.validation; // O el tipo apropiado
  message = 'Mensaje descriptivo';
```

### Problema: Context no disponible en async operations

```dart
// ✅ Solución: Usar mounted check
Future<void> _asyncOperation() async {
  try {
    await someAsyncCall();
  } catch (e, stack) {
    final appError = AppError.fromException(e, stack);
    ErrorUtils.logAndReport(appError);
    
    if (mounted) {  // ← Verificar antes de usar context
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(appError.message)),
      );
    }
  }
}
```

---

## ✅ Checklist de Producción

- [x] ✅ `runZonedGuarded` configurado en main.dart
- [x] ✅ `FlutterError.onError` configurado en main.dart
- [x] ✅ `PlatformDispatcher.onError` configurado en main.dart
- [x] ✅ Try-catch en operaciones críticas (7 implementados en 5 screens)
- [x] ✅ Validación en formularios con feedback (17 validaciones en 5 screens)
- [x] ✅ Mounted checks antes de usar context (27 checks en 6 screens)
- [x] ✅ Feedback visual al usuario (17 SnackBars en 5 screens)
- [N/A] ℹ️ Logging de errores (Se hace automáticamente en main.dart)

---

## 🎓 Principios del Sistema

1. **Captura Global, Manejo Local:** main.dart captura todo, screens manejan específicamente
2. **Clasificación Automática:** AppError.fromException() traduce excepciones técnicas
3. **Logging Centralizado:** ErrorUtils.logAndReport() es el único punto de registro
4. **Feedback Inmediato:** Screens muestran SnackBar/Dialog según severidad
5. **Código Simple:** Sin código muerto ni promesas futuras, solo lo que funciona ahora

---

**¡Sistema funcional y listo para producción!** 🎯

*Arquitectura simple, sin código muerto, mantenible.*
