# 📚 Índice de Documentación - Frontend EVILENT

Bienvenido a la documentación del frontend de EVILENT. Esta guía te ayudará a navegar por todos los recursos disponibles.

---

## 🚀 Inicio Rápido

**¿Primera vez en el proyecto?** Empieza aquí:

1. **[FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md)** - Guía completa del frontend
   - Configuración inicial
   - Arquitectura
   - Sistema de carga de datos
   - Validaciones
   - Integración con backend

---

## 📖 Documentación por Tema

### 🏗️ Arquitectura y Estructura

- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** (21KB)
  - Estructura completa de carpetas
  - Patrones de diseño implementados
  - Sistema de rutas lazy loaded
  - Convenciones de código
  - Navegación rápida por el proyecto

### 🗺️ Navegación

- **[NAVEGACION_TABBAR.md](./NAVEGACION_TABBAR.md)** (5KB)
  - Sistema de Bottom Tab Bar
  - 4 pestañas principales (Home, Explore, Cart, Profile)
  - Badge dinámico en carrito
  - Estado global del carrito

### 🛡️ Sistema de Errores

- **[GUIA_ERROR_SYSTEM.md](./GUIA_ERROR_SYSTEM.md)** (13KB)
  - Arquitectura de manejo de errores
  - Captura global en `main.dart`
  - Clasificación automática de errores
  - Logging centralizado
  - Uso en producción (providers, screens, services)

### 📱 Guía Principal

- **[FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md)** (NUEVO)
  - Guía completa y consolidada
  - Inicio rápido
  - Sistema de carga de datos
  - Validaciones Frontend ↔ Backend
  - Integración con backend (patrón UPSERT)
  - Testing
  - Troubleshooting

---

## 🎯 Documentación por Rol

### Para Desarrolladores Nuevos

1. [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md) - Inicio rápido y configuración
2. [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Entender la estructura
3. [GUIA_ERROR_SYSTEM.md](./GUIA_ERROR_SYSTEM.md) - Manejo de errores

### Para Desarrolladores Experimentados

1. [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Arquitectura detallada
2. [NAVEGACION_TABBAR.md](./NAVEGACION_TABBAR.md) - Sistema de navegación
3. [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md) - Integración con backend

### Para Arquitectos / Tech Leads

1. [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Patrones y decisiones de diseño
2. [GUIA_ERROR_SYSTEM.md](./GUIA_ERROR_SYSTEM.md) - Sistema de errores global
3. [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md) - Sistema de carga de datos

---

## 📂 Estructura de Archivos

```
docs/
├── DOCS_INDEX.md              ← Estás aquí
├── FRONTEND_GUIDE.md          ← Guía principal (NUEVO)
├── PROJECT_STRUCTURE.md       ← Estructura detallada
├── NAVEGACION_TABBAR.md       ← Sistema de navegación
└── GUIA_ERROR_SYSTEM.md       ← Sistema de errores
```

---

## 🔍 Flujos de Lectura Recomendados

### Flujo 1: Setup Inicial (30 min)

```
FRONTEND_GUIDE.md (Sección: Inicio Rápido)
    ↓
Configurar variables de entorno
    ↓
Ejecutar la app
    ↓
FRONTEND_GUIDE.md (Sección: Arquitectura)
```

### Flujo 2: Entender la Arquitectura (1 hora)

```
PROJECT_STRUCTURE.md (Sección: Estructura Actual)
    ↓
PROJECT_STRUCTURE.md (Sección: Sistema de Rutas Lazy Loaded)
    ↓
NAVEGACION_TABBAR.md
    ↓
FRONTEND_GUIDE.md (Sección: Sistema de Carga de Datos)
```

### Flujo 3: Desarrollo de Features (45 min)

```
PROJECT_STRUCTURE.md (Sección: Cómo Agregar Nuevas Rutas)
    ↓
FRONTEND_GUIDE.md (Sección: Integración con Backend)
    ↓
GUIA_ERROR_SYSTEM.md (Sección: Uso en Producción)
```

### Flujo 4: Debugging y Troubleshooting (20 min)

```
GUIA_ERROR_SYSTEM.md (Sección: Troubleshooting)
    ↓
FRONTEND_GUIDE.md (Sección: Troubleshooting)
    ↓
PROJECT_STRUCTURE.md (Sección: Navegación Rápida)
```

---

## 🔎 Búsqueda Rápida

### ¿Cómo hacer...?

| Pregunta | Documento | Sección |
|----------|-----------|---------|
| ¿Cómo configurar el proyecto? | FRONTEND_GUIDE.md | Inicio Rápido |
| ¿Cómo agregar una nueva pantalla? | PROJECT_STRUCTURE.md | Cómo Agregar Nuevas Rutas |
| ¿Cómo manejar errores? | GUIA_ERROR_SYSTEM.md | Uso en Producción |
| ¿Cómo validar formularios? | FRONTEND_GUIDE.md | Validaciones |
| ¿Cómo integrar con backend? | FRONTEND_GUIDE.md | Integración con Backend |
| ¿Cómo navegar entre pantallas? | NAVEGACION_TABBAR.md | Navegación del Flujo |
| ¿Cómo cargar datos al inicio? | FRONTEND_GUIDE.md | Sistema de Carga de Datos |
| ¿Dónde está el código de X? | PROJECT_STRUCTURE.md | Navegación Rápida |

### ¿Dónde está...?

| Busco | Ubicación |
|-------|-----------|
| Providers | `lib/core/providers/` |
| Services | `lib/core/services/` |
| Navegación | `lib/core/navigation/` |
| Sistema de errores | `lib/core/error_system/` |
| Widgets compartidos | `lib/shared/widgets/` |
| Features | `lib/features/[nombre]/` |
| Rutas de un feature | `lib/features/[nombre]/routes/` |
| Modelos | `lib/features/[nombre]/models/` |

---

## 📝 Convenciones de Documentación

### Emojis Utilizados

- 🆕 **Nuevo** - Funcionalidad o archivo reciente
- ✅ **Implementado** - Tarea completada
- ⚠️ **Deprecado** - Código antiguo o en desuso
- 🔄 **Modificado** - Cambio reciente
- 🔴 **Crítico** - Alta prioridad
- 🟡 **En Progreso** - Trabajo actual
- 🟢 **Recomendado** - Mejora sugerida

### Formato de Código

```dart
// Código de ejemplo siempre con sintaxis highlighting
class Example {
  // Comentarios explicativos
}
```

### Enlaces Internos

Todos los enlaces entre documentos usan rutas relativas:
```markdown
[FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md)
```

---

## 🎓 Recursos Externos

### Flutter

- [Flutter Documentation](https://docs.flutter.dev/)
- [Dart Language Tour](https://dart.dev/guides/language/language-tour)
- [Flutter Cookbook](https://docs.flutter.dev/cookbook)

### Riverpod

- [Riverpod Documentation](https://riverpod.dev/)
- [Riverpod Examples](https://github.com/rrousselGit/riverpod/tree/master/examples)

### AWS Amplify

- [Amplify Flutter Documentation](https://docs.amplify.aws/lib/q/platform/flutter/)
- [Cognito User Pools](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html)

### Clean Architecture

- [Clean Architecture (Uncle Bob)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Flutter Project Structure](https://codewithandrea.com/articles/flutter-project-structure/)

---

## ✅ Estado de la Documentación

| Documento | Estado | Última Actualización |
|-----------|--------|---------------------|
| FRONTEND_GUIDE.md | ✅ Completo | Octubre 2025 |
| PROJECT_STRUCTURE.md | ✅ Completo | Octubre 2025 |
| NAVEGACION_TABBAR.md | ✅ Completo | Octubre 2025 |
| GUIA_ERROR_SYSTEM.md | ✅ Completo | Octubre 2025 |
| DOCS_INDEX.md | ✅ Completo | Octubre 2025 |

---

## 🤝 Contribuir a la Documentación

Si encuentras información desactualizada o faltante:

1. Actualiza el documento correspondiente
2. Actualiza la fecha de "Última actualización"
3. Si creas un nuevo documento, agrégalo a este índice

---

**¿Necesitas ayuda?** Revisa la sección de Troubleshooting en [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md) o [GUIA_ERROR_SYSTEM.md](./GUIA_ERROR_SYSTEM.md)

**¿Quieres contribuir?** Sigue las convenciones descritas en [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

