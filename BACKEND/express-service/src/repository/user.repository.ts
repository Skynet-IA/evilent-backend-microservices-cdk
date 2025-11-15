/**
 * UserRepository - Data Access Layer
 * 
 * REGLA DE ORO: Separar lógica de acceso a datos de lógica de negocio
 * REGLA DE ORO: Logging estructurado en cada operación
 * REGLA DE ORO: Manejo de errores específicos
 * REGLA DE ORO: CERO DUPLICACIÓN - Usar tipos existentes
 */

import { query } from '../db/connection';
import { User } from '../types';
import { CreateUserInput } from '../dto';
import logger from '../utility/logger';

export class UserRepository {
  /**
   * Interfaz compatible con IUserRepository del servicio
   * Permite que el servicio no dependa de la clase directamente
   */
  static findAll = UserRepository.list;

  /**
   * Crear nuevo usuario
   * @param input - Datos del usuario (sin password_hash, se agrega en service)
   * @param passwordHash - Password hasheado (viene del service)
   */
  static async create(input: CreateUserInput, passwordHash: string): Promise<User> {
    try {
      const result = await query(
        `INSERT INTO users (email, password_hash, first_name, last_name, created_at, updated_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id, email, first_name as "firstName", last_name as "lastName", created_at as "createdAt", updated_at as "updatedAt"`,
        [input.email, passwordHash, input.firstName, input.lastName]
      );

      logger.info('User created', {
        userId: result.rows[0].id,
        email: input.email,
      });

      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        // Violación de constraint UNIQUE
        logger.warn('User already exists', { email: input.email });
        throw new Error(`User with email ${input.email} already exists`);
      }

      logger.error('Failed to create user', {
        email: input.email,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Obtener usuario por ID
   */
  static async findById(id: string): Promise<User | null> {
    try {
      const result = await query(
        `SELECT id, email, first_name as "firstName", last_name as "lastName", created_at as "createdAt", updated_at as "updatedAt"
         FROM users 
         WHERE id = $1 AND deleted_at IS NULL`,
        [id]
      );

      if (result.rows.length === 0) {
        logger.debug('User not found', { userId: id });
        return null;
      }

      return result.rows[0];
    } catch (error: any) {
      logger.error('Failed to find user by ID', {
        userId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Obtener usuario por EMAIL (para login)
   */
  static async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await query(
        `SELECT id, email, first_name as "firstName", last_name as "lastName", created_at as "createdAt", updated_at as "updatedAt"
         FROM users 
         WHERE email = $1 AND deleted_at IS NULL`,
        [email.toLowerCase()] // Case-insensitive search
      );

      if (result.rows.length === 0) {
        logger.debug('User not found by email', { email });
        return null;
      }

      return result.rows[0];
    } catch (error: any) {
      logger.error('Failed to find user by email', {
        email,
        error: error.message,
      });
      throw error;
    }
  }


  /**
   * Listar usuarios con paginación
   */
  static async list(page: number = 1, pageSize: number = 10): Promise<{ users: User[]; total: number }> {
    try {
      const offset = (page - 1) * pageSize;

      // Obtener total
      const countResult = await query(
        'SELECT COUNT(*) as total FROM users WHERE deleted_at IS NULL'
      );
      const total = parseInt(countResult.rows[0].total);

      // Obtener usuarios paginados
      const result = await query(
        `SELECT id, email, first_name as "firstName", last_name as "lastName", created_at as "createdAt", updated_at as "updatedAt"
         FROM users 
         WHERE deleted_at IS NULL 
         ORDER BY created_at DESC 
         LIMIT $1 OFFSET $2`,
        [pageSize, offset]
      );

      logger.debug('Users listed', {
        page,
        pageSize,
        total,
        returned: result.rows.length,
      });

      return {
        users: result.rows,
        total,
      };
    } catch (error: any) {
      logger.error('Failed to list users', {
        page,
        pageSize,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Actualizar usuario (parcial)
   */
  static async update(id: string, updates: Partial<Pick<User, 'firstName' | 'lastName' | 'email'>>): Promise<User> {
    try {
      // Construir query dinámica
      const fields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (updates.email !== undefined) {
        fields.push(`email = $${paramCount++}`);
        values.push(updates.email.toLowerCase());
      }
      if (updates.firstName !== undefined) {
        fields.push(`first_name = $${paramCount++}`);
        values.push(updates.firstName);
      }
      if (updates.lastName !== undefined) {
        fields.push(`last_name = $${paramCount++}`);
        values.push(updates.lastName);
      }

      if (fields.length === 0) {
        logger.warn('User update called with no fields', { userId: id });
        const user = await this.findById(id);
        if (!user) throw new Error('User not found');
        return user;
      }

      // Agregar ID al final de los parámetros
      values.push(id);

      const result = await query(
        `UPDATE users 
         SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $${paramCount} AND deleted_at IS NULL
         RETURNING id, email, first_name as "firstName", last_name as "lastName", created_at as "createdAt", updated_at as "updatedAt"`,
        values
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      logger.info('User updated', {
        userId: id,
        updatedFields: Object.keys(updates),
      });

      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') {
        logger.warn('Email already in use', { userId: id });
        throw new Error('Email already in use');
      }

      logger.error('Failed to update user', {
        userId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Soft delete - marcar como eliminado sin eliminar realmente
   */
  static async delete(id: string): Promise<boolean> {
    try {
      const result = await query(
        'UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL',
        [id]
      );

      if (result.rowCount === 0) {
        logger.warn('User not found for deletion', { userId: id });
        throw new Error('User not found');
      }

      logger.info('User soft deleted', { userId: id });
      return true;
    } catch (error: any) {
      logger.error('Failed to delete user', {
        userId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Obtener usuario por ID (incluyendo eliminados) - ADMIN ONLY
   */
  static async findByIdIncludingDeleted(id: string): Promise<User | null> {
    try {
      const result = await query(
        `SELECT id, email, first_name as "firstName", last_name as "lastName", created_at as "createdAt", updated_at as "updatedAt"
         FROM users 
         WHERE id = $1`,
        [id]
      );

      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error: any) {
      logger.error('Failed to find user by ID (including deleted)', {
        userId: id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Verificar si email existe (sin acceso a password_hash)
   */
  static async emailExists(email: string): Promise<boolean> {
    try {
      const result = await query(
        'SELECT 1 FROM users WHERE email = $1 AND deleted_at IS NULL LIMIT 1',
        [email.toLowerCase()]
      );

      return result.rows.length > 0;
    } catch (error: any) {
      logger.error('Failed to check email existence', {
        email,
        error: error.message,
      });
      throw error;
    }
  }
}

