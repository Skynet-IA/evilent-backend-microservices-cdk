import 'package:evilent_app/features/common/screens/amplify_error_screen.dart';
import 'package:evilent_app/core/utils/app_routes.dart';
import 'package:evilent_app/core/utils/app_theme.dart';
import 'package:evilent_app/core/utils/app_colors.dart';
import 'package:evilent_app/core/utils/app_dimens.dart';
import 'package:evilent_app/core/utils/locator.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

// --- Imports añadidos ---
import 'package:amplify_flutter/amplify_flutter.dart';
import 'package:amplify_auth_cognito/amplify_auth_cognito.dart';
import 'package:evilent_app/amplifyconfiguration.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:evilent_app/shared/widgets/connectivity_banner.dart';
import 'package:evilent_app/core/services/theme_service.dart';

// --- Sistema de Manejo de Errores ---
import 'dart:async';
import 'dart:ui';
import 'dart:math' as math;
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:evilent_app/core/error_system/app_error.dart';
import 'package:evilent_app/core/error_system/error_utils.dart';
import 'package:evilent_app/core/services/auth_service.dart';

// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 FUNCIÓN PRINCIPAL - ENTRY POINT DE LA APLICACIÓN
// ═══════════════════════════════════════════════════════════════════════════════
//
// 🎯 CRÍTICO: Esta función configura el sistema de manejo global de errores.
//
// ⚠️ IMPORTANTE: Todo el código de la app debe ejecutarse dentro de runZonedGuarded
// para evitar errores de "Zone mismatch" y garantizar captura de errores asincrónicos.
//
// 📋 ORDEN DE INICIALIZACIÓN:
// 1. WidgetsFlutterBinding - Inicializa bindings de Flutter
// 2. _configureGlobalErrorHandling() - Configura captura global de errores
// 3. dotenv.load() - Carga variables de entorno (.env)
// 4. runApp() - Inicia la aplicación
//
// 🛡️ CAPTURA DE ERRORES:
// • runZonedGuarded captura errores asincrónicos no manejados
// • Los errores se convierten a AppError y se registran automáticamente
// ═══════════════════════════════════════════════════════════════════════════════
Future<void> main() async {
  runZonedGuarded<Future<void>>(() async {
      WidgetsFlutterBinding.ensureInitialized();
      await _configureGlobalErrorHandling();
      await dotenv.load(fileName: "prod.env");
      runApp(const AppInitializer());
    }, (error, stackTrace) {
      final appError = AppError.fromException(error, stackTrace);
      ErrorUtils.logAndReport(appError);
    },
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🛡️ CONFIGURACIÓN DE MANEJO GLOBAL DE ERRORES
// ═══════════════════════════════════════════════════════════════════════════════
//
// 🎯 CRÍTICO: Configura 3 niveles de captura de errores en toda la aplicación.
//
// 📋 NIVELES DE CAPTURA:
// 1. FlutterError.onError - Errores de widgets (build, layout, paint)
// 2. PlatformDispatcher.instance.onError - Errores de plataforma/OS
// 3. ErrorWidget.builder - Widget personalizado para errores visuales
//
// 🔄 FLUJO:
// Error → AppError.fromException() → ErrorUtils.logAndReport() → Log/Analytics
//
// ⚠️ IMPORTANTE: 
// • En debug: Muestra pantalla roja de Flutter (_forceShowProductionErrorWidget = false)
// • En producción: Muestra widget personalizado con glassmorphism
// ═══════════════════════════════════════════════════════════════════════════════
Future<void> _configureGlobalErrorHandling() async {
  // Captura errores de widgets (build, layout, paint)
  FlutterError.onError = (FlutterErrorDetails details) {
    final appError = AppError.fromException(
      details.exception,
      details.stack,
      {
        'library': details.library,
        'context': details.context?.toString(),
        'informationCollector': details.informationCollector?.toString(),
      },
    );
    
    ErrorUtils.logAndReport(appError);
    
    if (kDebugMode) {
      FlutterError.presentError(details);
    }
  };
  
  // Captura errores de plataforma/OS
  PlatformDispatcher.instance.onError = (error, stack) {
    final appError = AppError.fromException(error, stack);
    ErrorUtils.logAndReport(appError);
    return true;
  };
  
  // Configura widget de error personalizado
  ErrorWidget.builder = (FlutterErrorDetails details) {
    const bool _forceShowProductionErrorWidget = true; // true = ver widget bonito en debug
    
    if (kReleaseMode || _forceShowProductionErrorWidget) {
      return _buildProductionErrorWidget(details);
    }
    
    // ignore: dead_code
    return ErrorWidget(details.exception);
  };
}

/// Widget de error para producción con glassmorphism.
/// Se muestra cuando un widget falla en lugar de la pantalla roja de Flutter.
Widget _buildProductionErrorWidget(FlutterErrorDetails details) {
  return Material(
    child: Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.secondary.withOpacity(0.8),
            AppColors.primary.withOpacity(0.9),
            AppColors.accent.withOpacity(0.8),
          ],
        ),
      ),
      child: SafeArea(
        child: Center(
          child: Padding(
            padding: EdgeInsets.all(AppDimens.spacingXL),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(AppDimens.radiusLarge),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                child: Container(
                  padding: EdgeInsets.all(AppDimens.spacingXL),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(AppDimens.radiusLarge),
                    border: Border.all(
                      color: Colors.white.withOpacity(0.2),
                      width: 1.5,
                    ),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Icono de error
                      Container(
                        padding: EdgeInsets.all(AppDimens.spacingLarge),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.1),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          Icons.error_outline_rounded,
                          size: 64,
                          color: Colors.white,
                        ),
                      ),
                      
                      SizedBox(height: AppDimens.spacingXL),
                      
                      // Título
                      Text(
                        'Algo salió mal',
                        style: TextStyle(
                          fontSize: AppDimens.fontHeadline,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                          letterSpacing: -0.5,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      
                      SizedBox(height: AppDimens.spacingMedium),
                      
                      // Mensaje descriptivo
                      Text(
                        'Hemos detectado un problema inesperado.\nEstamos trabajando para solucionarlo.',
                        style: TextStyle(
                          fontSize: AppDimens.fontBody,
                          color: Colors.white.withOpacity(0.9),
                          height: 1.5,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      
                      SizedBox(height: AppDimens.spacingXL),
                      
                      // Información técnica (solo en debug)
                      if (kDebugMode) ...[
                        Container(
                          padding: EdgeInsets.all(AppDimens.spacingMedium),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(AppDimens.radiusMedium),
                          ),
                          child: Text(
                            '🔍 Error: ${details.exception.toString()}',
                            style: TextStyle(
                              fontSize: AppDimens.fontCaption,
                              color: Colors.white.withOpacity(0.7),
                              fontFamily: 'monospace',
                            ),
                            maxLines: 3,
                            overflow: TextOverflow.ellipsis,
                            textAlign: TextAlign.center,
                          ),
                        ),
                        SizedBox(height: AppDimens.spacingLarge),
                      ],
                      
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.info_outline,
                            size: 16,
                            color: Colors.white.withOpacity(0.7),
                          ),
                          SizedBox(width: AppDimens.spacingSmall),
                          Text(
                            'El error ha sido registrado automáticamente',
                            style: TextStyle(
                              fontSize: AppDimens.fontCaption,
                              color: Colors.white.withOpacity(0.7),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}

/// Estados posibles de la configuración de Amplify.
enum AmplifyState { loading, success, error }

/// Widget que maneja la inicialización de Amplify y servicios antes de mostrar la app.
/// Incluye reintentos automáticos con backoff exponencial si falla la configuración.
class AppInitializer extends StatefulWidget {
  const AppInitializer({super.key});

  @override
  State<AppInitializer> createState() => _AppInitializerState();
}

class _AppInitializerState extends State<AppInitializer> {
  AmplifyState _amplifyState = AmplifyState.loading;
  int _retryCount = 0;
  static const int _maxRetries = 3;
  bool _isDisposed = false;

  @override
  void initState() {
    super.initState();
    _configureAmplifyWithRetry();
  }
  
  @override
  void dispose() {
    _isDisposed = true;
    super.dispose();
  }

  /// Configura Amplify con reintentos automáticos usando backoff exponencial.
  /// Espera 2^attempt segundos entre reintentos (2s, 4s, 8s).
  Future<void> _configureAmplifyWithRetry() async {
    for (int attempt = 0; attempt <= _maxRetries; attempt++) {
      try {
        _retryCount = attempt;
        await _configureAmplify();
        _retryCount = 0;
        return;
      } catch (e) {
        if (attempt < _maxRetries) {
          final delay = Duration(seconds: math.pow(2, attempt).toInt());
          debugPrint('🔄 Retry attempt ${attempt + 1}/$_maxRetries in ${delay.inSeconds}s');
          await Future.delayed(delay);
        } else {
          debugPrint('💥 All $_maxRetries retry attempts failed');
          if (!_isDisposed && mounted) {
            setState(() {
              _amplifyState = AmplifyState.error;
            });
          }
          rethrow;
        }
      }
    }
  }

  /// Configura Amplify verificando si ya está inicializado.
  Future<void> _performAmplifyConfiguration() async {
    final auth = AmplifyAuthCognito();
    if (!Amplify.isConfigured) {
      await Amplify.addPlugin(auth);
      await Amplify.configure(amplifyconfig);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🔧 CONFIGURACIÓN DE AMPLIFY Y SERVICIOS
  // ═══════════════════════════════════════════════════════════════════════════════
  //
  // 🎯 CRÍTICO: Esta función inicializa Amplify y todos los servicios de la app.
  //
  // 📋 ORDEN DE INICIALIZACIÓN:
  // 1. Amplify (AWS Cognito) - timeout 30s
  // 2. setupLocator() - Registra servicios en GetIt:
  //    • AuthService (singleton lazy)
  //    • ThemeService (singleton async)
  //    • ConnectivityService (singleton async)
  // 3. locator.allReady() - Espera inicialización de servicios async
  //
  // ⚠️ IMPORTANTE: 
  // • Solo verificamos AuthService para evitar registro duplicado
  // • setupLocator() registra TODOS los servicios, no solo AuthService
  // • Error: "Type X is already registered" indica que setupLocator() ya se ejecutó
  //
  // 🛡️ MANEJO DE ERRORES:
  // • TimeoutException → tipo: server
  // • AmplifyException → tipo: authentication
  // • SocketException → tipo: network
  // • Otros → AppError.fromException()
  // ═══════════════════════════════════════════════════════════════════════════════
  Future<void> _configureAmplify() async {
    if (!_isDisposed && mounted) {
      setState(() {
        _amplifyState = AmplifyState.loading;
      });
    }

    try {
      await _performAmplifyConfiguration().timeout(
        const Duration(seconds: 30),
      );

      debugPrint('✅ Amplify configured successfully (attempt $_retryCount)');

      // Registrar servicios en GetIt si no están registrados
      if (!locator.isRegistered<AuthService>()) {
        setupLocator();
      }
      
      // Esperar a que todos los servicios async se inicialicen
      await locator.allReady();

      if (!_isDisposed && mounted) {
        setState(() {
          _amplifyState = AmplifyState.success;
        });
      }
    } on TimeoutException {
      debugPrint('⏰ Amplify configuration timeout after 30 seconds');
      throw AppError(
        type: AppErrorType.server,
        message: 'La configuración está tomando más tiempo del esperado. Reintentando...',
        originalError: 'Configuration timeout',
        context: {'timeout_seconds': 30, 'retry_count': _retryCount},
      );
    } on AmplifyException catch (e, stackTrace) {
      debugPrint('🔐 Amplify-specific error: $e');
      final appError = AppError(
        type: AppErrorType.authentication,
        message: 'Error en el sistema de autenticación. Reintentando...',
        originalError: e,
        stackTrace: stackTrace,
        context: {
          'amplify_error_code': e.runtimeType.toString(),
          'retry_count': _retryCount,
          'component': 'AmplifyInitializer',
        },
      );
      ErrorUtils.logAndReport(appError);
      throw appError;
    } on SocketException catch (e, stackTrace) {
      debugPrint('📶 Network error during Amplify configuration: $e');
      final appError = AppError(
        type: AppErrorType.network,
        message: 'Sin conexión a internet. Verifica tu conexión y reintenta.',
        originalError: e,
        stackTrace: stackTrace,
        context: {'retry_count': _retryCount},
      );
      ErrorUtils.logAndReport(appError);
      throw appError;
    } on Exception catch (e, stackTrace) {
      debugPrint('❌ Unexpected error configuring Amplify: $e');
      final appError = AppError.fromException(
        e, 
        stackTrace,
        {
          'component': 'AmplifyInitializer',
          'step': 'configuration',
          'retry_count': _retryCount,
        },
      );
      ErrorUtils.logAndReport(appError);
      throw appError;
    }

    if (_isDisposed) {
      throw StateError('Widget was disposed during Amplify configuration');
    }
  }

  @override
  Widget build(BuildContext context) {
    return ScreenUtilInit(
      designSize: const Size(375, 812),
      minTextAdapt: true,
      splitScreenMode: true,
      builder: (context, child) {
        switch (_amplifyState) {
          case AmplifyState.loading:
            return MaterialApp(
              debugShowCheckedModeBanner: false,
              home: Scaffold(
                body: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const CircularProgressIndicator(),
                      const SizedBox(height: 16),
                      Text(
                        _retryCount > 0 
                          ? '🔄 Reintentando... ($_retryCount/$_maxRetries)'
                          : '🚀 Configurando aplicación...',
                        style: const TextStyle(fontSize: 16),
                      ),
                    ],
                  ),
                ),
              ),
            );
          case AmplifyState.error:
            return MaterialApp(
              debugShowCheckedModeBanner: false,
              home: AmplifyErrorScreen(onRetry: _configureAmplifyWithRetry),
            );
          case AmplifyState.success:
            return ProviderScope(
              child: const MyApp(),
            );
        }
      },
    );
  }
}

/// Widget principal de la aplicación después de la inicialización exitosa de Amplify.
/// Gestiona temas dinámicos, navegación, y el banner de conectividad.
class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  late ThemeService _themeService;
  bool _isDisposed = false;

  @override
  void initState() {
    super.initState();
    try {
      _themeService = locator<ThemeService>();
      _themeService.addListener(_onThemeChanged);
    } catch (e) {
      debugPrint('🚨 Error initializing ThemeService: $e');
    }
  }

  @override
  void dispose() {
    _isDisposed = true;
    try {
      _themeService.removeListener(_onThemeChanged);
    } catch (e) {
      debugPrint('🚨 Error disposing ThemeService: $e');
    }
    super.dispose();
  }

  /// Listener que reconstruye la UI cuando cambia el tema.
  void _onThemeChanged() {
    if (!_isDisposed && mounted) {
      setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: _themeService.themeMode,
      
      builder: (context, navigator) {
        return GestureDetector(
          // Cierra el teclado al tocar fuera de un TextField
          onTap: () {
            FocusScopeNode currentFocus = FocusScope.of(context);
            if (!currentFocus.hasPrimaryFocus &&
                currentFocus.focusedChild != null) {
              currentFocus.unfocus();
            }
          },
          
          child: Stack(
            children: [
              navigator ?? const SizedBox.shrink(),
              const Positioned(
                bottom: 0,
                left: 0,
                right: 0,
                child: ConnectivityBanner(),
              ),
            ],
          ),
        );
      },

      initialRoute: AppRoutes.authGate,
      onGenerateRoute: AppRoutes.onGenerateRoute,
    );
  }
}