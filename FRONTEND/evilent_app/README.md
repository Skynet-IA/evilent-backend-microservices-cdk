# 📱 EVILENT - Frontend

**Aplicación de comercio electrónico desarrollada en Flutter**

[![Flutter](https://img.shields.io/badge/Flutter-3.x-02569B?logo=flutter)](https://flutter.dev)
[![Dart](https://img.shields.io/badge/Dart-3.x-0175C2?logo=dart)](https://dart.dev)
[![Riverpod](https://img.shields.io/badge/Riverpod-2.x-00A8E8)](https://riverpod.dev)
[![AWS Cognito](https://img.shields.io/badge/AWS-Cognito-FF9900?logo=amazon-aws)](https://aws.amazon.com/cognito/)

---

## 🚀 Inicio Rápido

### Requisitos Previos

- Flutter SDK 3.x o superior
- Dart 3.x o superior
- iOS Simulator / Android Emulator
- Cuenta de AWS con Cognito configurado

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd FRONTEND/evilent_app

# Instalar dependencias
flutter pub get

# Configurar variables de entorno
cp prod.env.example prod.env
# Editar prod.env con tus valores

# Ejecutar la app
flutter run
```

---

## 📚 Documentación

Toda la documentación del proyecto está organizada en la carpeta `docs/`:

### 📖 Documentos Principales

- **[DOCS_INDEX.md](./docs/DOCS_INDEX.md)** - Índice completo de documentación
- **[FRONTEND_GUIDE.md](./docs/FRONTEND_GUIDE.md)** - Guía completa del frontend
- **[PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md)** - Estructura detallada del proyecto
- **[NAVEGACION_TABBAR.md](./docs/NAVEGACION_TABBAR.md)** - Sistema de navegación
- **[GUIA_ERROR_SYSTEM.md](./docs/GUIA_ERROR_SYSTEM.md)** - Sistema de manejo de errores

### 🎯 Por Dónde Empezar

**¿Primera vez en el proyecto?**
1. Lee [DOCS_INDEX.md](./docs/DOCS_INDEX.md) para una visión general
2. Sigue [FRONTEND_GUIDE.md](./docs/FRONTEND_GUIDE.md) para configuración y desarrollo
3. Consulta [PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md) para entender la arquitectura

---

## 🏗️ Arquitectura

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

**Ver estructura completa:** [PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md)

---

## ✨ Características

- ✅ **Clean Architecture** con separación de capas
- ✅ **Feature-First Structure** para escalabilidad
- ✅ **Riverpod** para gestión de estado reactivo
- ✅ **AWS Cognito** para autenticación segura
- ✅ **Patrón UPSERT** para operaciones de perfil
- ✅ **Carga automática de datos** al iniciar sesión
- ✅ **Sistema de errores global** con feedback al usuario
- ✅ **Rutas lazy loaded** para mejor performance
- ✅ **Bottom Tab Bar** con 4 secciones principales
- ✅ **Validaciones alineadas** Frontend ↔ Backend

---

## 🧪 Testing

```bash
# Ejecutar todos los tests
flutter test

# Tests con coverage
flutter test --coverage

# Tests específicos
flutter test test/unit/
flutter test test/widget/
flutter test test/integration/
```

---

## 📦 Comandos Útiles

```bash
# Desarrollo
flutter run                    # Ejecutar en modo debug
flutter run --release          # Ejecutar en modo release

# Análisis de código
flutter analyze                # Analizar código
dart format lib/               # Formatear código

# Limpieza
flutter clean                  # Limpiar build
flutter pub get                # Reinstalar dependencias

# Build
flutter build apk              # Build Android APK
flutter build ios              # Build iOS
flutter build web              # Build Web
```

---

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `prod.env` en la raíz del proyecto:

```env
API_BASE_URL=https://tu-api-gateway.execute-api.eu-central-1.amazonaws.com
```

### Amplify Configuration

El archivo `amplifyconfiguration.dart` ya está configurado. Asegúrate de tener:
- User Pool ID correcto
- App Client ID correcto
- Región correcta (eu-central-1)

---

## 🎯 Features Implementados

| Feature | Estado | Descripción |
|---------|--------|-------------|
| **Auth** | ✅ Completo | Login, registro, recuperación de contraseña |
| **Home** | ✅ Completo | Feed principal con productos |
| **Explore** | ✅ Completo | Búsqueda y exploración de productos |
| **Cart** | ✅ Completo | Carrito de compras con badge |
| **Profile** | ✅ Completo | Perfil de usuario con UPSERT |

---

## 🐛 Troubleshooting

### Problemas Comunes

**"Perfil no encontrado" (404)**
- El usuario no tiene perfil en backend
- Solución: Ir a Edit Profile para crear uno

**"Usuario no autenticado" (401)**
- Token JWT inválido o expirado
- Solución: Cerrar sesión y volver a iniciar

**"Timeout al obtener perfil"**
- Backend no responde
- Solución: Verificar que serverless está corriendo y URL en `prod.env`

**Ver más:** [FRONTEND_GUIDE.md - Troubleshooting](./docs/FRONTEND_GUIDE.md#-troubleshooting)

---

## 📊 Estado del Proyecto

- ✅ **Arquitectura:** Profesional y escalable
- ✅ **Compilación:** Sin errores críticos
- ✅ **Documentación:** Completa y actualizada
- ✅ **Features base:** Auth, Home, Explore, Cart, Profile
- ✅ **Backend integration:** User profile con UPSERT
- ⚠️ **Testing:** Pendiente
- ⚠️ **Deployment:** Pendiente

---

## 🤝 Contribuir

1. Lee la documentación en [docs/](./docs/)
2. Sigue las convenciones de código en [PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md)
3. Implementa tests para nuevas funcionalidades
4. Actualiza la documentación si es necesario

---

## 📝 Licencia

Este proyecto es privado y confidencial.

---

## 📞 Soporte

Para preguntas o problemas:
1. Revisa la [documentación](./docs/)
2. Consulta [FRONTEND_GUIDE.md - Troubleshooting](./docs/FRONTEND_GUIDE.md#-troubleshooting)
3. Revisa [GUIA_ERROR_SYSTEM.md](./docs/GUIA_ERROR_SYSTEM.md)

---

**Última actualización:** Octubre 2025  
**Versión:** 1.0.0  
**Estado:** ✅ Listo para desarrollo
