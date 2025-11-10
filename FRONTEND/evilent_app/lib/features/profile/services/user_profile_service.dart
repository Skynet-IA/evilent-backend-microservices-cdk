import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../models/user_profile.dart';

/// Servicio para manejar las operaciones de perfil de usuario con el backend
class UserProfileService {
  /// URL base del API (desde variables de entorno)
  static String get _baseUrl {
    final url = dotenv.env['API_BASE_URL'];
    if (url == null || url.isEmpty) {
      throw Exception('API_BASE_URL no está configurada en prod.env');
    }
    return url;
  }

  /// 📖 Obtiene el perfil del usuario autenticado desde el backend
  /// 
  /// **Endpoint:** GET /user
  /// 
  /// **Retorna:**
  /// - `UserProfile` si el perfil existe
  /// - `null` si el perfil no existe (404)
  /// 
  /// **Lanza Exception** si hay un error de conexión o del servidor.
  static Future<UserProfile?> getProfile(String jwtToken) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/user'),
        headers: {
          'Authorization': 'Bearer $jwtToken',
          'Content-Type': 'application/json',
        },
      ).timeout(
        const Duration(seconds: 10),
        onTimeout: () => throw Exception('Timeout al obtener perfil'),
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonResponse = jsonDecode(response.body);
        final data = jsonResponse['data'];
        return UserProfile.fromJson(data);
      } else if (response.statusCode == 404) {
        // Perfil no existe todavía
        return null;
      } else if (response.statusCode == 401) {
        throw Exception('No autorizado - Token inválido');
      } else {
        throw Exception('Error al obtener perfil: ${response.statusCode}');
      }
    } catch (e) {
      if (e.toString().contains('Timeout')) {
        rethrow;
      }
      throw Exception('Error de conexión al obtener perfil: $e');
    }
  }

  /// 💾 Guarda el perfil (crea o actualiza automáticamente - UPSERT)
  /// 
  /// **Endpoint:** POST /user
  /// 
  /// No necesitas saber si es crear o editar, el backend lo maneja automáticamente.
  /// 
  /// **Retorna:** `UserProfile` actualizado desde el servidor
  /// 
  /// **Lanza Exception** si hay validaciones fallidas o error del servidor.
  static Future<UserProfile> saveProfile(
    UserProfile profile,
    String jwtToken,
  ) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/user'),
        headers: {
          'Authorization': 'Bearer $jwtToken',
          'Content-Type': 'application/json',
        },
        body: jsonEncode(profile.toJson()),
      ).timeout(
        const Duration(seconds: 10),
        onTimeout: () => throw Exception('Timeout al guardar perfil'),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final Map<String, dynamic> jsonResponse = jsonDecode(response.body);
        final data = jsonResponse['data'];
        return UserProfile.fromJson(data);
      } else if (response.statusCode == 400) {
        // Errores de validación
        final error = jsonDecode(response.body);
        final message = error['message'] ?? 'Datos inválidos';
        throw Exception('Validación fallida: $message');
      } else if (response.statusCode == 401) {
        throw Exception('No autorizado - Token inválido');
      } else {
        final error = jsonDecode(response.body);
        throw Exception(error['message'] ?? 'Error al guardar perfil');
      }
    } catch (e) {
      if (e.toString().contains('Timeout')) {
        rethrow;
      }
      if (e.toString().contains('Validación')) {
        rethrow;
      }
      throw Exception('Error de conexión al guardar perfil: $e');
    }
  }
}

