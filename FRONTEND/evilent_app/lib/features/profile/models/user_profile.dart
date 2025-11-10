/// Modelo de perfil de usuario
class UserProfile {
  final String cognitoUserId;
  String? firstName;
  String? lastName;
  String? phone;
  String userType; // 'BUYER' | 'SELLER'
  String? profilePic;

  UserProfile({
    required this.cognitoUserId,
    required this.userType,
    this.firstName,
    this.lastName,
    this.phone,
    this.profilePic,
  });

  /// Crea un UserProfile desde JSON (respuesta del backend)
  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      cognitoUserId: json['cognito_user_id'] ?? '',
      firstName: json['first_name'],
      lastName: json['last_name'],
      phone: json['phone'],
      userType: json['user_type'] ?? 'BUYER',
      profilePic: json['profile_pic'],
    );
  }

  /// Convierte a JSON para enviar al backend (solo campos del DTO EditProfileInput)
  Map<String, dynamic> toJson() {
    return {
      'cognito_user_id': cognitoUserId,
      'first_name': firstName,
      'last_name': lastName,
      'phone': phone,
    };
  }

  /// Crea un perfil vacío para nuevos usuarios
  static UserProfile empty(String cognitoUserId, String userType) {
    return UserProfile(
      cognitoUserId: cognitoUserId,
      userType: userType,
    );
  }
}
