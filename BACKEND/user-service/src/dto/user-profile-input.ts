/**
 * DTOs (Data Transfer Objects) para User Profile
 * 
 * Interfaces que definen la estructura de datos para validación de entrada
 */

/**
 * Input para crear o actualizar un perfil de usuario
 */
export interface UserProfileInput {
    /**
     * Nombre del usuario (requerido en creación)
     * Máximo 50 caracteres
     */
    first_name?: string;

    /**
     * Apellido del usuario (requerido en creación)
     * Máximo 50 caracteres
     */
    last_name?: string;

    /**
     * Teléfono del usuario (opcional)
     * Formato: +[código país][número]
     * Ejemplo: +1234567890
     */
    phone?: string;

    /**
     * Cognito User ID (agregado automáticamente por el sistema)
     */
    cognito_user_id?: string;
}

/**
 * Input completo con cognito_user_id (usado internamente por repository)
 * Todos los campos son requeridos excepto phone
 */
export interface UserProfileWithCognitoId {
    cognito_user_id: string;
    first_name: string;
    last_name: string;
    phone: string;
}

