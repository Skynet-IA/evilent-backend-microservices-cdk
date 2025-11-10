# 🧪 Testing - EVILENT App

Guía de testing para el proyecto EVILENT.

## 📊 **Estado Actual: 40 Tests ✅**

- ✅ **Validation** (22 tests) - Validación de emails, contraseñas, códigos
- ✅ **AuthService** (11 tests) - Errores de dominio, enums, instanciación  
- ✅ **AuthProvider** (7 tests) - Estado inicial, signInOrSignUp, signOut

---

## 📁 Estructura

```
test/
├── unit/                     # Tests unitarios (lógica pura)
│   ├── services/            # Tests de servicios (AuthService, etc.)
│   ├── providers/           # Tests de providers (Riverpod)
│   └── utils/               # Tests de utilidades (Validation, etc.)
├── widget/                   # Tests de widgets (UI)
│   ├── screens/             # Tests de pantallas completas
│   └── components/          # Tests de componentes reutilizables
└── integration/              # Tests de integración (flujos completos)
```

---

## 🚀 Comandos Útiles

### Correr todos los tests
```bash
flutter test
```

### Correr tests específicos
```bash
# Solo tests unitarios
flutter test test/unit/

# Solo tests de widgets
flutter test test/widget/

# Un archivo específico
flutter test test/unit/utils/validation_test.dart
```

### Tests con cobertura
```bash
# Generar reporte de cobertura
flutter test --coverage

# Ver cobertura en HTML (requiere lcov instalado)
genhtml coverage/lcov.info -o coverage/html
open coverage/html/index.html
```

### Watch mode (auto-ejecuta al guardar)
```bash
flutter test --watch
```

---

## 📋 Patrón AAA (Arrange-Act-Assert)

Todos los tests siguen este patrón:

```dart
test('Descripción del test', () {
  // Arrange: Preparar datos y mocks
  final input = 'usuario@ejemplo.com';
  
  // Act: Ejecutar la función que queremos testear
  final resultado = Validation.validateEmail(input);
  
  // Assert: Verificar que el resultado es el esperado
  expect(resultado, null);
});
```

---

## 🎯 Convenciones

### Nombres de archivos
- Test files: `nombre_del_archivo_test.dart`
- Mismo nombre que el archivo original + `_test`
- Ejemplo: `validation.dart` → `validation_test.dart`

### Nombres de tests
- Usar español (mismo idioma del código)
- Descripción clara de qué se está testeando
- Formato: `'Función debe comportamiento esperado'`
- Ejemplo: `'Email válido debe retornar null'`

### Organización con groups
```dart
void main() {
  group('Validation -', () {
    group('validateEmail', () {
      test('Email válido debe retornar null', () { /* ... */ });
      test('Email inválido debe retornar error', () { /* ... */ });
    });
    
    group('validatePassword', () {
      test('Password válido debe retornar null', () { /* ... */ });
      test('Password corto debe retornar error', () { /* ... */ });
    });
  });
}
```

---

## 🔧 Crear Mocks (cuando sean necesarios)

### Con Mockito
Los mocks se crean directamente en el archivo de test cuando se necesiten:

```dart
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';

// 1. Definir qué clases queremos mockear
@GenerateMocks([AuthService, ConnectivityService])
void main() {
  // Los tests van aquí
}

// 2. Generar los mocks con build_runner
// flutter pub run build_runner build

// 3. Usar el mock en los tests
test('Ejemplo de uso', () async {
  final mockAuthService = MockAuthService();
  when(mockAuthService.signIn(any, any)).thenAnswer((_) async => true);
  
  // ... resto del test
});
```

**Nota:** Solo creamos mocks cuando los necesitamos para aislar la unidad bajo prueba.

---

## 📊 Metas de Cobertura

- **Mínimo:** 70%
- **Ideal:** 80%+
- **Crítico:** services/ y providers/ deben tener >90%

---

## ✅ Checklist antes de PR

- [ ] Todos los tests pasan (`flutter test`)
- [ ] Cobertura >70% en archivos nuevos
- [ ] Tests para casos felices (happy path)
- [ ] Tests para casos de error (error path)
- [ ] Tests para edge cases (valores límite)

---

## 📚 Recursos

- [Flutter Testing](https://docs.flutter.dev/testing)
- [Mockito Documentation](https://pub.dev/packages/mockito)
- [Riverpod Testing](https://riverpod.dev/docs/essentials/testing)

---

**¡Happy Testing!** 🎯

