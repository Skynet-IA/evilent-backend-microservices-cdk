import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:evilent_app/core/utils/app_colors.dart';
import 'package:evilent_app/shared/extensions/theme_extensions.dart';
import 'package:evilent_app/features/home/screens/home_screen.dart';
import 'package:evilent_app/features/explore/screens/explore_screen.dart';
import 'package:evilent_app/features/cart/screens/cart_screen.dart';
import 'package:evilent_app/features/profile/screens/profile_screen.dart';
import 'package:evilent_app/core/providers/cart_provider.dart';
import 'package:evilent_app/core/providers/app_data_provider.dart';

/// Shell de navegación principal con Bottom Navigation Bar.
/// 
/// 🚀 **Carga Automática de Datos:**
/// - Perfil del usuario (backend)
/// - Atributos de Cognito (AWS)
/// 
/// Muestra un splash screen mientras carga los datos iniciales.
class AppShell extends ConsumerStatefulWidget {
  const AppShell({super.key});

  @override
  ConsumerState<AppShell> createState() => _AppShellState();
}

class _AppShellState extends ConsumerState<AppShell> {
  int _currentIndex = 0;
  bool _hasShownProfileWarning = false;

  // Páginas principales de la aplicación
  final List<Widget> _pages = const [
    HomeScreen(),      // 🏠 Inicio
    ExploreScreen(),   // 🔍 Explorar
    CartScreen(),      // 🛒 Carrito
    ProfileScreen(),   // 👤 Perfil
  ];

  @override
  Widget build(BuildContext context) {
    // 🚀 Observar la carga de datos iniciales
    final appDataAsync = ref.watch(appDataProvider);
    final cartItemCount = ref.watch(cartItemCountProvider);

    return appDataAsync.when(
      // ⏳ LOADING - Mostrar splash screen mientras carga datos
      loading: () => _buildLoadingScreen(context),
      
      // ❌ ERROR - Mostrar pantalla de error con retry
      error: (error, stack) => _buildErrorScreen(context, error),
      
      // ✅ SUCCESS - Datos cargados, mostrar app normal
      data: (appData) {
        // 🔔 Mostrar notificación si el usuario no tiene perfil completo
        _showProfileWarningIfNeeded(context, appData);

        return Scaffold(
          body: IndexedStack(
            index: _currentIndex,
            children: _pages,
          ),
          bottomNavigationBar: _buildBottomNavBar(cartItemCount),
        );
      },
    );
  }

  /// ⏳ Pantalla de carga mientras se obtienen los datos iniciales
  Widget _buildLoadingScreen(BuildContext context) {
    return Scaffold(
      backgroundColor: context.surfaceColor,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(color: context.primaryColor),
            SizedBox(height: context.spacingLarge),
            Text(
              'Cargando tus datos...',
              style: context.bodyLarge,
            ),
          ],
        ),
      ),
    );
  }

  /// ❌ Pantalla de error con botón de reintentar
  Widget _buildErrorScreen(BuildContext context, Object error) {
    return Scaffold(
      backgroundColor: context.surfaceColor,
      body: Center(
        child: Padding(
          padding: EdgeInsets.all(context.spacingXL),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.error_outline, 
                size: 64, 
                color: context.errorColor,
              ),
              SizedBox(height: context.spacingLarge),
              Text(
                'Error al cargar datos',
                style: context.titleLarge,
                textAlign: TextAlign.center,
              ),
              SizedBox(height: context.spacingSmall),
              Text(
                error.toString(),
                style: context.bodyMedium,
                textAlign: TextAlign.center,
              ),
              SizedBox(height: context.spacingXL),
              ElevatedButton.icon(
                onPressed: () {
                  // Forzar recarga de datos
                  ref.invalidate(appDataProvider);
                },
                icon: const Icon(Icons.refresh),
                label: const Text('Reintentar'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: context.primaryColor,
                  foregroundColor: context.onPrimaryColor,
                  padding: EdgeInsets.symmetric(
                    horizontal: context.spacingXL,
                    vertical: context.spacingMedium,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// 🔔 Muestra notificación si el usuario no tiene perfil completo
  void _showProfileWarningIfNeeded(BuildContext context, AppData appData) {
    if (!appData.hasCompleteProfile && !_hasShownProfileWarning) {
      _hasShownProfileWarning = true;
      
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('⚠️ Completa tu perfil para disfrutar de todas las funciones'),
              action: SnackBarAction(
                label: 'Completar',
                onPressed: () {
                  setState(() => _currentIndex = 3); // Ir a perfil
                },
              ),
              duration: const Duration(seconds: 5),
              backgroundColor: context.primaryColor,
            ),
          );
        }
      });
    }
  }

  Widget _buildBottomNavBar(int cartItemCount) {
    return Container(
      decoration: BoxDecoration(
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        type: BottomNavigationBarType.fixed,
        elevation: 0,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.grey500,
        selectedFontSize: 12,
        unselectedFontSize: 12,
        items: [
          const BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home),
            label: 'Inicio',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.explore_outlined),
            activeIcon: Icon(Icons.explore),
            label: 'Explorar',
          ),
          BottomNavigationBarItem(
            icon: _buildCartIcon(cartItemCount, false),
            activeIcon: _buildCartIcon(cartItemCount, true),
            label: 'Carrito',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            activeIcon: Icon(Icons.person),
            label: 'Perfil',
          ),
        ],
      ),
    );
  }

  Widget _buildCartIcon(int count, bool isActive) {
    return Badge(
      label: Text(count.toString()),
      isLabelVisible: count > 0,
      child: Icon(
        isActive ? Icons.shopping_cart : Icons.shopping_cart_outlined,
      ),
    );
  }
}

