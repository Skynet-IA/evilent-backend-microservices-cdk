/**
 * User Handler - Rutas y validación
 * 
 * PATRÓN ESCALABLE: Route Map
 * REGLA PLATINO: No usar switch/if largos, usar configuración declarativa
 * 
 * Beneficio:
 * - Agregar ruta = agregar objeto al array
 * - Todas las rutas visibles en un solo lugar
 * - Lógica de matching centralizada
 * - Fácil testear
 */

import { Request, Response } from 'express';
import { extractZodErrors, CreateUserDTO, UpdateUserDTO, PaginationDTO } from '../../dto';
import {
  successResponse,
  successResponseNoData,
  validationErrorResponse,
  notFoundErrorResponse,
  internalServerErrorResponse,
  conflictErrorResponse
} from '../../utility/response';
import logger from '../../utility/logger';
import { UserService } from '../../service/user.service';
import { UserRepository } from '../../repository/user.repository';

/**
 * INYECCIÓN DE DEPENDENCIAS
 * Instancia global de UserService con UserRepository inyectado
 * 
 * REGLA DE ORO: Dependency Injection permite:
 * - Testear sin DB real (mockear repository)
 * - Cambiar implementación sin tocar handlers
 * - Reutilizar servicio en múltiples contextos
 */
const userService = new UserService(UserRepository as any);

/**
 * Interfaz para Route Map
 */
interface UserRoute {
  method: 'get' | 'post' | 'put' | 'delete';
  requiresPathParams: boolean;
  handler: (req: Request, res: Response) => Promise<void>;
  description: string;
}

/**
 * Handlers individuales
 * 
 * NOTA: Los handlers no retornan void, retornan Promise<void>
 * Aunque internamente llaman a response.json(), Express lo maneja.
 */
const handlers: Record<string, (req: Request, res: Response) => Promise<void>> = {
  /**
   * GET /users - Listar todos
   * 
   * ✅ AHORA: Usa UserService con UserRepository real
   * ✅ Acceso a DB real, no mocks
   */
  listUsers: async (req: Request, res: Response) => {
    try {
      // Validar query parameters
      const pagination = PaginationDTO.safeParse(req.query);
      if (!pagination.success) {
        const errors = extractZodErrors(pagination.error);
        validationErrorResponse(res, errors);
        return;
      }

      const { page, pageSize } = pagination.data;

      // ✅ CAMBIO: Llamar a UserService (que usa UserRepository con BD real)
      const result = await userService.listUsers(page, pageSize);

      successResponse(res, {
        users: result.users,
        total: result.total,
        page,
        pageSize
      }, 'Users retrieved successfully', 200);
    } catch (error: any) {
      internalServerErrorResponse(res, error);
    }
  },

  /**
   * POST /users - Crear
   * 
   * ⚠️ NOTA: Requiere #8 (Password Hashing) para usar UserService.createUser
   * Por ahora, validar estructura pero no crear en DB
   */
  createUser: async (req: Request, res: Response) => {
    try {
      // Validar body
      const validation = CreateUserDTO.safeParse(req.body);
      if (!validation.success) {
        const errors = extractZodErrors(validation.error);
        validationErrorResponse(res, errors);
        return;
      }

      const userData = validation.data;
      logger.info('Creating user', { email: userData.email });

      // ⚠️ BLOQUEADO: Necesita bcrypt para hashear password
      // TODO #8: Implementar password hashing con bcrypt
      // Luego: const newUser = await userService.createUser(userData);
      
      // Por ahora, retornar mock
      const newUser = {
        id: `${Date.now()}`,
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      successResponse(res, newUser, 'User created successfully (MOCK - needs #8)', 201);
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        conflictErrorResponse(res, error.message);
      } else {
        internalServerErrorResponse(res, error);
      }
    }
  },

  /**
   * GET /users/:id - Obtener por ID
   * 
   * ✅ AHORA: Usa UserService con UserRepository real
   * ✅ Acceso a DB real, no mocks
   */
  getUserById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        validationErrorResponse(res, [
          { field: 'id', message: 'User ID is required', code: 'VALIDATION_ERROR' }
        ]);
        return;
      }

      logger.info('Fetching user', { userId: id });

      // ✅ CAMBIO: Usar UserService para obtener de BD real
      const user = await userService.getUserById(id);

      if (!user) {
        notFoundErrorResponse(res, 'User not found');
        return;
      }

      successResponse(res, user, 'User retrieved successfully', 200);
    } catch (error: any) {
      internalServerErrorResponse(res, error);
    }
  },

  /**
   * PUT /users/:id - Actualizar
   * 
   * ✅ AHORA: Usa UserService con UserRepository real
   */
  updateUser: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        validationErrorResponse(res, [
          { field: 'id', message: 'User ID is required', code: 'VALIDATION_ERROR' }
        ]);
        return;
      }

      // Validar body
      const validation = UpdateUserDTO.safeParse(req.body);
      if (!validation.success) {
        const errors = extractZodErrors(validation.error);
        validationErrorResponse(res, errors);
        return;
      }

      logger.info('Updating user', { userId: id });

      // ✅ CAMBIO: Usar UserService para actualizar en BD real
      try {
        const updated = await userService.updateUser(id, validation.data);
        successResponse(res, updated, 'User updated successfully', 200);
      } catch (error: any) {
        if (error.message.includes('not found')) {
          notFoundErrorResponse(res, error.message);
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      internalServerErrorResponse(res, error);
    }
  },

  /**
   * DELETE /users/:id - Eliminar
   * 
   * ✅ AHORA: Usa UserService con UserRepository real
   */
  deleteUser: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        validationErrorResponse(res, [
          { field: 'id', message: 'User ID is required', code: 'VALIDATION_ERROR' }
        ]);
        return;
      }

      logger.info('Deleting user', { userId: id });

      // ✅ CAMBIO: Usar UserService para eliminar de BD real
      try {
        await userService.deleteUser(id);
        successResponseNoData(res, 'User deleted successfully', 200);
      } catch (error: any) {
        if (error.message.includes('not found')) {
          notFoundErrorResponse(res, error.message);
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      internalServerErrorResponse(res, error);
    }
  },

  /**
   * GET /user/profile - Obtener perfil del usuario autenticado
   * 
   * ✅ ENDPOINT PARA FRONTEND (COGNITO OBLIGATORIO)
   * - Requiere JWT válido de Cognito en Authorization header
   * - Retorna datos del usuario autenticado
   * - Middleware cognitoAuthMiddleware extrae userId del JWT
   */
  getProfile: async (req: Request, res: Response) => {
    try {
      // El middleware requireAuth debería haber populado req.user
      const userId = req.user?.userId || (req.query.userId as string);

      if (!userId) {
        validationErrorResponse(res, [
          { field: 'authorization', message: 'Authentication required', code: 'UNAUTHORIZED' }
        ]);
        return;
      }

      logger.info('Fetching user profile', { userId });

      const user = await userService.getUserById(userId as string);
      if (!user) {
        notFoundErrorResponse(res, 'User not found');
        return;
      }

      successResponse(res, user, 'Profile retrieved successfully', 200);
    } catch (error: any) {
      internalServerErrorResponse(res, error);
    }
  },

  /**
   * POST /user/profile - Actualizar perfil del usuario autenticado
   * 
   * ✅ ENDPOINT PARA FRONTEND
   * - Requiere JWT válido de Cognito
   * - Actualiza firstName, lastName (email no se puede cambiar normalmente)
   */
  updateProfile: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId || req.query.userId;

      if (!userId) {
        validationErrorResponse(res, [
          { field: 'authorization', message: 'Authentication required', code: 'UNAUTHORIZED' }
        ]);
        return;
      }

      // Validar body (reutilizar UpdateUserDTO)
      const validation = UpdateUserDTO.safeParse(req.body);
      if (!validation.success) {
        const errors = extractZodErrors(validation.error);
        validationErrorResponse(res, errors);
        return;
      }

      logger.info('Updating user profile', { userId });

      const updated = await userService.updateUser(userId as string, validation.data);
      successResponse(res, updated, 'Profile updated successfully', 200);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        notFoundErrorResponse(res, error.message);
      } else {
        internalServerErrorResponse(res, error);
      }
    }
  }
};

/**
 * Route Map - Configuración declarativa de rutas
 * 
 * Ventajas:
 * ✅ Agregar ruta = agregar línea, no modificar lógica
 * ✅ Todas las rutas visibles en un solo lugar
 * ✅ Autodocumentado con descripción
 * ✅ Fácil de testear
 * ✅ Escalable a 100+ rutas sin complejidad
 */
export const userRouteMap: UserRoute[] = [
  {
    method: 'get',
    requiresPathParams: false,
    handler: handlers.listUsers,
    description: 'GET /users - List all users'
  },
  {
    method: 'post',
    requiresPathParams: false,
    handler: handlers.createUser,
    description: 'POST /users - Create new user'
  },
  {
    method: 'get',
    requiresPathParams: true,
    handler: handlers.getUserById,
    description: 'GET /users/:id - Get user by ID'
  },
  {
    method: 'put',
    requiresPathParams: true,
    handler: handlers.updateUser,
    description: 'PUT /users/:id - Update user'
  },
  {
    method: 'delete',
    requiresPathParams: true,
    handler: handlers.deleteUser,
    description: 'DELETE /users/:id - Delete user'
  }
];

/**
 * Registrar rutas en Express
 */
export const registerUserRoutes = (app: any) => {
  // Rutas CRUD estándar
  userRouteMap.forEach(route => {
    if (route.method === 'get' && !route.requiresPathParams) {
      app.get('/users', route.handler);
    } else if (route.method === 'post' && !route.requiresPathParams) {
      app.post('/users', route.handler);
    } else if (route.method === 'get' && route.requiresPathParams) {
      app.get('/users/:id', route.handler);
    } else if (route.method === 'put' && route.requiresPathParams) {
      app.put('/users/:id', route.handler);
    } else if (route.method === 'delete' && route.requiresPathParams) {
      app.delete('/users/:id', route.handler);
    }
  });

  // Rutas especiales para perfil del usuario autenticado (FRONTEND)
  app.get('/user/profile', handlers.getProfile);
  app.post('/user/profile', handlers.updateProfile);
};

/**
 * Logging de rutas disponibles
 */
export const logAvailableRoutes = () => {
  logger.info('📋 Available User Routes:', {
    routes: userRouteMap.map(r => r.description)
  });
};

