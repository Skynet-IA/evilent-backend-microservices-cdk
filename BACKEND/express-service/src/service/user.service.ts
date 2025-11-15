/**
 * User Service - Lógica de negocio
 * 
 * Separación de responsabilidades:
 * Service → contiene lógica de negocio
 * Repository → acceso a datos
 * Handler → recibe requests y delega
 * 
 * Beneficio: Fácil testear (mockear repository), reutilizable en múltiples handlers
 */

import { User } from '../types';
import { CreateUserInput, UpdateUserInput } from '../dto';
import logger from '../utility/logger';

/**
 * Mock repository - En producción, inyectar repositorio real
 * 
 * REGLA DE ORO: Service no importa repository directamente,
 * recibe como inyección (dependency injection)
 */
interface IUserRepository {
  create(data: CreateUserInput): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(page: number, pageSize: number): Promise<{ users: User[]; total: number }>;
  update(id: string, data: UpdateUserInput): Promise<User>;
  delete(id: string): Promise<boolean>;
}

export class UserService {
  constructor(private repository: IUserRepository) {}

  /**
   * Crear usuario
   * 
   * Validación:
   * - Email único (verificar en repository)
   * - Nombres válidos (ya validados con Zod)
   */
  async createUser(data: CreateUserInput): Promise<User> {
    try {
      logger.info('Creating user', { email: data.email });

      // Verificar que email no exista
      const existing = await this.repository.findByEmail(data.email);
      if (existing) {
        logger.warn('User with email already exists', { email: data.email });
        throw new Error('User with this email already exists');
      }

      // Crear usuario
      const user = await this.repository.create(data);
      logger.info('User created successfully', { userId: user.id, email: user.email });
      return user;
    } catch (error: any) {
      logger.error('Failed to create user', {
        email: data.email,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Obtener usuario por ID
   */
  async getUserById(id: string): Promise<User | null> {
    try {
      logger.debug('Fetching user', { userId: id });
      const user = await this.repository.findById(id);
      
      if (!user) {
        logger.warn('User not found', { userId: id });
        return null;
      }

      return user;
    } catch (error: any) {
      logger.error('Failed to fetch user', {
        userId: id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Obtener usuario por email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      logger.debug('Fetching user by email', { email });
      return await this.repository.findByEmail(email);
    } catch (error: any) {
      logger.error('Failed to fetch user by email', {
        email,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Listar usuarios con paginación
   */
  async listUsers(page: number, pageSize: number): Promise<{ users: User[]; total: number }> {
    try {
      logger.info('Listing users', { page, pageSize });
      return await this.repository.findAll(page, pageSize);
    } catch (error: any) {
      logger.error('Failed to list users', {
        page,
        pageSize,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Actualizar usuario
   */
  async updateUser(id: string, data: UpdateUserInput): Promise<User> {
    try {
      logger.info('Updating user', { userId: id });

      // Verificar que usuario existe
      const user = await this.repository.findById(id);
      if (!user) {
        throw new Error('User not found');
      }

      // Si email cambió, verificar unicidad
      if (data.email && data.email !== user.email) {
        const existing = await this.repository.findByEmail(data.email);
        if (existing) {
          throw new Error('Email already in use');
        }
      }

      const updated = await this.repository.update(id, data);
      logger.info('User updated successfully', { userId: id });
      return updated;
    } catch (error: any) {
      logger.error('Failed to update user', {
        userId: id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Eliminar usuario
   */
  async deleteUser(id: string): Promise<boolean> {
    try {
      logger.info('Deleting user', { userId: id });

      const user = await this.repository.findById(id);
      if (!user) {
        throw new Error('User not found');
      }

      const deleted = await this.repository.delete(id);
      logger.info('User deleted successfully', { userId: id });
      return deleted;
    } catch (error: any) {
      logger.error('Failed to delete user', {
        userId: id,
        error: error.message
      });
      throw error;
    }
  }

}

