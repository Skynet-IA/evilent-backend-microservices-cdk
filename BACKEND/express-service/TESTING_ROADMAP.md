# 🧪 TESTING ROADMAP - EXPRESS-SERVICE

**Objetivo:** Tests profesionales que validan la REALIDAD del código empresarial.  
**Filosofía:** Mejor 50% coverage en tests REALES que 100% en mocks FALSOS.

---

## 📋 ESTRUCTURA DE TESTING

```
test/
├── fixtures/                             ← Datos REALISTAS (HIGH PRIORITY)
│   ├── user.fixtures.ts                  - Usuarios con estructura DB real
│   ├── error.fixtures.ts                 - Errores consistentes con código
│   ├── response.fixtures.ts              - Respuestas buildSuccessResponse()
│   └── pagination.fixtures.ts            - Paginación realista
├── mocks/                                ← Mocks CONSISTENTES (HIGH PRIORITY)
│   ├── services/
│   │   └── user.service.mock.ts         - UserService que refleja getById(), updateUser()
│   ├── repositories/
│   │   └── user.repository.mock.ts      - Queries reales (snake_case DB)
│   └── responses/
│       └── http-responses.mock.ts       - Respuestas HTTP reales
├── helpers/                              ← Test utilities
│   ├── test-helpers.ts                   - beforeEach, afterEach, teardown
│   ├── validation-helpers.ts             - Validar estructura de respuestas
│   └── fixture-helpers.ts                - Crear datos de prueba complejos
├── unit/                                 ← Tests de lógica pura
│   ├── services/
│   │   └── user.service.test.ts         - >90% coverage (CRÍTICO)
│   ├── utilities/
│   │   ├── helpers.test.ts              - >80% coverage
│   │   ├── zod-validator.test.ts        - >80% coverage
│   │   └── request-parser.test.ts       - >80% coverage
│   └── dto/
│       └── index.test.ts                - Validación Zod schemas
├── integration/                          ← Tests de APIs completas
│   └── handlers/
│       └── user.handler.test.ts         - >85% coverage
├── e2e/                                  ← Tests de flujos completos
│   └── workflows/
│       ├── auth-flow.test.ts            - JWT + GET /user/profile
│       ├── crud-flow.test.ts            - Full CRUD operations
│       └── error-flow.test.ts           - Error handling scenarios
└── config/
    ├── jest.setup.ts                    - Global setup (DB, mocks, env)
    └── test.env                         - Variables de ambiente test
```

---

## 🎯 PLAN DE IMPLEMENTACIÓN (TAREA POR TAREA)

### TAREA 5.1: Crear Fixtures Realistas (2-3 horas)

**Objetivo:** Datos que reflejan EXACTAMENTE la estructura de BD real.

#### 5.1.1 `test/fixtures/user.fixtures.ts`

```typescript
/**
 * Usuarios con estructura REALISTA de BD
 * 
 * REGLA CRÍTICA: Datos deben coincidir 100% con:
 * - Schema de BD (snake_case)
 * - Respuestas de formatUser()
 * - Estructura de CreateUserDTO, UpdateUserDTO
 */

export const USER_FIXTURES = {
  // Usuario DB completo (snake_case como en BD real)
  validUserDB: {
    id: 'user-123',
    email: 'john.doe@example.com',
    first_name: 'John',           // ← Mismo que en BD
    last_name: 'Doe',             // ← Mismo que en BD
    created_at: '2024-01-01T12:00:00Z',
    updated_at: '2024-01-01T12:00:00Z'
  },

  // Usuario validado (después de formatUser())
  validUserFormatted: {
    id: 'user-123',
    email: 'john.doe@example.com',
    firstName: 'John',             // ← camelCase después de formatUser()
    lastName: 'Doe',               // ← camelCase después de formatUser()
    fullName: 'John Doe',
    createdAt: '2024-01-01T12:00:00Z',
    updatedAt: '2024-01-01T12:00:00Z'
  },

  // Input para CreateUserDTO
  validCreateUserInput: {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com'
  },

  // Input para UpdateUserDTO
  validUpdateUserInput: {
    firstName: 'John',
    lastName: 'Doe Updated'
  },

  // Input inválido (para error path)
  invalidUserInput: {
    firstName: '',                 // ← Violación minLength
    lastName: 'Doe',
    email: 'invalid-email'         // ← No es email válido
  }
};
```

#### 5.1.2 `test/fixtures/error.fixtures.ts`

```typescript
/**
 * Errores consistentes con responses.ts y request-parser.ts
 * 
 * REGLA CRÍTICA: Estructura EXACTA de validationErrorResponse()
 */

export const ERROR_FIXTURES = {
  // Error de validación (mismo formato que parseAndValidateBody())
  validationError: {
    statusCode: 400,
    body: {
      success: false,
      message: 'Validation failed',
      data: {
        errors: [
          {
            field: 'firstName',
            message: 'First name is required',
            code: 'VALIDATION_ERROR'
          }
        ]
      },
      timestamp: '2024-01-01T12:00:00Z'
    }
  },

  // Error de no encontrado
  notFoundError: {
    statusCode: 404,
    message: 'User not found'
  },

  // Error de conflicto
  conflictError: {
    statusCode: 409,
    message: 'User already exists'
  }
};
```

#### 5.1.3 `test/fixtures/response.fixtures.ts`

```typescript
/**
 * Respuestas HTTP que salen de buildSuccessResponse()
 * 
 * REGLA CRÍTICA: EXACTAMENTE igual a lo que retorna buildSuccessResponse()
 */

export const RESPONSE_FIXTURES = {
  // Respuesta de GET /users/:id
  getUserByIdResponse: {
    statusCode: 200,
    body: {
      success: true,
      message: 'User retrieved successfully',
      data: {
        id: 'user-123',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        createdAt: '2024-01-01T12:00:00Z',
        updatedAt: '2024-01-01T12:00:00Z'
      },
      timestamp: '2024-01-01T12:00:00Z'
    }
  },

  // Respuesta de GET /users (listado)
  listUsersResponse: {
    statusCode: 200,
    body: {
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users: [
          // Usuarios formateados
        ],
        total: 10,
        page: 1,
        pageSize: 10
      },
      timestamp: '2024-01-01T12:00:00Z'
    }
  }
};
```

#### 5.1.4 `test/fixtures/pagination.fixtures.ts`

```typescript
/**
 * Datos de paginación realistas
 */

export const PAGINATION_FIXTURES = {
  // Paginación válida (coincide con PaginationDTO)
  validPagination: {
    page: 1,
    pageSize: 10
  },

  // Casos límite
  firstPage: { page: 1, pageSize: 10 },
  lastPage: { page: 10, pageSize: 10 },
  maxPageSize: { page: 1, pageSize: 100 },

  // Casos inválidos
  invalidPage: { page: 0, pageSize: 10 },          // page < 1
  invalidPageSize: { page: 1, pageSize: 1000 },   // pageSize > MAX
  zeroPageSize: { page: 1, pageSize: 0 }          // pageSize < 1
};
```

---

### TAREA 5.2: Crear Mocks Consistentes (2-3 horas)

**Objetivo:** Mocks que reflejan estructura EXACTA del código real.

#### 5.2.1 `test/mocks/services/user.service.mock.ts`

```typescript
/**
 * UserService mock que refleja métodos REALES
 * 
 * REGLA CRÍTICA:
 * - Mismo nombre de métodos (getUserById, updateUser, etc.)
 * - Mismo tipo de retorno
 * - Mismo error handling
 * - Usuarios retornados con estructura DB (snake_case)
 */

import { vi, Mock } from 'vitest';

export function createMockUserService() {
  return {
    getUserById: vi.fn() as Mock,           // Retorna usuario DB
    updateUser: vi.fn() as Mock,            // Retorna usuario actualizado
    deleteUser: vi.fn() as Mock,            // Retorna void
    listUsers: vi.fn() as Mock              // Retorna { users, total }
  };
}

// Setup defaults para cada método
export function setupMockUserServiceDefaults(mock: ReturnType<typeof createMockUserService>) {
  mock.getUserById.mockResolvedValue({
    id: 'user-123',
    email: 'test@example.com',
    first_name: 'Test',  // ← DB format (snake_case)
    last_name: 'User',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  mock.updateUser.mockResolvedValue({
    id: 'user-123',
    email: 'test@example.com',
    first_name: 'Updated',
    last_name: 'User',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  mock.deleteUser.mockResolvedValue(undefined);

  mock.listUsers.mockResolvedValue({
    users: [/* usuarios con snake_case */],
    total: 10
  });
}
```

#### 5.2.2 `test/mocks/repositories/user.repository.mock.ts`

```typescript
/**
 * UserRepository mock con estructura de BD REALISTA
 * 
 * REGLA CRÍTICA:
 * - Retorna datos en snake_case (como BD real)
 * - Maneja transacciones
 * - Retorna null si no encuentra
 */

import { vi, Mock } from 'vitest';

export function createMockUserRepository() {
  return {
    findById: vi.fn() as Mock,              // Retorna usuario | null
    create: vi.fn() as Mock,                // Retorna usuario creado
    update: vi.fn() as Mock,                // Retorna usuario actualizado
    delete: vi.fn() as Mock,                // Retorna booleano
    list: vi.fn() as Mock                   // Retorna { rows, count }
  };
}

export function setupMockUserRepositoryDefaults(
  mock: ReturnType<typeof createMockUserRepository>
) {
  mock.findById.mockResolvedValue(null);    // Por defecto no encontrado
  mock.create.mockResolvedValue({/* usuario snake_case */});
  mock.update.mockResolvedValue({/* usuario snake_case */});
  mock.delete.mockResolvedValue(true);
  mock.list.mockResolvedValue({ rows: [], count: 0 });
}
```

#### 5.2.3 `test/mocks/responses/http-responses.mock.ts`

```typescript
/**
 * Response mock que refleja Express Response
 * 
 * REGLA CRÍTICA:
 * - Implementa métodos reales de Express Response
 * - status().json() retorna undefined (como Express real)
 */

import { vi, Mock } from 'vitest';

export function createMockResponse() {
  const res = {
    status: vi.fn() as Mock,
    json: vi.fn() as Mock,
    send: vi.fn() as Mock,
    statusCode: 200,
    _status: null as number | null,
    _jsonData: null as any
  };

  res.status.mockImplementation((code: number) => {
    res._status = code;
    return res;
  });

  res.json.mockImplementation((data: any) => {
    res._jsonData = data;
    return undefined;
  });

  return res;
}
```

---

### TAREA 5.3: Tests Unitarios Críticos (3-4 horas)

**Objetivo:** >90% coverage en services, >80% en utils.

#### 5.3.1 `test/unit/services/user.service.test.ts`

```typescript
/**
 * User Service Tests
 * 
 * REGLA CRÍTICA:
 * - Patrón AAA (Arrange-Act-Assert) ESTRICTO
 * - Mocks repositorio realistas
 * - Happy path + Error path + Edge cases
 * - Validar formateo de datos (snake_case → camelCase)
 */

describe('UserService', () => {
  let userService: UserService;
  let mockRepository: MockUserRepository;

  beforeEach(() => {
    mockRepository = createMockUserRepository();
    userService = new UserService(mockRepository);
  });

  describe('getUserById', () => {
    it('debe retornar usuario formateado con datos válidos', async () => {
      // ARRANGE: Setup mock con usuario DB realista
      const dbUser = {
        id: 'user-123',
        email: 'test@example.com',
        first_name: 'John',    // ← DB format
        last_name: 'Doe',
        created_at: '2024-01-01T12:00:00Z',
        updated_at: '2024-01-01T12:00:00Z'
      };
      mockRepository.findById.mockResolvedValue(dbUser);

      // ACT: Ejecutar función
      const result = await userService.getUserById('user-123');

      // ASSERT: Verificar que formatUser() fue aplicado (camelCase)
      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',     // ← Formateado
        lastName: 'Doe',       // ← Formateado
        fullName: 'John Doe',
        createdAt: '2024-01-01T12:00:00Z',
        updatedAt: '2024-01-01T12:00:00Z'
      });
      expect(mockRepository.findById).toHaveBeenCalledWith('user-123');
    });

    it('debe lanzar error si usuario no existe', async () => {
      // ARRANGE
      mockRepository.findById.mockResolvedValue(null);

      // ACT & ASSERT
      await expect(() =>
        userService.getUserById('nonexistent')
      ).rejects.toThrow('User not found');
    });

    it('debe manejar IDs vacíos', async () => {
      // ARRANGE & ACT & ASSERT
      await expect(() =>
        userService.getUserById('')
      ).rejects.toThrow('User ID is required');
    });
  });

  describe('updateUser', () => {
    it('debe actualizar usuario y retornar cambios', async () => {
      // ARRANGE
      const updateData = { firstName: 'Jane' };
      const updatedUser = {
        id: 'user-123',
        email: 'test@example.com',
        first_name: 'Jane',    // ← Actualizado
        last_name: 'Doe',
        created_at: '2024-01-01T12:00:00Z',
        updated_at: new Date().toISOString()
      };
      mockRepository.update.mockResolvedValue(updatedUser);

      // ACT
      const result = await userService.updateUser('user-123', updateData);

      // ASSERT
      expect(result.firstName).toBe('Jane');
      expect(mockRepository.update).toHaveBeenCalledWith('user-123', expect.any(Object));
    });

    it('debe validar campos antes de actualizar', async () => {
      // ARRANGE
      const invalidUpdate = { firstName: '' };

      // ACT & ASSERT
      await expect(() =>
        userService.updateUser('user-123', invalidUpdate)
      ).rejects.toThrow();
    });
  });
});
```

#### 5.3.2 `test/unit/utilities/helpers.test.ts`

```typescript
/**
 * Helpers Tests - formatUser, buildSuccessResponse, pickFields
 * 
 * REGLA CRÍTICA:
 * - formatUser() convierte snake_case → camelCase correctamente
 * - buildSuccessResponse() retorna estructura EXACTA
 * - pickFields() NO incluye campos no solicitados
 */

describe('Helpers', () => {
  describe('formatUser', () => {
    it('debe convertir DB user (snake_case) a API format (camelCase)', () => {
      // ARRANGE
      const dbUser = {
        id: 'user-123',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        created_at: '2024-01-01T12:00:00Z',
        updated_at: '2024-01-01T12:00:00Z'
      };

      // ACT
      const formatted = formatUser(dbUser);

      // ASSERT
      expect(formatted).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        createdAt: '2024-01-01T12:00:00Z',
        updatedAt: '2024-01-01T12:00:00Z'
      });
    });

    it('debe manejar nombres NULL', () => {
      // ARRANGE
      const dbUserWithNull = {
        id: 'user-123',
        first_name: null,
        last_name: null
      };

      // ACT
      const formatted = formatUser(dbUserWithNull);

      // ASSERT
      expect(formatted.fullName).toBe('');
      expect(formatted.firstName).toBe('');
    });
  });

  describe('buildSuccessResponse', () => {
    it('debe retornar respuesta con estructura EXACTA', () => {
      // ARRANGE
      const data = { id: '123', name: 'Test' };

      // ACT
      const response = buildSuccessResponse(data, 'Success', 200);

      // ASSERT
      expect(response).toHaveProperty('statusCode', 200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Success');
      expect(response.body).toHaveProperty('data', data);
      expect(response.body).toHaveProperty('timestamp');
      // Verificar que timestamp es ISO string válido
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('pickFields', () => {
    it('debe retornar SOLO campos solicitados', () => {
      // ARRANGE
      const obj = { id: '123', email: 'test@example.com', password: 'secret' };

      // ACT
      const picked = pickFields(obj, ['id', 'email']);

      // ASSERT
      expect(picked).toEqual({ id: '123', email: 'test@example.com' });
      expect(picked).not.toHaveProperty('password');
    });

    it('debe retornar vacío si no hay campos solicitados', () => {
      // ARRANGE & ACT
      const picked = pickFields({ a: 1, b: 2 }, []);

      // ASSERT
      expect(Object.keys(picked)).toHaveLength(0);
    });
  });
});
```

#### 5.3.3 `test/unit/utilities/zod-validator.test.ts`

```typescript
/**
 * Zod Validator Tests
 * 
 * REGLA CRÍTICA:
 * - validateWithZod() retorna EXACTAMENTE estructura ParseResult<T>
 * - Formato de error consistente con request-parser.ts
 */

describe('ZodValidator', () => {
  describe('validateWithZod', () => {
    it('debe validar datos correctos y retornar success: true', () => {
      // ARRANGE
      const schema = z.object({
        name: z.string().min(1),
        email: z.string().email()
      });
      const validData = { name: 'John', email: 'test@example.com' };

      // ACT
      const result = validateWithZod(schema, validData);

      // ASSERT
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validData);
      expect(result.error).toBeNull();
    });

    it('debe retornar errores con formato CONSISTENTE', () => {
      // ARRANGE
      const schema = z.object({
        firstName: z.string().min(1, 'First name required'),
        email: z.string().email('Invalid email')
      });
      const invalidData = { firstName: '', email: 'invalid' };

      // ACT
      const result = validateWithZod(schema, invalidData);

      // ASSERT
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      // Verificar formato de error EXACTO
      expect(result.error?.errors).toContainEqual({
        field: 'firstName',
        message: 'First name required',
        code: 'too_small'
      });
    });
  });
});
```

#### 5.3.4 `test/unit/utilities/request-parser.test.ts`

```typescript
/**
 * Request Parser Tests
 * 
 * REGLA CRÍTICA:
 * - parseAndValidateBody() retorna Union type: { success, data } | { success, error }
 * - Error estructura EXACTA como validationErrorResponse()
 */

describe('RequestParser', () => {
  describe('parseAndValidateBody', () => {
    it('debe parsear y validar body exitosamente', () => {
      // ARRANGE
      const mockReq = {
        body: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
        id: 'req-123'
      } as any;

      // ACT
      const result = parseAndValidateBody(mockReq, CreateUserDTO);

      // ASSERT
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockReq.body);
      expect(result.error).toBeNull();
    });

    it('debe retornar error con estructura validationErrorResponse EXACTA', () => {
      // ARRANGE
      const mockReq = {
        body: { firstName: '', email: 'invalid' },
        id: 'req-123'
      } as any;

      // ACT
      const result = parseAndValidateBody(mockReq, CreateUserDTO);

      // ASSERT
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      // Verificar estructura EXACTA de error
      expect(result.error?.statusCode).toBe(400);
      expect(result.error?.body).toHaveProperty('success', false);
      expect(result.error?.body).toHaveProperty('data.errors');
      expect(Array.isArray(result.error?.body.data.errors)).toBe(true);
    });
  });
});
```

---

### TAREA 5.4: Tests de Handlers/APIs (2-3 horas)

#### 5.4.1 `test/integration/handlers/user.handler.test.ts`

```typescript
/**
 * User Handler Integration Tests
 * 
 * REGLA CRÍTICA:
 * - Tests COMPLETOS con Express Request/Response reales
 * - Validar middleware requireAuth
 * - Validar respuesta EXACTA de buildSuccessResponse()
 * - Mocks de servicios realistas
 */

describe('User Handler', () => {
  let mockReq: any;
  let mockRes: any;
  let mockUserService: any;

  beforeEach(() => {
    mockReq = createMockRequest();
    mockRes = createMockResponse();
    mockUserService = createMockUserService();
  });

  describe('GET /users/:id', () => {
    it('debe retornar usuario formateado exitosamente', async () => {
      // ARRANGE
      mockReq.params = { id: 'user-123' };
      const dbUser = createUserFixture();
      mockUserService.getUserById.mockResolvedValue(dbUser);

      // ACT
      await handlers.getUserById(mockReq, mockRes);

      // ASSERT - Verificar respuesta EXACTA
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'User retrieved successfully',
          data: expect.objectContaining({
            id: 'user-123',
            firstName: 'John',      // ← Formateado (camelCase)
            fullName: expect.any(String)
          })
        })
      );
    });

    it('debe retornar 404 si usuario no existe', async () => {
      // ARRANGE
      mockReq.params = { id: 'nonexistent' };
      mockUserService.getUserById.mockRejectedValue(new Error('User not found'));

      // ACT
      await handlers.getUserById(mockReq, mockRes);

      // ASSERT
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('GET /user/profile (requireAuth)', () => {
    it('debe validar requireAuth middleware', async () => {
      // ARRANGE: Sin JWT en req.user
      mockReq.user = undefined;

      // ACT
      await handlers.getProfile(mockReq, mockRes);

      // ASSERT: Debe retornar 401
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('debe retornar perfil del usuario autenticado', async () => {
      // ARRANGE: Con JWT validado por middleware
      mockReq.user = { userId: 'user-123' };
      const dbUser = createUserFixture();
      mockUserService.getUserById.mockResolvedValue(dbUser);

      // ACT
      await handlers.getProfile(mockReq, mockRes);

      // ASSERT: Verificar que pickFields() se aplicó
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            id: 'user-123',
            email: expect.any(String)
          }),
          // No debe incluir createdAt, updatedAt
          data: expect.not.objectContaining({
            createdAt: expect.anything(),
            updatedAt: expect.anything()
          })
        })
      );
    });
  });
});
```

---

### TAREA 5.5: E2E Tests (2-3 horas)

#### 5.5.1 `test/e2e/workflows/auth-flow.test.ts`

```typescript
/**
 * Auth Flow E2E Test
 * 
 * Flujo completo:
 * GET /user/profile → JWT validado por requireAuth → formatUser() → respuesta
 */

describe('Auth Flow E2E', () => {
  it('debe completar flujo de obtener perfil autenticado', async () => {
    // ARRANGE: Mock DB user
    const dbUser = createUserFixture();
    mockRepository.findById.mockResolvedValue(dbUser);

    // ACT: Simular GET /user/profile con JWT válido
    const result = await testClient
      .get('/user/profile')
      .set('Authorization', `Bearer ${validJWT}`)
      .expect(200);

    // ASSERT: Verificar flujo completo
    // 1. JWT validado
    expect(result.body.success).toBe(true);
    // 2. Usuario formateado
    expect(result.body.data.firstName).toBe('John');  // ← camelCase
    // 3. Campos sensibles removidos
    expect(result.body.data).not.toHaveProperty('password');
  });

  it('debe rechazar sin JWT válido', async () => {
    // ACT
    const result = await testClient
      .get('/user/profile')
      .expect(401);

    // ASSERT
    expect(result.body.success).toBe(false);
  });
});
```

#### 5.5.2 `test/e2e/workflows/crud-flow.test.ts`

```typescript
/**
 * CRUD Flow E2E Test
 * 
 * Flujo completo de operaciones:
 * CREATE → READ → UPDATE → DELETE
 */

describe('CRUD Flow E2E', () => {
  it('debe completar ciclo CRUD', async () => {
    // 1. CREATE
    const createResult = await testClient
      .post('/users')
      .send({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com'
      })
      .expect(201);

    const userId = createResult.body.data.id;

    // 2. READ
    const getResult = await testClient
      .get(`/users/${userId}`)
      .expect(200);
    expect(getResult.body.data.firstName).toBe('Test');

    // 3. UPDATE
    const updateResult = await testClient
      .put(`/users/${userId}`)
      .send({ firstName: 'Updated' })
      .expect(200);
    expect(updateResult.body.data.firstName).toBe('Updated');

    // 4. DELETE
    await testClient
      .delete(`/users/${userId}`)
      .expect(200);

    // Verificar que fue eliminado
    await testClient
      .get(`/users/${userId}`)
      .expect(404);
  });
});
```

---

## 📊 COVERAGE TARGETS

```
┌─────────────────────┬─────────┬──────────┬─────────────┐
│ Category            │ Target  │ Current  │ Gap         │
├─────────────────────┼─────────┼──────────┼─────────────┤
│ Services            │ >90%    │ 0%       │ +90% (CRIT) │
│ Handlers            │ >85%    │ 0%       │ +85% (CRIT) │
│ Utilities           │ >80%    │ 0%       │ +80% (CRIT) │
│ DTO/Validators      │ >80%    │ 0%       │ +80% (CRIT) │
│ TOTAL               │ >80%    │ 0%       │ +80% (CRIT) │
└─────────────────────┴─────────┴──────────┴─────────────┘
```

---

## 🎯 VALIDACIÓN DE CONSISTENCIA TESTS ↔ CÓDIGO

### Regla Crítica: CONSISTENCIA 100%

**ANTES de considerar test "COMPLETO", verificar:**

#### 1. Mocks reflejan REALIDAD

```typescript
// ❌ INCORRECTO: Mock simplificado
mockUserService.getUserById.mockResolvedValue({ id: '123', name: 'Test' });

// ✅ CORRECTO: Mock con estructura DB real (snake_case)
mockUserService.getUserById.mockResolvedValue({
  id: 'user-123',
  email: 'test@example.com',
  first_name: 'Test',    // ← Exacto como en BD
  last_name: 'User',     // ← Exacto como en BD
  created_at: '2024-01-01T12:00:00Z',
  updated_at: '2024-01-01T12:00:00Z'
});
```

#### 2. Tests validan ESTRUCTURA EXACTA

```typescript
// ❌ INCORRECTO: Solo validar existencia
expect(result).toHaveProperty('data');

// ✅ CORRECTO: Validar estructura EXACTA
expect(result).toEqual({
  statusCode: 200,
  body: {
    success: true,
    message: 'User retrieved successfully',
    data: {
      id: expect.any(String),
      email: expect.any(String),
      firstName: expect.any(String),    // ← camelCase OBLIGATORIO
      lastName: expect.any(String),
      fullName: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String)
    },
    timestamp: expect.any(String)
  }
});
```

#### 3. Fixtures son DATOS REALES

```typescript
// ❌ INCORRECTO: Datos mágicos
const user = { id: 1, name: 'Test' };

// ✅ CORRECTO: Estructura real de BD
const user = {
  id: 'user-123',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};
```

---

## 🚀 CRONOGRAMA FASE 5

| TAREA | DESCRIPCIÓN | TIEMPO | ESTADO |
|-------|-------------|--------|--------|
| 5.1 | Crear fixtures realistas | 2-3h | ⏳ PENDIENTE |
| 5.2 | Crear mocks consistentes | 2-3h | ⏳ PENDIENTE |
| 5.3 | Tests unitarios críticos | 3-4h | ⏳ PENDIENTE |
| 5.4 | Tests de handlers/APIs | 2-3h | ⏳ PENDIENTE |
| 5.5 | E2E workflows | 2-3h | ⏳ PENDIENTE |
| 5.6 | Coverage verification | 1h | ⏳ PENDIENTE |
| **TOTAL** | **FASE 5 COMPLETA** | **11-17h** | ⏳ PENDIENTE |

---

## ✅ DEFINICIÓN DE COMPLETO

FASE 5 está "COMPLETADA" SOLO cuando:

- [ ] >90% coverage en services
- [ ] >85% coverage en handlers
- [ ] >80% coverage en utils
- [ ] >80% coverage TOTAL
- [ ] CERO inconsistencias fixtures ↔ código
- [ ] CERO inconsistencias mocks ↔ código
- [ ] Patrón AAA en TODOS los tests
- [ ] Happy path + Error path + Edge cases en TODOS
- [ ] npm test: 100% de tests pasando
- [ ] npm run coverage: Reporte limpio, sin alertas

---

## 🎓 FILOSOFÍA FINAL

**"Tests que generan CONFIANZA, no solo números de coverage."**

Cuando alguien lee estos tests:
- ✅ Ve exactamente cómo funciona el código en producción
- ✅ Comprende la estructura de BD (snake_case)
- ✅ Comprende la estructura de API (camelCase)
- ✅ Confía en que "esto realmente funciona"

**Mejor 50% coverage en tests REALES que 100% en tests FALSOS.**

