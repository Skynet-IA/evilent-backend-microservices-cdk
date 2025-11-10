/**
 * 🗄️ REPOSITORY MOCKS - Mocks para Repositorios de Base de Datos
 * 
 * REGLA CRÍTICA: Los mocks DEBEN reflejar la estructura EXACTA de los métodos reales
 * - Métodos deben ser async (como en código real)
 * - Retornos deben coincidir exactamente
 * - Simular comportamiento de PostgreSQL
 * 
 * ✅ Validado contra: src/repository/user-repository.ts
 */

// ========================================
// MOCK USER REPOSITORY
// ========================================

/**
 * Mock de UserRepository para PostgreSQL
 * REGLA CRÍTICA: Simular comportamiento real de la base de datos
 */
export class MockUserRepository {
  private users: Map<string, any> = new Map();
  private _repoLogger = { info: () => {}, error: () => {}, debug: () => {} }; // Mock logger

  /**
   * Crear cuenta de usuario
   * REGLA CRÍTICA: Coincide exactamente con UserRepository.createAccount()
   */
  async createAccount(input: {
    cognito_user_id: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }, email: string): Promise<any> {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user = {
      user_id: userId,
      cognito_user_id: input.cognito_user_id,
      email: email,
      first_name: input.first_name,
      last_name: input.last_name,
      phone: input.phone || null,
      userType: 'BUYER',
      profile_pic: null,
      verified: false,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.users.set(input.cognito_user_id, user);
    return user;
  }

  /**
   * Actualizar cuenta de usuario
   * REGLA CRÍTICA: Coincide exactamente con UserRepository.updateAccount()
   */
  async updateAccount(input: {
    cognito_user_id: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
  }): Promise<any> {
    const existing = this.users.get(input.cognito_user_id);
    if (!existing) {
      throw new Error('Usuario no encontrado para actualizar');
    }

    const updated = {
      ...existing,
      first_name: input.first_name ?? existing.first_name,
      last_name: input.last_name ?? existing.last_name,
      phone: input.phone !== undefined ? input.phone : existing.phone,
      updated_at: new Date(),
    };
    this.users.set(input.cognito_user_id, updated);
    return updated;
  }

  /**
   * Obtener cuenta por ID de Cognito
   * REGLA CRÍTICA: Coincide exactamente con UserRepository.getAccountByCognitoId()
   */
  async getAccountByCognitoId(cognitoUserId: string): Promise<any | null> {
    return this.users.get(cognitoUserId) || null;
  }

  /**
   * Verificar si usuario existe por email
   */
  async UserExistsByEmail(email: string): Promise<boolean> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return true;
      }
    }
    return false;
  }

  /**
   * Helper: Limpiar datos de test
   */
  clear(): void {
    this.users.clear();
  }

  /**
   * Helper: Obtener cantidad de usuarios
   */
  count(): number {
    return this.users.size;
  }

  /**
   * Helper: Generar UUID v4
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

// ========================================
// MOCK SESSION REPOSITORY (si aplica)
// ========================================

/**
 * Mock de SessionRepository
 * Para validar sessions de usuario si se implementa
 */
export class MockSessionRepository {
  private sessions: Map<string, any> = new Map();

  async CreateSession(input: {
    userId: string;
    token: string;
    expiresAt: Date;
  }): Promise<any> {
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session = {
      id: sessionId,
      userId: input.userId,
      token: input.token,
      expiresAt: input.expiresAt,
      createdAt: new Date(),
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  async GetSessionByToken(token: string): Promise<any | null> {
    for (const session of this.sessions.values()) {
      if (session.token === token && new Date() < session.expiresAt) {
        return session;
      }
    }
    return null;
  }

  async RevokeSession(sessionId: string): Promise<boolean> {
    return this.sessions.delete(sessionId);
  }

  clear(): void {
    this.sessions.clear();
  }
}

// ========================================
// FACTORY FUNCTIONS
// ========================================

/**
 * Crear repositorios mock de forma consistente
 * REGLA CRÍTICA: Mantener mismo patrón en TODOS los tests
 */
export function createMockRepositories() {
  return {
    userRepository: new MockUserRepository(),
    sessionRepository: new MockSessionRepository(),
  };
}

/**
 * Crear usuario de test con datos válidos
 * REGLA CRÍTICA: Usar datos realistas para tests
 */
export function createTestUser(overrides?: any) {
  return {
    email: 'test.user@example.com',
    first_name: 'Test',
    last_name: 'User',
    password_hash: 'hashed_password_xyz',
    ...overrides,
  };
}

/**
 * Crear múltiples usuarios de test
 */
export function createTestUsers(count: number = 3) {
  const users = [];
  for (let i = 1; i <= count; i++) {
    users.push({
      email: `test.user.${i}@example.com`,
      first_name: `User`,
      last_name: `Test${i}`,
      password_hash: `hashed_password_${i}`,
    });
  }
  return users;
}

