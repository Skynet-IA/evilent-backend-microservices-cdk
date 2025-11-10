import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:evilent_app/core/services/auth_service.dart';
import 'package:evilent_app/core/providers/app_data_provider.dart';
import 'package:evilent_app/shared/extensions/theme_extensions.dart';
import '../models/user_profile.dart';
import '../services/user_profile_service.dart';
import '../widgets/profile_form.dart';

/// Pantalla para editar el perfil del usuario.
/// 
/// 🚀 **Usa el patrón UPSERT:**
/// - Si el usuario tiene perfil → se edita
/// - Si no tiene perfil → se crea
/// 
/// El backend y frontend manejan ambos casos automáticamente.
class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});

  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  UserProfile? _initialProfile;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _loadInitialProfile();
  }

  /// Carga el perfil inicial desde el app_data_provider (ya cargado)
  /// o crea uno nuevo si no existe.
  void _loadInitialProfile() {
    // 🚀 Leer datos pre-cargados del app_data_provider
    final userProfile = ref.read(userProfileProvider);
    final cognitoAttributes = ref.read(cognitoAttributesProvider);
    
    if (userProfile != null) {
      // ✅ Ya existe perfil - editarlo
      _initialProfile = userProfile;
    } else {
      // 🆕 No existe perfil - crear uno nuevo con datos de Cognito
      final cognitoUserId = cognitoAttributes?['userId'] ?? cognitoAttributes?['sub'] ?? 'unknown';
      _initialProfile = UserProfile.empty(cognitoUserId, 'BUYER');
      
      // Mostrar mensaje informativo
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('🆕 Completa tu perfil para continuar'),
              backgroundColor: context.primaryColor,
              duration: const Duration(seconds: 2),
            ),
          );
        }
      });
    }
  }

  /// Guarda el perfil usando el patrón UPSERT
  /// 
  /// El backend decide automáticamente si crear o actualizar.
  Future<void> _saveProfile(UserProfile profile) async {
    setState(() => _isSaving = true);
    try {
      // 1. Obtener token JWT
      final token = await AuthService().getUserJwtToken();
      if (token == null) {
        throw Exception('No se pudo obtener el token de autenticación');
      }

      // 2. Asegurar que el cognito_user_id esté presente
      if (profile.cognitoUserId.isEmpty || profile.cognitoUserId == 'unknown') {
        final cognitoUserId = _extractUserIdFromToken(token);
        if (cognitoUserId != null) {
          profile = UserProfile(
            cognitoUserId: cognitoUserId,
            firstName: profile.firstName,
            lastName: profile.lastName,
            phone: profile.phone,
            userType: profile.userType,
            profilePic: profile.profilePic,
          );
        }
      }

      // 3. 💾 Guardar perfil (UPSERT automático)
      await UserProfileService.saveProfile(profile, token);

      // 4. ♻️ Invalidar el app_data_provider para recargar datos
      ref.invalidate(appDataProvider);

      // 5. ✅ Mostrar mensaje de éxito y regresar
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('✅ Perfil guardado exitosamente'),
            backgroundColor: context.primaryColor,
          ),
        );
        Navigator.of(context).pop();
      }
    } catch (e) {
      // ❌ Mostrar error
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('❌ Error: ${e.toString()}'),
            backgroundColor: context.errorColor,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSaving = false);
      }
    }
  }

  /// Extrae el userId (sub claim) del token JWT de Cognito
  String? _extractUserIdFromToken(String token) {
    try {
      final parts = token.split('.');
      if (parts.length != 3) return null;
      
      final payload = parts[1];
      final normalized = base64Url.normalize(payload);
      final decoded = utf8.decode(base64Url.decode(normalized));
      final Map<String, dynamic> json = jsonDecode(decoded);
      
      return json['sub'] as String?;
    } catch (e) {
      return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Editar Perfil'),
        centerTitle: true,
        elevation: 0,
      ),
      body: _initialProfile != null
          ? Center(
            child: SingleChildScrollView(
              padding: EdgeInsets.symmetric(
                horizontal: context.spacingXL + context.spacingMedium,
              ),
                child: ProfileForm(
                  initialProfile: _initialProfile!,
                  onSave: _saveProfile,
                  isLoading: _isSaving,
                ),
              ),
          )
          : Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(color: context.primaryColor),
                  SizedBox(height: context.spacingLarge),
                  Text(
                    'Cargando perfil...',
                    style: context.bodyLarge,
                  ),
                ],
              ),
            ),
    );
  }
}
