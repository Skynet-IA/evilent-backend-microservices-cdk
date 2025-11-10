import 'package:evilent_app/core/utils/app_icons.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:evilent_app/core/providers/auth_provider.dart';
import 'package:evilent_app/core/providers/app_data_provider.dart';
import 'package:evilent_app/core/utils/app_routes.dart';
import 'package:evilent_app/shared/extensions/theme_extensions.dart';

/// Pantalla del perfil de usuario.
/// 
/// 🚀 Usa datos pre-cargados del `appDataProvider`:
/// - Perfil del usuario desde el backend
/// - Atributos de Cognito (email, username)
/// 
/// NO hace llamadas HTTP adicionales, todo está pre-cargado.
class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // 🚀 Obtener datos ya cargados del app_data_provider
    final displayName = ref.watch(displayNameProvider);
    final email = ref.watch(userEmailProvider);
    final hasCompleteProfile = ref.watch(hasCompleteProfileProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        centerTitle: true,
        elevation: 0,
        automaticallyImplyLeading: false,
        backgroundColor: context.surfaceColor,
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.symmetric(
          horizontal: context.spacingSmall,
        ),
        child: Column(
          children: [
            // Header con foto de perfil
            _buildProfileHeader(
              context,
              name: displayName,
              email: email ?? 'No disponible',
              hasCompleteProfile: hasCompleteProfile,
            ),
          
            SizedBox(height: context.spacingLarge),
            
            // Sección Account
            _buildAccountSection(context, ref),
            
            SizedBox(height: context.spacingLarge),
            
            // Sección Orders
            _buildOrdersSection(context),
            
            SizedBox(height: context.spacingLarge),
            
            // Sección Preferences
            _buildPreferencesSection(context),
          
            SizedBox(height: context.spacingXL),
            
            // Botón de Logout
            _buildLogoutButton(context, ref),
            
            SizedBox(height: context.spacingXL),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileHeader(
    BuildContext context, {
    required String name,
    required String email,
    required bool hasCompleteProfile,
  }) {
    return Container(
      padding: EdgeInsets.symmetric(vertical: context.spacingXL),
      child: Column(
        children: [
          // Avatar circular
          Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: context.primaryContainerColor,
              image: const DecorationImage(
                image: NetworkImage(
                  'https://randomuser.me/api/portraits/women/44.jpg',
                ),
                fit: BoxFit.cover,
              ),
            ),
          ),
          
          SizedBox(height: context.spacingMedium),
          
          // Nombre del usuario
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                name,
                style: context.titleLarge.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              if (!hasCompleteProfile) ...[
                SizedBox(width: context.spacingXS),
                Icon(
                  Icons.warning_amber_rounded,
                  color: context.errorColor,
                  size: context.iconSizeSmall,
                ),
              ],
            ],
          ),
          
          SizedBox(height: context.spacingXS),
          
          // Email del usuario
          Text(
            email,
            style: context.bodyMedium.copyWith(
              color: context.onSurfaceVariantColor,
            ),
          ),

          // Advertencia de perfil incompleto
          if (!hasCompleteProfile) ...[
            SizedBox(height: context.spacingSmall),
            Container(
              padding: EdgeInsets.symmetric(
                horizontal: context.spacingMedium,
                vertical: context.spacingSmall,
              ),
              decoration: BoxDecoration(
                color: context.errorColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(context.radiusSmall),
              ),
              child: Text(
                '⚠️ Completa tu perfil',
                style: context.bodySmall.copyWith(
                  color: context.errorColor,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildAccountSection(BuildContext context, WidgetRef ref) {
    return _buildSection(
      context,
      title: 'Account',
      items: [
        _ProfileMenuItem(
          icon: AppIcons.person,
          title: 'Edit Profile',
          onTap: () {
            // Navegar a editar perfil y recargar datos al regresar
            Navigator.of(context).pushNamed(AppRoutes.editProfile).then((_) {
              // Recargar datos del usuario después de editar
              ref.invalidate(appDataProvider);
            });
          },
        ),
        _ProfileMenuItem(
          icon: AppIcons.payment,
          title: 'Payment Methods',
          onTap: () {
            // TODO: Navegar a métodos de pago
          },
        ),
        _ProfileMenuItem(
          icon: AppIcons.location,
          title: 'Addresses',
          onTap: () {
            // TODO: Navegar a direcciones
          },
        ),
        _ProfileMenuItem(
          icon: AppIcons.notifications,
          title: 'Notifications',
          onTap: () {
            // TODO: Navegar a notificaciones
          },
        ),
      ],
    );
  }

  Widget _buildOrdersSection(BuildContext context) {
    return _buildSection(
      context,
      title: 'Orders',
      items: [
        _ProfileMenuItem(
          icon: AppIcons.shoppingBag,
          title: 'Order History',
          onTap: () {
            // TODO: Navegar a historial de pedidos
          },
        ),
      ],
    );
  }

  Widget _buildPreferencesSection(BuildContext context) {
    return _buildSection(
      context,
      title: 'Preferences',
      items: [
        _ProfileMenuItem(
          icon: AppIcons.language,
          title: 'Language',
          onTap: () {
            // TODO: Navegar a idioma
          },
        ),
        _ProfileMenuItem(
          icon: AppIcons.theme,
          title: 'Theme',
          onTap: () {
            // TODO: Navegar a tema
          },
        ),
      ],
    );
  }

  Widget _buildSection(
    BuildContext context, {
    required String title,
    required List<_ProfileMenuItem> items,
  }) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: context.spacingMedium,
        vertical: context.spacingSmall,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Título de la sección
          Padding(
            padding: EdgeInsets.symmetric(
              horizontal: context.spacingSmall,
              vertical: context.spacingSmall,
            ),
            child: Text(
              title,
              style: context.titleLarge.copyWith(
                fontWeight: FontWeight.w800,
                color: context.onSurfaceVariantColor,
              ),
            ),
          ),
          
          // Items de la sección
          ...items.map((item) => _buildMenuItem(context, item)).toList(),
        ],
      ),
    );
  }

  Widget _buildMenuItem(BuildContext context, _ProfileMenuItem item) {
    return InkWell(
      onTap: item.onTap,
      borderRadius: BorderRadius.circular(context.radiusSmall),
      child: Padding(
        padding: EdgeInsets.symmetric(
          horizontal: context.spacingSmall,
          vertical: context.spacingMedium,
        ),
        child: Row(
          children: [
            // Icono
            Icon(
              item.icon,
              size: context.iconSizeMedium,
              color: context.onSurfaceVariantColor,
            ),
            
            SizedBox(width: context.spacingMedium),
            
            // Título
            Expanded(
              child: Text(
                item.title,
                style: context.bodyLarge,
              ),
            ),
            
            // Flecha
            Icon(
              AppIcons.chevronRight,
              size: context.iconSizeMedium,
              color: context.outlineVariantColor,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLogoutButton(BuildContext context, WidgetRef ref) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: context.spacingMedium),
      child: SizedBox(
        width: double.infinity,
        height: context.buttonHeightLarge,
        child: OutlinedButton(
          onPressed: () async {
            // Mostrar diálogo de confirmación
            final shouldLogout = await showDialog<bool>(
              context: context,
              builder: (dialogContext) => AlertDialog(
                title: Text('Cerrar sesión', style: context.titleMedium),
                content: Text(
                  '¿Estás seguro de que quieres cerrar sesión?',
                  style: context.bodyMedium,
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.of(dialogContext).pop(false),
                    child: Text('Cancelar', style: context.labelLarge),
                  ),
                  TextButton(
                    onPressed: () => Navigator.of(dialogContext).pop(true),
                    style: TextButton.styleFrom(
                      foregroundColor: context.errorColor,
                    ),
                    child: Text('Cerrar sesión', style: context.labelLarge),
                  ),
                ],
              ),
            );

            if (shouldLogout == true) {
              // Cerrar sesión
              await ref.read(authProvider.notifier).signOut();

              if (context.mounted) {
                Navigator.of(context).pushNamedAndRemoveUntil(
                  AppRoutes.authGate,
                  (route) => false,
                );
              }
            }
          },
          style: OutlinedButton.styleFrom(
            side: BorderSide(color: context.errorColor.withOpacity(0.5)),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(context.radiusMedium),
            ),
          ),
          child: Text(
            'Cerrar sesión',
            style: context.labelLarge.copyWith(
              color: context.errorColor,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ),
    );
  }
}

/// Clase helper para representar un item del menú de perfil
class _ProfileMenuItem {
  final IconData icon;
  final String title;
  final VoidCallback onTap;

  _ProfileMenuItem({
    required this.icon,
    required this.title,
    required this.onTap,
  });
}
