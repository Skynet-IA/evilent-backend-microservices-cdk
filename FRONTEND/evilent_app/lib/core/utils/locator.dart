import 'package:evilent_app/core/services/connectivity_service.dart';
import 'package:get_it/get_it.dart';
import 'package:evilent_app/core/services/auth_service.dart';
import 'package:evilent_app/core/services/theme_service.dart';

/// Instancia global de GetIt para Dependency Injection.
final locator = GetIt.instance;

/// Configura todos los servicios de la aplicación.
/// Se llama una vez en main.dart antes de runApp().
void setupLocator() {
  // Lazy Singleton: Se crea solo cuando se solicita por primera vez
  locator.registerLazySingleton<AuthService>(() => AuthService());

  // Singleton Async: Requiere inicialización antes de estar disponible
  locator.registerSingletonAsync<ThemeService>(() async {
    final service = ThemeService.instance;
    await service.initialize();
    return service;
  });

  locator.registerSingletonAsync<ConnectivityService>(() async {
    final service = ConnectivityService();
    await service.initialize();
    return service;
  });
}
