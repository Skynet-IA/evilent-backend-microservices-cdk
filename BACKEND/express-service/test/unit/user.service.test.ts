/**
 * Tests Unitarios - User Service
 * 
 * REGLA DE ORO #8: SIEMPRE escribir tests para código crítico
 * 
 * Coverage requerido: >90% (services)
 * Patrón AAA: Arrange → Act → Assert
 * Happy Path + Error Path + Edge Cases
 */

import { UserService } from '../../src/service/user.service';
import { CreateUserInput, UpdateUserInput } from '../../src/dto';
import { User } from '../../src/types';

/**
 * Mock Repository para testing
 */
class MockUserRepository {
  private users: Map<string, User> = new Map();
  private usersByEmail: Map<string, User> = new Map();

  async create(data: CreateUserInput): Promise<User> {
    const user: User = {
      id: `${Date.now()}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(user.id, user);
    this.usersByEmail.set(user.email, user);
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersByEmail.get(email) || null;
  }

  async findAll(page: number, pageSize: number): Promise<{ users: User[]; total: number }> {
    const users = Array.from(this.users.values());
    return {
      users: users.slice((page - 1) * pageSize, page * pageSize),
      total: users.length
    };
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error('User not found');

    const updated: User = {
      ...user,
      ...data,
      updatedAt: new Date()
    };

    if (data.email && data.email !== user.email) {
      this.usersByEmail.delete(user.email);
      this.usersByEmail.set(data.email, updated);
    }

    this.users.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const user = this.users.get(id);
    if (!user) throw new Error('User not found');

    this.users.delete(id);
    this.usersByEmail.delete(user.email);
    return true;
  }
}

describe('UserService', () => {
  let service: UserService;
  let repository: MockUserRepository;

  // ========================================================================
  // SETUP & TEARDOWN
  // ========================================================================

  beforeEach(() => {
    repository = new MockUserRepository();
    service = new UserService(repository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ========================================================================
  // CREATE USER - Happy Path + Error Path + Edge Cases
  // ========================================================================

  describe('createUser', () => {
    // HAPPY PATH
    it('debe crear usuario con datos válidos', async () => {
      // ARRANGE
      const userData: CreateUserInput = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      };

      // ACT
      const user = await service.createUser(userData);

      // ASSERT
      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.email).toBe('john@example.com');
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    // ERROR PATH
    it('debe lanzar error si email ya existe', async () => {
      // ARRANGE
      const userData: CreateUserInput = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      };
      
      // Crear primer usuario
      await service.createUser(userData);

      // ACT & ASSERT
      await expect(
        service.createUser(userData)
      ).rejects.toThrow('User with this email already exists');
    });

    // EDGE CASE
    it('debe crear usuario con nombres de longitud máxima', async () => {
      // ARRANGE
      const userData: CreateUserInput = {
        firstName: 'A'.repeat(50),
        lastName: 'B'.repeat(50),
        email: 'edge@example.com'
      };

      // ACT
      const user = await service.createUser(userData);

      // ASSERT
      expect(user.firstName).toHaveLength(50);
      expect(user.lastName).toHaveLength(50);
    });
  });

  // ========================================================================
  // GET USER BY ID - Happy Path + Error Path
  // ========================================================================

  describe('getUserById', () => {
    // HAPPY PATH
    it('debe retornar usuario si existe', async () => {
      // ARRANGE
      const userData: CreateUserInput = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      };
      const created = await service.createUser(userData);

      // ACT
      const user = await service.getUserById(created.id);

      // ASSERT
      expect(user).toBeDefined();
      expect(user?.id).toBe(created.id);
      expect(user?.email).toBe('john@example.com');
    });

    // ERROR PATH
    it('debe retornar null si usuario no existe', async () => {
      // ACT
      const user = await service.getUserById('non-existent-id');

      // ASSERT
      expect(user).toBeNull();
    });
  });

  // ========================================================================
  // GET USER BY EMAIL - Happy Path + Error Path
  // ========================================================================

  describe('getUserByEmail', () => {
    // HAPPY PATH
    it('debe retornar usuario si email existe', async () => {
      // ARRANGE
      const userData: CreateUserInput = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      };
      await service.createUser(userData);

      // ACT
      const user = await service.getUserByEmail('john@example.com');

      // ASSERT
      expect(user).toBeDefined();
      expect(user?.email).toBe('john@example.com');
    });

    // ERROR PATH
    it('debe retornar null si email no existe', async () => {
      // ACT
      const user = await service.getUserByEmail('nonexistent@example.com');

      // ASSERT
      expect(user).toBeNull();
    });
  });

  // ========================================================================
  // LIST USERS - Happy Path + Pagination
  // ========================================================================

  describe('listUsers', () => {
    // HAPPY PATH
    it('debe listar usuarios con paginación', async () => {
      // ARRANGE
      const userData1: CreateUserInput = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      };
      const userData2: CreateUserInput = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com'
      };

      await service.createUser(userData1);
      await service.createUser(userData2);

      // ACT
      const result = await service.listUsers(1, 10);

      // ASSERT
      expect(result.users).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.users[0].firstName).toBe('John');
      expect(result.users[1].firstName).toBe('Jane');
    });

    // EDGE CASE - Empty list
    it('debe retornar lista vacía si no hay usuarios', async () => {
      // ACT
      const result = await service.listUsers(1, 10);

      // ASSERT
      expect(result.users).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  // ========================================================================
  // UPDATE USER - Happy Path + Error Path + Edge Cases
  // ========================================================================

  describe('updateUser', () => {
    // HAPPY PATH
    it('debe actualizar usuario con datos válidos', async () => {
      // ARRANGE
      const userData: CreateUserInput = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      };
      const created = await service.createUser(userData);

      const updateData: UpdateUserInput = {
        firstName: 'Johnny',
        lastName: 'Smith'
      };

      // ACT
      const updated = await service.updateUser(created.id, updateData);

      // ASSERT
      expect(updated.firstName).toBe('Johnny');
      expect(updated.lastName).toBe('Smith');
      expect(updated.email).toBe('john@example.com'); // Email no cambió
      expect(updated.updatedAt).toBeInstanceOf(Date);
    });

    // ERROR PATH
    it('debe lanzar error si usuario no existe', async () => {
      // ARRANGE
      const updateData: UpdateUserInput = { firstName: 'Johnny' };

      // ACT & ASSERT
      await expect(
        service.updateUser('non-existent-id', updateData)
      ).rejects.toThrow('User not found');
    });

    // ERROR PATH - Email duplicado
    it('debe lanzar error si nuevo email ya existe', async () => {
      // ARRANGE
      const userData1: CreateUserInput = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      };
      const userData2: CreateUserInput = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com'
      };

      const user1 = await service.createUser(userData1);
      await service.createUser(userData2);

      // ACT & ASSERT
      await expect(
        service.updateUser(user1.id, { email: 'jane@example.com' })
      ).rejects.toThrow('Email already in use');
    });
  });

  // ========================================================================
  // DELETE USER - Happy Path + Error Path
  // ========================================================================

  describe('deleteUser', () => {
    // HAPPY PATH
    it('debe eliminar usuario exitosamente', async () => {
      // ARRANGE
      const userData: CreateUserInput = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      };
      const created = await service.createUser(userData);

      // ACT
      const deleted = await service.deleteUser(created.id);

      // ASSERT
      expect(deleted).toBe(true);

      // Verificar que usuario fue eliminado
      const fetched = await service.getUserById(created.id);
      expect(fetched).toBeNull();
    });

    // ERROR PATH
    it('debe lanzar error si usuario no existe', async () => {
      // ACT & ASSERT
      await expect(
        service.deleteUser('non-existent-id')
      ).rejects.toThrow('User not found');
    });
  });
});

