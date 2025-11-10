/**
 * 🧪 USER-SERVICE UNIT TESTS
 * 
 * REGLA CRÍTICA: Tests deben validar CONSISTENCIA con código real
 * ✅ Validado contra:
 *    - src/service/user-service.ts
 *    - src/dto/validation-schemas.ts
 *    - src/utility/response.ts
 */

// Jest globals are available globally, no need to import
import { UserService } from '../../src/service/user-service';
import { MockUserRepository, createTestUsers } from '../mocks/repository-mocks';
import { createMockPostEvent, createMockPathParamsEvent, parseResponseBody } from '../mocks/aws-mocks';
import { TEST_CONFIG, TestUtils } from '../config';

describe('UserService', () => {
  let service: UserService;
  let mockRepository: MockUserRepository;
  let testUserId: string;
  let testEmail: string;

  beforeEach(() => {
    // Arrancar con repositorio limpio
    mockRepository = new MockUserRepository();
    service = new UserService(mockRepository as any);
    testUserId = TestUtils.generateUUID();
    testEmail = TestUtils.generateUniqueEmail('test.user@example.com');
  });

  afterEach(() => {
    // Limpiar después de cada test
    mockRepository.clear();
  });

  // ========================================
  // ✅ TESTS: CreateProfile
  // ========================================

  describe('CreateProfile', () => {
    it('debe crear un perfil válido con datos completos', async () => {
      const event = createMockPostEvent({
        first_name: 'Juan',
        last_name: 'Pérez',
        phone: '+34 912 345 678'
      });

      const result = await service.CreateProfile(event, testUserId, testEmail);

      expect(result.statusCode).toBe(200);
      const body = parseResponseBody(result);
      expect(body.message).toBe('success');
      expect(body.data).toBeDefined();
      expect(body.data.first_name).toBe('Juan');
      expect(body.data.last_name).toBe('Pérez');
    });

    it('debe crear un perfil válido sin teléfono (opcional)', async () => {
      const event = createMockPostEvent({
        first_name: 'María',
        last_name: 'García'
        // sin phone
      });

      const result = await service.CreateProfile(event, testUserId, testEmail);

      expect(result.statusCode).toBe(200);
      const body = parseResponseBody(result);
      expect(body.data.phone).toBeNull();
    });

    it('debe rechazar si falta first_name', async () => {
      const event = createMockPostEvent({
        last_name: 'Pérez',
        phone: '+34 912 345 678'
      });

      const result = await service.CreateProfile(event, testUserId, testEmail);

      expect(result.statusCode).toBe(400);
      const body = parseResponseBody(result);
      expect(body.success).toBe(false);
      expect(body.data.errors).toBeDefined();
      expect(body.data.errors.length).toBeGreaterThan(0);
    });

    it('debe rechazar si falta last_name', async () => {
      const event = createMockPostEvent({
        first_name: 'Juan',
        phone: '+34 912 345 678'
      });

      const result = await service.CreateProfile(event, testUserId, testEmail);

      expect(result.statusCode).toBe(400);
      const body = parseResponseBody(result);
      expect(body.success).toBe(false);
      expect(body.data.errors).toBeDefined();
      expect(body.data.errors.length).toBeGreaterThan(0);
    });

    it('debe rechazar first_name vacío', async () => {
      const event = createMockPostEvent({
        first_name: '',
        last_name: 'Pérez'
      });

      const result = await service.CreateProfile(event, testUserId, testEmail);

      expect(result.statusCode).toBe(400);
    });

    it('debe rechazar first_name mayor a 50 caracteres', async () => {
      const event = createMockPostEvent({
        first_name: 'a'.repeat(51),
        last_name: 'Pérez'
      });

      const result = await service.CreateProfile(event, testUserId, testEmail);

      expect(result.statusCode).toBe(400);
    });

    it('debe rechazar teléfono con formato inválido', async () => {
      const event = createMockPostEvent({
        first_name: 'Juan',
        last_name: 'Pérez',
        phone: 'abc123'  // Formato inválido
      });

      const result = await service.CreateProfile(event, testUserId, testEmail);

      expect(result.statusCode).toBe(400);
      const body = parseResponseBody(result);
      expect(body.success).toBe(false);
      expect(body.data.errors).toBeDefined();
      expect(body.data.errors.length).toBeGreaterThan(0);
    });

    it('debe retornar 409 Conflict si el perfil ya existe', async () => {
      // Crear perfil la primera vez
      const event1 = createMockPostEvent({
        first_name: 'Juan',
        last_name: 'Pérez'
      });
      await service.CreateProfile(event1, testUserId, testEmail);

      // Intentar crear de nuevo con mismo userId
      const event2 = createMockPostEvent({
        first_name: 'María',
        last_name: 'García'
      });
      const result = await service.CreateProfile(event2, testUserId, testEmail);

      expect(result.statusCode).toBe(409);
      const body = parseResponseBody(result);
      expect(body.message).toContain('ya existe');
    });

    it('debe rechazar si no hay email para crear perfil', async () => {
      const event = createMockPostEvent({
        first_name: 'Juan',
        last_name: 'Pérez'
      });

      const result = await service.CreateProfile(event, testUserId, undefined);

      expect(result.statusCode).toBe(400);
      const body = parseResponseBody(result);
      expect(body.message).toContain('Email');
    });

    it('debe rechazar JSON inválido', async () => {
      const event = createMockPostEvent('invalid json');
      event.body = '{invalid json}';

      const result = await service.CreateProfile(event, testUserId, testEmail);

      expect(result.statusCode).toBeGreaterThanOrEqual(400);
      expect(result.statusCode).toBeLessThan(600);
    });

    it('debe rechazar body vacío', async () => {
      const event = createMockPostEvent({});
      event.body = '';

      const result = await service.CreateProfile(event, testUserId, testEmail);

      expect(result.statusCode).toBe(400);
    });
  });

  // ========================================
  // ✅ TESTS: UpdateProfile
  // ========================================

  describe('UpdateProfile', () => {
    beforeEach(async () => {
      // Crear perfil antes de cada test de update
      const createEvent = createMockPostEvent({
        first_name: 'Juan',
        last_name: 'Pérez',
        phone: '+34 912 345 678'
      });
      await service.CreateProfile(createEvent, testUserId, testEmail);
    });

    it('debe actualizar el primer nombre correctamente', async () => {
      const event = createMockPostEvent({
        first_name: 'Carlos'
      });

      const result = await service.UpdateProfile(event, testUserId);

      expect(result.statusCode).toBe(200);
      const body = parseResponseBody(result);
      expect(body.data.first_name).toBe('Carlos');
      expect(body.data.last_name).toBe('Pérez');  // Sin cambios
    });

    it('debe actualizar el apellido correctamente', async () => {
      const event = createMockPostEvent({
        last_name: 'García'
      });

      const result = await service.UpdateProfile(event, testUserId);

      expect(result.statusCode).toBe(200);
      const body = parseResponseBody(result);
      expect(body.data.first_name).toBe('Juan');  // Sin cambios
      expect(body.data.last_name).toBe('García');
    });

    it('debe actualizar múltiples campos', async () => {
      const event = createMockPostEvent({
        first_name: 'Carlos',
        last_name: 'López',
        phone: '+1 555 123 4567'
      });

      const result = await service.UpdateProfile(event, testUserId);

      expect(result.statusCode).toBe(200);
      const body = parseResponseBody(result);
      expect(body.data.first_name).toBe('Carlos');
      expect(body.data.last_name).toBe('López');
      expect(body.data.phone).toBe('+1 555 123 4567');
    });

    it('debe permitir actualizar con body vacío (no cambiar nada)', async () => {
      const event = createMockPostEvent({});

      const result = await service.UpdateProfile(event, testUserId);

      expect(result.statusCode).toBe(200);
      const body = parseResponseBody(result);
      // Debe mantener valores originales
      expect(body.data.first_name).toBe('Juan');
      expect(body.data.last_name).toBe('Pérez');
    });

    it('debe retornar 404 si el perfil no existe', async () => {
      const newUserId = TestUtils.generateUUID();
      const event = createMockPostEvent({
        first_name: 'Carlos'
      });

      const result = await service.UpdateProfile(event, newUserId);

      expect(result.statusCode).toBe(404);
      const body = parseResponseBody(result);
      expect(body.message).toContain('no encontrado');
    });

    it('debe rechazar first_name mayor a 50 caracteres', async () => {
      const event = createMockPostEvent({
        first_name: 'a'.repeat(51)
      });

      const result = await service.UpdateProfile(event, testUserId);

      expect(result.statusCode).toBe(400);
    });
  });

  // ========================================
  // ✅ TESTS: GetProfile
  // ========================================

  describe('GetProfile', () => {
    it('debe obtener perfil existente', async () => {
      // Crear perfil
      const createEvent = createMockPostEvent({
        first_name: 'Juan',
        last_name: 'Pérez'
      });
      await service.CreateProfile(createEvent, testUserId, testEmail);

      // Obtener perfil
      const getEvent = createMockPathParamsEvent({});
      const result = await service.GetProfile(getEvent, testUserId, testEmail);

      expect(result.statusCode).toBe(200);
      const body = parseResponseBody(result);
      expect(body.data.first_name).toBe('Juan');
      expect(body.data.last_name).toBe('Pérez');
    });

    it('debe crear perfil automáticamente si no existe (lazy provisioning)', async () => {
      const getEvent = createMockPathParamsEvent({});
      const result = await service.GetProfile(getEvent, testUserId, testEmail);

      expect(result.statusCode).toBe(200);
      const body = parseResponseBody(result);
      // Debe haber creado nombres automáticamente
      expect(body.data.first_name).toBeDefined();
      expect(body.data.last_name).toBeDefined();
      expect(body.data.cognito_user_id).toBe(testUserId);
    });

    it('debe retornar 400 si falta email para lazy provisioning', async () => {
      const getEvent = createMockPathParamsEvent({});
      const result = await service.GetProfile(getEvent, testUserId, undefined);

      expect(result.statusCode).toBe(400);
      const body = parseResponseBody(result);
      expect(body.message).toContain('Email');
    });

    it('debe generar nombres desde el email en lazy provisioning', async () => {
      const email = 'nueva.persona@example.com';
      const getEvent = createMockPathParamsEvent({});
      const result = await service.GetProfile(getEvent, testUserId, email);

      expect(result.statusCode).toBe(200);
      const body = parseResponseBody(result);
      expect(body.data.first_name).toBeDefined();
      expect(body.data.last_name).toBeDefined();
    });
  });
});

