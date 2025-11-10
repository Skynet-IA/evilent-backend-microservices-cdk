import 'dart:async';

import 'package:internet_connection_checker/internet_connection_checker.dart';
import 'package:flutter/foundation.dart';

// Servicio de monitoreo de conectividad a internet con stream reactivo.
// Usa internet_connection_checker para verificar conectividad real (no solo WiFi/datos activados).
class ConnectivityService with ChangeNotifier {
  final InternetConnectionChecker _connectionChecker = InternetConnectionChecker.createInstance();
  StreamSubscription<InternetConnectionStatus>? _connectionSubscription;
  
  bool _isConnected = true;
  bool get isConnected => _isConnected;
  
  Stream<bool> get onConnectionStatusChanged => _connectionStatusController.stream;
  final StreamController<bool> _connectionStatusController = StreamController<bool>.broadcast();

  bool _isChecking = false;

  void _log(String message, {String level = 'INFO'}) {
    if (kDebugMode) {
      final timestamp = DateTime.now().toIso8601String().substring(11, 19);
      debugPrint('[$timestamp] [$level] Connectivity: $message');
    }
  }

  /// Inicializa el servicio y comienza a monitorear la conectividad
  Future<void> initialize() async {
    try {
      // Verificación inicial del estado de conectividad
      _isConnected = await _connectionChecker.hasConnection;
      _log('Servicio inicializado. Estado inicial: $_isConnected');
      
      // Configuración del listener para cambios de estado
      _connectionSubscription = _connectionChecker.onStatusChange.listen(
        _handleConnectionStatusChange,
        onError: (error) {
          _log('Error en stream de conectividad', level: 'ERROR');
          _updateConnectionStatus(false);
        },
      );
    } catch (e) {
      _log('Error inicializando servicio: $e', level: 'ERROR');
      _updateConnectionStatus(false);
    }
  }

  /// Maneja los cambios en el estado de conexión
  void _handleConnectionStatusChange(InternetConnectionStatus status) {
    final newStatus = status == InternetConnectionStatus.connected;
    _log('Estado de conexión cambiado: $newStatus');
    _updateConnectionStatus(newStatus);
  }

  /// Actualiza el estado de conexión y notifica a los listeners
  void _updateConnectionStatus(bool newStatus) {
    // Solo actualizar si el estado realmente cambió
    if (_isConnected != newStatus) {
      _isConnected = newStatus;
      
      // Notificar a los ChangeNotifier listeners (para widgets)
      notifyListeners();
      
      // Emitir al stream (para lógica reactiva)
      _connectionStatusController.add(_isConnected);
      
      _log('Estado de conectividad actualizado: $_isConnected');
    }
  }

  /// Fuerza una verificación manual del estado de conectividad
  /// 
  /// Útil cuando el usuario quiere reintentar la conexión manualmente
  /// o cuando se necesita una verificación inmediata
  Future<void> forceCheck() async {
    if (_isChecking) {
      _log('Verificación ya en progreso, ignorando...', level: 'DEBUG');
      return;
    }

    _isChecking = true;
    _log('Iniciando verificación forzada...');

    try {
      final hasConnection = await _connectionChecker.hasConnection;
      _updateConnectionStatus(hasConnection);
      _log('Verificación completada: $hasConnection');
    } catch (e) {
      _log('Error en verificación: $e', level: 'ERROR');
      _updateConnectionStatus(false);
    } finally {
      _isChecking = false;
    }
  }

  /// Limpia los recursos del servicio
  /// 
  /// Debe ser llamado cuando el servicio ya no sea necesario
  /// para evitar memory leaks
  @override
  void dispose() {
    // Se elimina la cancelación del _debounceTimer.
    _connectionSubscription?.cancel();
    _connectionStatusController.close();
    super.dispose();
    _log('Servicio disposed correctamente');
  }

  // ===========================================================================
  // EJEMPLOS DE USO - PATRONES RECOMENDADOS
  // ===========================================================================
  
  /*
  EJEMPLO 1: OBTENER ESTADO ACTUAL (SÍNCRONO)
  -------------------------------------------
  Uso: Para decisiones inmediatas en métodos síncronos como build()
  
  @override
  Widget build(BuildContext context) {
    final isConnected = locator<ConnectivityService>().isConnected;
    
    return ElevatedButton(
      onPressed: isConnected ? _submitData : null,
      child: Text(isConnected ? 'Enviar' : 'Sin conexión'),
    );
  }
  */

  /*
  EJEMPLO 2: ESCUCHAR CAMBIOS CON VALUELISTENABLEBUILDER
  -------------------------------------------------------
  Uso: Ideal para widgets que necesitan reaccionar automáticamente a cambios
  
  ValueListenableBuilder(
    valueListenable: locator<ConnectivityService>(),
    builder: (context, _, __) {
      final isConnected = locator<ConnectivityService>().isConnected;
      
      return Container(
        color: isConnected ? Colors.green : Colors.red,
        child: Text(isConnected ? 'Conectado' : 'Desconectado'),
      );
    },
  )
  */

  /*
  EJEMPLO 3: STREAM REACTIVO PARA LÓGICA DE NEGOCIO
  --------------------------------------------------
  Uso: Para operaciones automáticas como reintentar peticiones pendientes
  
  StreamSubscription<bool>? _connectionSubscription;
  
  @override
  void initState() {
    super.initState();
    _connectionSubscription = locator<ConnectivityService>()
        .onConnectionStatusChanged
        .listen((isConnected) {
      if (isConnected) {
        _retryPendingOperations(); // Reintentar operaciones pendientes
      } else {
        _pauseNetworkCalls(); // Pausar llamadas a API
      }
    });
  }
  
  @override
  void dispose() {
    _connectionSubscription?.cancel();
    super.dispose();
  }
  */

  /*
  EJEMPLO 4: VERIFICACIÓN MANUAL CON FORCECHECK
  ----------------------------------------------
  Uso: Cuando el usuario quiere reintentar manualmente la conexión
  
  ElevatedButton(
    onPressed: () async {
      setState(() => _isChecking = true);
      await locator<ConnectivityService>().forceCheck();
      Future.delayed(Duration(seconds: 1), () {
        if (mounted) setState(() => _isChecking = false);
      });
    },
    child: _isChecking 
        ? CircularProgressIndicator() 
        : Text('Verificar Conexión'),
  )
  */

  /*
  EJEMPLO 5: PATRÓN DE GUARDIA PARA MÉTODOS API
  ----------------------------------------------
  Uso: Verificar conexión antes de realizar operaciones de red
  
  Future<Response> getUserData() async {
    // Guard clause - verificar conexión primero
    if (!locator<ConnectivityService>().isConnected) {
      throw NetworkException('No hay conexión a internet');
    }
    
    try {
      return await _httpClient.get('/user');
    } catch (e) {
      // Si falla, verificar si fue por conexión
      if (!locator<ConnectivityService>().isConnected) {
        _queueForRetry(); // Guardar para reintento posterior
      }
      rethrow;
    }
  }
  */

  /*
  EJEMPLO 6: SISTEMA DE COLA CON REINTENTO AUTOMÁTICO
  ----------------------------------------------------
  Uso: Para operaciones críticas que deben completarse cuando haya conexión
  
  class RequestQueue {
    final List<PendingRequest> _pendingRequests = [];
    final ConnectivityService _connectivity = locator<ConnectivityService>();
    StreamSubscription<bool>? _connectionSubscription;
    
    void addRequest(PendingRequest request) {
      _pendingRequests.add(request);
      _tryProcessRequests();
    }
    
    void _tryProcessRequests() {
      if (_connectivity.isConnected && _pendingRequests.isNotEmpty) {
        _processNextRequest();
      }
    }
    
    void _setupConnectionListener() {
      _connectionSubscription = _connectivity.onConnectionStatusChanged.listen((connected) {
        if (connected) {
          _retryAllPendingRequests();
        }
      });
    }
  }
  */

  /*
  EJEMPLO 7: COMBINACIÓN CON FUTUREBUILDER
  -----------------------------------------
  Uso: Para operaciones que requieren conexión y muestran estado de carga
  
  FutureBuilder<bool>(
    future: _checkConnectivityAndOperation(),
    builder: (context, snapshot) {
      if (snapshot.connectionState == ConnectionState.waiting) {
        return CircularProgressIndicator();
      }
      
      if (!snapshot.hasData || !snapshot.data!) {
        return Text('Operación requiere conexión a internet');
      }
      
      return _buildOperationUI();
    },
  )
  
  Future<bool> _checkConnectivityAndOperation() async {
    final isConnected = locator<ConnectivityService>().isConnected;
    if (!isConnected) return false;
    
    return await _performNetworkOperation();
  }
  */

  /*
  EJEMPLO 8: INYECCIÓN EN SERVICIOS
  ----------------------------------
  Uso: Para servicios que necesitan verificar conectividad
  
  class DataSyncService {
    final ConnectivityService _connectivity;
    
    DataSyncService(this._connectivity);
    
    Future<void> syncData() async {
      if (!_connectivity.isConnected) {
        _log('Posponiendo sync - sin conexión');
        return;
      }
      
      await _performSync();
    }
  }
  
  // Registro en locator:
  locator.registerLazySingleton<DataSyncService>(() => 
    DataSyncService(locator<ConnectivityService>())
  );
  */

  /*
  EJEMPLO 9: PARA TESTING Y MOCKING
  ----------------------------------
  Uso: Para pruebas unitarias con control total del estado de conexión
  
  test('API call fails when offline', () async {
    final mockConnectivity = MockConnectivityService();
    when(() => mockConnectivity.isConnected).thenReturn(false);
    
    final apiService = ApiService(mockConnectivity);
    
    expect(() => apiService.getUserData(), throwsA(isA<NetworkException>()));
  });
  
  // Mock para testing:
  class MockConnectivityService extends Mock implements ConnectivityService {
    @override
    bool get isConnected => super.noSuchMethod(
      Invocation.getter(#isConnected),
      returnValue: false,
    ) as bool;
  }
  */
}