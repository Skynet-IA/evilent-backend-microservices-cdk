/**
 * User Model - Domain Model
 * 
 * Representa la estructura de un usuario en la base de datos
 * REGLA DE ORO: Separar tipos de BD de tipos de API
 */

/**
 * User - Modelo de dominio
 * Este es el formato interno, NO exponemos password_hash a APIs
 */
export interface User {
  id: number;
  email: string;
  password_hash: string;
  first_name: string | null;
  last_name: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

/**
 * UserResponse - Lo que retornamos a través de APIs
 * NUNCA exponemos password_hash
 */
export interface UserResponse {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * CreateUserInput - Lo que recibimos para crear usuario
 */
export interface CreateUserInput {
  email: string;
  password: string; // Plain text (será hasheado en service)
  first_name: string;
  last_name: string;
}

/**
 * UpdateUserInput - Lo que recibimos para actualizar usuario
 */
export interface UpdateUserInput {
  first_name?: string;
  last_name?: string;
  email?: string; // Solo si es permitido cambiar
}

/**
 * Convertir User (DB) a UserResponse (API)
 * Filtra campos sensibles
 */
export const userToResponse = (user: User): UserResponse => ({
  id: user.id,
  email: user.email,
  first_name: user.first_name,
  last_name: user.last_name,
  created_at: user.created_at,
  updated_at: user.updated_at,
});

/**
 * Convertir User[] (DB) a UserResponse[] (API)
 */
export const usersToResponse = (users: User[]): UserResponse[] =>
  users.map(userToResponse);

