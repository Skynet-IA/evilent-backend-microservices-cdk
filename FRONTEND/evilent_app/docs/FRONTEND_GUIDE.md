# 📱 Guía Completa del Frontend - EVILENT

**Fecha:** Octubre 2025  
**Framework:** Flutter 3.x  
**Arquitectura:** Clean Architecture + Feature-First + Riverpod

---

## 📋 Índice

1. [Introducción](#-introducción)
2. [Inicio Rápido](#-inicio-rápido)
3. [Arquitectura](#-arquitectura)
4. [Sistema de Carga de Datos](#-sistema-de-carga-de-datos)
5. [Validaciones](#-validaciones)
6. [Integración con Backend](#-integración-con-backend)
7. [Testing](#-testing)
8. [Troubleshooting](#-troubleshooting)

---

## 🎯 Introducción

EVILENT es una aplicación de comercio electrónico desarrollada en Flutter que implementa:

- ✅ **Clean Architecture** con separación de capas
- ✅ **Feature-First Structure** para escalabilidad
- ✅ **Riverpod** para gestión de estado
- ✅ **AWS Cognito** para autenticación
- ✅ **Patrón UPSERT** para operaciones de perfil
- ✅ **Carga automática de datos** al iniciar sesión
- ✅ **Sistema de errores global** con feedback al usuario

---

## 🚀 Inicio Rápido

### Requisitos Previos

```bash
# Flutter SDK
flutter --version  # 3.x o superior

# Dependencias
flutter pub get

# Variables de entorno
cp prod.env.example prod.env
# Editar prod.env con tus valores
```

### Ejecutar la App

```bash
# Desarrollo
flutter run

# Producción
flutter run --release

# Tests
flutter test
```

### Configuración Inicial

**1. Variables de Entorno (`prod.env`):**
```env
API_BASE_URL=https://tu-api-gateway.execute-api.eu-central-1.amazonaws.com
```

**2. Amplify Configuration:**
- El archivo `amplifyconfiguration.dart` ya está configurado
- Asegúrate de tener el User Pool ID correcto

---

## 🏗️ Arquitectura

### Estructura de Carpetas

```
lib/
├── core/                    # Núcleo de la aplicación
│   ├── navigation/          # Sistema de navegación
│   ├── services/            # Servicios de infraestructura
│   ├── providers/           # Providers de Riverpod
│   ├── error_system/        # Sistema de manejo de errores
│   └── utils/               # Utilidades transversales
│
├── shared/                  # Recursos compartidos
│   ├── widgets/             # Componentes reutilizables
│   └── extensions/          # Extensiones de Flutter
│
├── features/                # Features por dominio
│   ├── auth/                # Autenticación
│   ├── home/                # Feed principal
│   ├── explore/             # Búsqueda y exploración
│   ├── cart/                # Carrito de compras
│   ├── profile/             # Perfil de usuario
│   └── common/              # Screens compartidos
│
└── main.dart                # Punto de entrada
```

**Ver estructura detallada:** [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

---

## 📊 Sistema de Carga de Datos

### Patrón de Inicialización

La app implementa un **patrón de carga automática** que obtiene todos los datos necesarios al iniciar sesión:

```dart
// Flujo de inicio de sesión:
Usuario inicia sesión
    ↓
AuthGate verifica sesión
    ↓
Navega a /home (AppShell)
    ↓
appDataProvider se activa automáticamente
    ↓
⚡ Carga en PARALELO:
    - Perfil del usuario (backend API)
    - Atributos Cognito (AWS SDK)
    ↓
✅ Datos disponibles INSTANTÁNEAMENTE
    ↓
HomeScreen, ProfileScreen, CartScreen
leen del mismo provider (sin recargar)
```

### Providers Centralizados

**Archivo:** `lib/core/providers/app_data_provider.dart`

```dart
// Provider principal que carga todo en paralelo
final appDataProvider = FutureProvider<AppData>((ref) async {
  final results = await Future.wait([
    _loadUserProfile(token),           // GET /user/profile
    authService.getCurrentUserAttributes(), // AWS Cognito SDK
  ]);
  return AppData(profile: results[0], attributes: results[1]);
});

// Providers derivados para acceso específico
final userProfileProvider = Provider<UserProfile?>(...);
final displayNameProvider = Provider<String>(...);
final userEmailProvider = Provider<String>(...);
final hasCompleteProfileProvider = Provider<bool>(...);
```

### Uso en Pantallas

```dart
class MiPantalla extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // ✅ Leer datos pre-cargados (sin HTTP calls)
    final displayName = ref.watch(displayNameProvider);
    final email = ref.watch(userEmailProvider);
    
    return Text('Hola, $displayName');
  }
}
```

### Recargar Datos Manualmente

```dart
// Recargar todo
ref.invalidate(appDataProvider);

// Recargar solo perfil
ref.invalidate(userProfileProvider);
```

### Ventajas del Patrón

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Carga inicial** | Cada pantalla carga sus datos | Una sola carga para todo |
| **Performance** | N peticiones HTTP | 1 batch de peticiones paralelas |
| **UX** | Pantallas lentas individualmente | Splash inicial + app rápida |
| **Código duplicado** | Alto | Bajo (centralizado) |
| **Caché** | No | Sí (Riverpod automático) |

---

## ✅ Validaciones

### Alineación Frontend ↔ Backend

Todas las validaciones están **100% alineadas** entre frontend y backend:

#### **first_name (Nombre)**

| Validación | Frontend | Backend |
|------------|----------|---------|
| Tipo | `String` | `@IsString()` |
| Requerido | ✅ Sí | ✅ Sí |
| Longitud mínima | 3 caracteres | 3 caracteres |
| Longitud máxima | 32 caracteres | 32 caracteres |
| Formato | Solo letras y espacios | Sin restricción adicional |

**Ejemplo válido:** `"Juan"`, `"María José"`  
**Ejemplo inválido:** `"Jo"` (muy corto), `"Juan123"` (números)

#### **last_name (Apellido)**

| Validación | Frontend | Backend |
|------------|----------|---------|
| Tipo | `String?` | `@IsString()` |
| Requerido | ❌ Opcional | ❌ Opcional |
| Longitud mínima | 2 caracteres (si se proporciona) | Sin restricción |
| Longitud máxima | 32 caracteres (si se proporciona) | Sin restricción |

**Ejemplo válido:** `"Pérez"`, `null`, `""`  
**Ejemplo inválido:** `"P"` (muy corto si se proporciona)

#### **phone (Teléfono)**

| Validación | Frontend | Backend |
|------------|----------|---------|
| Tipo | `String` | `@IsString()` |
| Requerido | ✅ Sí | ✅ Sí |
| Longitud mínima | 10 dígitos | 10 caracteres |
| Longitud máxima | 15 dígitos | 15 caracteres |
| Formato | Solo números (+ opcional) | Sin restricción adicional |
| Limpieza | ✅ Se limpian espacios, guiones, paréntesis | N/A |

**Ejemplo de entrada del usuario:** `"+57 (300) 123-4567"`  
**Después de limpieza:** `"+573001234567"` (14 caracteres) ✅

### Implementación de Validaciones

**Archivo:** `lib/core/utils/validation.dart`

```dart
class Validation {
  // Validar nombre (3-32 caracteres, solo letras)
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

  // Validar apellido (opcional, 2-32 caracteres si se proporciona)
  static String? validateLastName(String? value) {
    if (value == null || value.trim().isEmpty) {
      return null; // ✅ Permite vacío (opcional)
    }
    // ... validaciones si se proporciona
  }

  // Limpiar teléfono antes de enviar
  static String cleanPhone(String phone) {
    return phone.trim().replaceAll(RegExp(r'[\s\-\(\)]'), '');
  }
}
```

### Flujo Completo de Validación

```
Usuario llena formulario:
┌─────────────────────────────────┐
│ Nombre: "Juan"                  │ ✅ 3-32 chars
│ Apellido: ""                    │ ✅ Opcional (vacío permitido)
│ Teléfono: "+57 300 123 4567"    │ ✅ 13 dígitos
└─────────────────────────────────┘
          ↓
Frontend valida:
┌─────────────────────────────────┐
│ ✅ Nombre: 4 caracteres (OK)    │
│ ✅ Apellido: vacío (OK)         │
│ ✅ Teléfono: 13 dígitos (OK)    │
└─────────────────────────────────┘
          ↓
Frontend limpia y envía:
{
  "cognito_user_id": "user123",
  "first_name": "Juan",
  "last_name": null,
  "phone": "+573001234567"     // ✅ Limpio (sin espacios)
}
          ↓
Backend valida con DTO:
┌─────────────────────────────────┐
│ ✅ first_name: string, 3-32 OK  │
│ ✅ last_name: opcional, OK      │
│ ✅ phone: string, 14 chars OK   │
└─────────────────────────────────┘
          ↓
Backend sobreescribe cognito_user_id:
input.cognito_user_id = "real_jwt_user_id" // ✅ Del JWT
          ↓
Guardado en BD ✅
```

---

## 🔗 Integración con Backend

### Patrón UPSERT

El frontend implementa un **patrón UPSERT** que simplifica las operaciones de perfil:

```dart
// Frontend NO necesita saber si es crear o editar
await UserProfileService.saveProfile(profile, token);

// Backend decide automáticamente:
// - Si existe → UPDATE
// - Si no existe → CREATE
```

### Cliente HTTP

**Archivo:** `lib/features/profile/services/user_profile_service.dart`

```dart
class UserProfileService {
  static const String _baseUrl = String.fromEnvironment('API_BASE_URL');

  // Obtener perfil del usuario autenticado
  static Future<UserProfile?> getProfile(String jwtToken) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/user/profile'),
        headers: {
          'Authorization': 'Bearer $jwtToken',
          'Content-Type': 'application/json',
        },
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return UserProfile.fromJson(data['data']);
      } else if (response.statusCode == 404) {
        return null; // Perfil no existe
      } else if (response.statusCode == 401) {
        throw Exception('No autorizado');
      } else {
        throw Exception('Error al obtener perfil: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error al obtener perfil: $e');
    }
  }

  // Guardar perfil (UPSERT: crear o actualizar)
  static Future<UserProfile> saveProfile(
    UserProfile profile,
    String jwtToken,
  ) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/user/profile'),
        headers: {
          'Authorization': 'Bearer $jwtToken',
          'Content-Type': 'application/json',
        },
        body: jsonEncode(profile.toJson()),
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return UserProfile.fromJson(data['data']);
      } else if (response.statusCode == 401) {
        throw Exception('No autorizado');
      } else if (response.statusCode == 400) {
        throw Exception('Validación fallida');
      } else {
        throw Exception('Error al guardar perfil: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error al guardar perfil: $e');
    }
  }
}
```

### Modelo de Datos

**Archivo:** `lib/features/profile/models/user_profile.dart`

```dart
/// Modelo de perfil de usuario
class UserProfile {
  final String cognitoUserId;
  final String? firstName;
  final String? lastName;
  final String? phone;
  final String userType;
  final String? profilePic;

  UserProfile({
    required this.cognitoUserId,
    this.firstName,
    this.lastName,
    this.phone,
    required this.userType,
    this.profilePic,
  });

  /// Convierte desde JSON del backend
  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      cognitoUserId: json['cognito_user_id'] as String,
      firstName: json['first_name'] as String?,
      lastName: json['last_name'] as String?,
      phone: json['phone'] as String?,
      userType: json['user_type'] as String? ?? 'BUYER',
      profilePic: json['profile_pic'] as String?,
    );
  }

  /// Convierte a JSON para enviar al backend
  /// Solo envía los campos que el backend acepta (DTO EditProfileInput)
  Map<String, dynamic> toJson() {
    return {
      'cognito_user_id': cognitoUserId,
      'first_name': firstName,
      'last_name': lastName,
      'phone': phone,
    };
  }

  /// Crea un perfil vacío para nuevos usuarios
  static UserProfile empty(String cognitoUserId) {
    return UserProfile(
      cognitoUserId: cognitoUserId,
      userType: 'BUYER',
    );
  }
}
```

### Mapeo de Campos

| Campo Frontend | Campo Backend | Notas |
|----------------|---------------|-------|
| `cognito_user_id` | `cognito_user_id` | Se sobreescribe con JWT en backend |
| `first_name` | `first_name` | Validación: 3-32 caracteres |
| `last_name` | `last_name` | Opcional |
| `phone` | `phone` | Validación: 10-15 caracteres |
| `user_type` | - | No se envía (solo frontend) |
| `profile_pic` | - | No se envía (endpoint separado) |

### Seguridad

**cognito_user_id Siempre del JWT:**

```typescript
// Backend (user-service.ts)
const cognitoUserId = getUserIdFromToken(event);
input.cognito_user_id = cognitoUserId; // ✅ Siempre se sobreescribe del JWT
```

**Flujo de seguridad:**
1. Frontend envía `cognito_user_id` (puede ser cualquier valor)
2. Backend extrae el `cognito_user_id` real del JWT autenticado
3. Backend **SOBREESCRIBE** el valor del input con el del JWT
4. ✅ **IMPOSIBLE** que un usuario modifique el perfil de otro

---

## 🧪 Testing

### Estructura de Tests

```
test/
├── unit/
│   ├── core/
│   │   ├── services/
│   │   └── providers/
│   │       ├── app_data_provider_test.dart
│   │       └── cart_provider_test.dart
│   └── features/
│       ├── auth/
│       ├── profile/
│       │   ├── services/
│       │   │   └── user_profile_service_test.dart
│       │   └── models/
│       │       └── user_profile_test.dart
│       └── cart/
├── widget/
│   └── features/
│       ├── profile/
│       └── cart/
└── integration/
    └── user_profile_flow_test.dart
```

### Ejecutar Tests

```bash
# Todos los tests
flutter test

# Tests unitarios
flutter test test/unit/

# Tests de widgets
flutter test test/widget/

# Tests de integración
flutter test test/integration/

# Con coverage
flutter test --coverage
```

---

## 🐛 Troubleshooting

### "Perfil no encontrado" (404)

**Causa:** El usuario no tiene perfil en backend  
**Solución:** Ir a Edit Profile para crear uno

### "Usuario no autenticado" (401)

**Causa:** Token JWT inválido o expirado  
**Solución:** Cerrar sesión y volver a iniciar

### "Timeout al obtener perfil"

**Causa:** Backend no responde  
**Solución:**
1. Verificar que serverless está corriendo
2. Verificar URL en `prod.env`
3. Verificar conectividad de red

### Datos no se actualizan

**Solución:** Forzar recarga

```dart
ref.invalidate(appDataProvider);
```

### Error de validación en formulario

**Causa:** Datos no cumplen con las validaciones  
**Solución:** Verificar que:
- Nombre: 3-32 caracteres, solo letras
- Apellido: Opcional, 2-32 caracteres si se proporciona
- Teléfono: 10-15 dígitos

---

## 📚 Documentación Adicional

- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Estructura detallada del proyecto
- **[NAVEGACION_TABBAR.md](./NAVEGACION_TABBAR.md)** - Sistema de navegación con Bottom Tab Bar
- **[GUIA_ERROR_SYSTEM.md](./GUIA_ERROR_SYSTEM.md)** - Sistema de manejo de errores

---

## 🎯 Próximos Pasos

### Prioritarios

1. **Testing** 🔴 CRÍTICO
   - [ ] Tests unitarios de providers
   - [ ] Tests de servicios
   - [ ] Tests de widgets
   - [ ] Tests de integración

2. **Backend Integration** 🟡 EN PROGRESO
   - [x] Implementar endpoints de perfil
   - [ ] Conectar a base de datos real
   - [ ] Desplegar a AWS
   - [ ] Configurar URL en prod.env

3. **Features Adicionales** 🟢 RECOMENDADO
   - [ ] Implementar carga de productos
   - [ ] Implementar búsqueda
   - [ ] Implementar funcionalidad del carrito
   - [ ] Agregar gestión de direcciones

### Mejoras Opcionales

4. **Performance** 🟢 OPCIONAL
   - [ ] Implementar caché persistente
   - [ ] Agregar refresh pull-to-refresh
   - [ ] Implementar paginación
   - [ ] Optimizar imágenes

5. **CI/CD** 🟢 OPCIONAL
   - [ ] Configurar GitHub Actions
   - [ ] Análisis automático de código
   - [ ] Builds automáticos

---

**Última actualización:** Octubre 2025  
**Estado:** ✅ Listo para desarrollo  
**Features activos:** Auth, Home, Explore, Cart, Profile

