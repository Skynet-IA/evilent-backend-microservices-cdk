// 🎯 APP DATA FIXTURES - Datos que VALIDAN la realidad del código
// Basados en: lib/core/providers/app_data_provider.dart
// REGLA #1: DRY - Centralizamos modelos que se usan en múltiples tests

import 'package:evilent_app/core/providers/app_data_provider.dart';
import 'package:evilent_app/features/profile/models/user_profile.dart';

/// AppData fixtures que reflejan la estructura real del código
class AppDataFixtures {
  /// ✅ PERFIL COMPLETO (hasCompleteProfile = true)
  /// Verifica que firstName, lastName, y phone NO sean nulos
  static AppData get completeProfile => AppData(
    userProfile: UserProfile(
      cognitoUserId: 'us-east-1_123456',
      userType: 'BUYER',
      firstName: 'Juan',
      lastName: 'Pérez',
      phone: '+34666777888',
      profilePic: null,
    ),
    cognitoAttributes: {
      'email': 'test@evilent.com',
      'email_verified': 'true',
    },
  );
  
  /// ❌ PERFIL INCOMPLETO (hasCompleteProfile = false)
  /// Falta firstName o lastName
  static AppData get incompleteProfile => AppData(
    userProfile: UserProfile(
      cognitoUserId: 'us-east-1_123456',
      userType: 'BUYER',
      firstName: null,  // ← FALTA (hace incompleto)
      lastName: null,   // ← FALTA (hace incompleto)
      phone: null,      // ← FALTA (hace incompleto)
      profilePic: null,
    ),
    cognitoAttributes: {
      'email': 'test@evilent.com',
    },
  );
  
  /// ❌ SIN DATOS DE USUARIO
  /// Simula usuario nuevo que no completó perfil
  static AppData get emptyProfile => AppData(
    userProfile: null,
    cognitoAttributes: {
      'email': 'newuser@evilent.com',
    },
  );
}

