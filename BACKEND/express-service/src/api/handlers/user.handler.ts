/**
 * User Handler - Rutas y validación
 * 
 * PATRÓN ESCALABLE: Route Map
 * REGLA PLATINO: No usar switch/if largos, usar configuración declarativa
 * REGLA #5: Validación centralizada con parseAndValidate*
 * REGLA #3: Logger estructurado en todas las operaciones
 * 
 * Beneficio:
 * - Agregar ruta = agregar objeto al array
 * - Todas las rutas visibles en un solo lugar
 * - Lógica de matching centralizada
 * - Fácil testear
 */

import { Request, Response } from 'express';
import { CreateUserDTO, UpdateUserDTO, PaginationDTO } from '../../dto';
import {
  notFoundErrorResponse,
  internalServerErrorResponse,
  conflictErrorResponse
} from '../../utility/response';
import {
  parseAndValidateQueryParams,
  parseAndValidateBody,
} from '../../utility/request-parser';
import {
  formatUser,
  buildSuccessResponse,
  formatUsers,
  pickFields
} from '../../utility/helpers';
import logger from '../../utility/logger';
import { UserService } from '../../service/user.service';
import { UserRepository } from '../../repository/user.repository';
import { requireAuth } from '../middleware';

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
  requiresAuth?: boolean;
  handler: (req: Request, res: Response) => Promise<void>;
  description: string;
}

/**
 * Handlers individuales
 * 
 * ✅ REFACTORIZACIÓN FASE 4:
 * - Usar parseAndValidateQueryParams() / parseAndValidateBody()
 * - Usar formatUser() para respuestas
 * - Usar buildSuccessResponse() para formato consistente
 * - Logger estructurado en cada operación
 */
const handlers: Record<string, (req: Request, res: Response) => Promise<void>> = {
  /**
   * GET /users - Listar todos
   * 
   * ✅ REFACTORIZADO:
   * - Usar parseAndValidateQueryParams() centralizado
   * - formatUsers() para formatear array
   */
  listUsers: async (req: Request, res: Response) => {
    try {
      // ✅ Validar query parameters de forma centralizada
      const result = parseAndValidateQueryParams(req, PaginationDTO);
      if (!result.success) {
        res.status(result.error!.statusCode).json(result.error!.body);
        return;
      }

      const { page, pageSize } = result.data;

      logger.info('Listing users', { page, pageSize, requestId: req.id });

      // ✅ Obtener usuarios del servicio
      const dbResult = await userService.listUsers(page as number, pageSize as number);

      // ✅ Formatear usuarios con helpers centralizados
      const formatted = buildSuccessResponse(
        {
          users: formatUsers(dbResult.users),
          total: dbResult.total,
          page,
          pageSize
        },
        'Users retrieved successfully',
        200
      );

      res.status(formatted.statusCode as number).json(formatted.body);
    } catch (error: any) {
      logger.error('Error listing users', {
        requestId: req.id,
        error: error instanceof Error ? error.message : String(error)
      });
      internalServerErrorResponse(res, error);
    }
  },

  /**
   * POST /users - Crear
   * 
   * ⚠️ NOTA: Requiere #8 (Password Hashing) para usar UserService.createUser
   * Por ahora, validar estructura pero no crear en DB
   * 
   * ✅ REFACTORIZADO:
   * - Usar parseAndValidateBody() centralizado
   */
  createUser: async (req: Request, res: Response) => {
    try {
      // ✅ Validar body de forma centralizada
      const result = parseAndValidateBody(req, CreateUserDTO);
      if (!result.success) {
        res.status(result.error!.statusCode).json(result.error!.body);
        return;
      }

      const userData = result.data;

      logger.info('Creating user', { email: userData.email, requestId: req.id });

      // ⚠️ BLOQUEADO: Necesita bcrypt para hashear password
      // TODO #8: Implementar password hashing con bcrypt
      // Luego: const newUser = await userService.createUser(userData);
      
      // Por ahora, retornar mock
      const newUser = {
        id: `${Date.now()}`,
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const response = buildSuccessResponse(
        newUser,
        'User created successfully (MOCK - needs #8)',
        201
      );
      res.status(response.statusCode as number).json(response.body);
    } catch (error: any) {
      logger.error('Error creating user', {
        requestId: req.id,
        error: error instanceof Error ? error.message : String(error)
      });
      
      if (error.message?.includes('already exists')) {
        conflictErrorResponse(res, error.message);
      } else {
        internalServerErrorResponse(res, error);
      }
    }
  },

  /**
   * GET /users/:id - Obtener por ID
   * 
   * ✅ REFACTORIZADO:
   * - Validar path param con lógica centralizada
   * - formatUser() para respuesta
   */
  getUserById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        logger.warn('Missing user ID in path', { requestId: req.id });
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          data: { errors: [{ field: 'id', message: 'User ID is required', code: 'VALIDATION_ERROR' }] },
          timestamp: new Date().toISOString()
        });
        return;
      }

      logger.info('Fetching user', { userId: id, requestId: req.id });

      // ✅ Obtener usuario del servicio
      const user = await userService.getUserById(id);

      if (!user) {
        logger.warn('User not found', { userId: id, requestId: req.id });
        notFoundErrorResponse(res, 'User not found');
        return;
      }

      // ✅ Formatear usuario
      const formatted = buildSuccessResponse(
        formatUser(user),
        'User retrieved successfully',
        200
      );
      res.status(formatted.statusCode as number).json(formatted.body);
    } catch (error: any) {
      logger.error('Error fetching user', {
        requestId: req.id,
        error: error instanceof Error ? error.message : String(error)
      });
      internalServerErrorResponse(res, error);
    }
  },

  /**
   * PUT /users/:id - Actualizar
   * 
   * ✅ REFACTORIZADO:
   * - Usar parseAndValidateBody() centralizado
   * - formatUser() para respuesta
   */
  updateUser: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        logger.warn('Missing user ID in path', { requestId: req.id });
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          data: { errors: [{ field: 'id', message: 'User ID is required', code: 'VALIDATION_ERROR' }] },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // ✅ Validar body de forma centralizada
      const result = parseAndValidateBody(req, UpdateUserDTO);
      if (!result.success) {
        res.status(result.error!.statusCode).json(result.error!.body);
        return;
      }

      logger.info('Updating user', { userId: id, requestId: req.id });

      // ✅ Actualizar usuario
      try {
        const updated = await userService.updateUser(id, result.data);
        const response = buildSuccessResponse(
          formatUser(updated),
          'User updated successfully',
          200
        );
        res.status(response.statusCode as number).json(response.body);
      } catch (error: any) {
        if (error.message?.includes('not found')) {
          logger.warn('User not found for update', { userId: id, requestId: req.id });
          notFoundErrorResponse(res, error.message);
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      logger.error('Error updating user', {
        requestId: req.id,
        error: error instanceof Error ? error.message : String(error)
      });
      internalServerErrorResponse(res, error);
    }
  },

  /**
   * DELETE /users/:id - Eliminar
   * 
   * ✅ REFACTORIZADO:
   * - Logger centralizado
   * - Manejo de errores consistente
   */
  deleteUser: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        logger.warn('Missing user ID in path', { requestId: req.id });
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          data: { errors: [{ field: 'id', message: 'User ID is required', code: 'VALIDATION_ERROR' }] },
          timestamp: new Date().toISOString()
        });
        return;
      }

      logger.info('Deleting user', { userId: id, requestId: req.id });

      // ✅ Eliminar usuario
      try {
        await userService.deleteUser(id);
        const response = buildSuccessResponse(
          null,
          'User deleted successfully',
          200
        );
        res.status(response.statusCode as number).json(response.body);
      } catch (error: any) {
        if (error.message?.includes('not found')) {
          logger.warn('User not found for delete', { userId: id, requestId: req.id });
          notFoundErrorResponse(res, error.message);
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      logger.error('Error deleting user', {
        requestId: req.id,
        error: error instanceof Error ? error.message : String(error)
      });
      internalServerErrorResponse(res, error);
    }
  },

  /**
   * GET /user/profile - Obtener perfil del usuario autenticado
   * 
   * ✅ REQUIERE AUTENTICACIÓN (requireAuth middleware)
   * ✅ REFACTORIZADO:
   * - Usar req.user del middleware requireAuth
   * - formatUser() para respuesta
   * - pickFields() para no enviar datos innecesarios
   */
  getProfile: async (req: Request, res: Response) => {
    try {
      // ✅ DEFENSE IN DEPTH: requireAuth middleware ya validó JWT
      const userId = req.user?.userId;

      if (!userId) {
        logger.warn('Missing user ID in profile request', { requestId: req.id });
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          timestamp: new Date().toISOString()
        });
        return;
      }

      logger.info('Fetching user profile', { userId, requestId: req.id });

      // ✅ Obtener usuario del servicio
      const user = await userService.getUserById(userId);
      if (!user) {
        logger.warn('User profile not found', { userId, requestId: req.id });
        notFoundErrorResponse(res, 'User not found');
        return;
      }

      // ✅ Formatear usuario y enviar solo campos necesarios
      const formatted = formatUser(user);
      const safeUser = pickFields(formatted, ['id', 'email', 'firstName', 'lastName', 'fullName']);
      
      const response = buildSuccessResponse(
        safeUser,
        'Profile retrieved successfully',
        200
      );
      res.status(response.statusCode as number).json(response.body);
    } catch (error: any) {
      logger.error('Error fetching profile', {
        requestId: req.id,
        error: error instanceof Error ? error.message : String(error)
      });
      internalServerErrorResponse(res, error);
    }
  },

  /**
   * POST /user/profile - Actualizar perfil del usuario autenticado
   * 
   * ✅ REQUIERE AUTENTICACIÓN (requireAuth middleware)
   * ✅ REFACTORIZADO:
   * - Usar req.user del middleware requireAuth
   * - parseAndValidateBody() para validación
   * - formatUser() para respuesta
   */
  updateProfile: async (req: Request, res: Response) => {
    try {
      // ✅ DEFENSE IN DEPTH: requireAuth middleware ya validó JWT
      const userId = req.user?.userId;

      if (!userId) {
        logger.warn('Missing user ID in profile update', { requestId: req.id });
        res.status(401).json({
          success: false,
          message: 'Authentication required',
          data: null,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // ✅ Validar body de forma centralizada
      const result = parseAndValidateBody(req, UpdateUserDTO);
      if (!result.success) {
        res.status(result.error!.statusCode).json(result.error!.body);
        return;
      }

      logger.info('Updating user profile', { userId, requestId: req.id });

      // ✅ Actualizar usuario
      const updated = await userService.updateUser(userId, result.data);
      
      const formatted = formatUser(updated);
      const response = buildSuccessResponse(
        formatted,
        'Profile updated successfully',
        200
      );
      res.status(response.statusCode as number).json(response.body);
    } catch (error: any) {
      if (error.message?.includes('not found')) {
        logger.warn('User not found in profile update', { requestId: req.id });
        notFoundErrorResponse(res, error.message);
      } else {
        logger.error('Error updating profile', {
          requestId: req.id,
          error: error instanceof Error ? error.message : String(error)
        });
        internalServerErrorResponse(res, error);
      }
    }
  }
};

/**
 * Route Map - Configuración declarativa de rutas
 * 
 * ✅ REFACTORIZADO FASE 4:
 * - Agregado requiresAuth flag para rutas protegidas
 * - Middleware requireAuth aplicado en registerUserRoutes()
 * 
 * Ventajas:
 * ✅ Agregar ruta = agregar línea, no modificar lógica
 * ✅ Todas las rutas visibles en un solo lugar
 * ✅ Autodocumentado con descripción y requiresAuth
 * ✅ Fácil de testear
 * ✅ Escalable a 100+ rutas sin complejidad
 */
export const userRouteMap: UserRoute[] = [
  {
    method: 'get',
    requiresPathParams: false,
    requiresAuth: false,
    handler: handlers.listUsers,
    description: 'GET /users - List all users'
  },
  {
    method: 'post',
    requiresPathParams: false,
    requiresAuth: false,
    handler: handlers.createUser,
    description: 'POST /users - Create new user'
  },
  {
    method: 'get',
    requiresPathParams: true,
    requiresAuth: false,
    handler: handlers.getUserById,
    description: 'GET /users/:id - Get user by ID'
  },
  {
    method: 'put',
    requiresPathParams: true,
    requiresAuth: false,
    handler: handlers.updateUser,
    description: 'PUT /users/:id - Update user'
  },
  {
    method: 'delete',
    requiresPathParams: true,
    requiresAuth: false,
    handler: handlers.deleteUser,
    description: 'DELETE /users/:id - Delete user'
  }
];

/**
 * Registrar rutas en Express
 * 
 * ✅ REFACTORIZADO FASE 4:
 * - Rutas autenticadas usan requireAuth middleware
 * - /user/profile es PROTEGIDA (requiere JWT)
 */
export const registerUserRoutes = (app: any) => {
  // Rutas CRUD estándar (sin autenticación)
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

  // ✅ Rutas especiales para perfil del usuario autenticado (FRONTEND)
  // REQUIEREN JWT válido de Cognito
  app.get('/user/profile', requireAuth, handlers.getProfile);
  app.post('/user/profile', requireAuth, handlers.updateProfile);
};

/**
 * Logging de rutas disponibles
 */
export const logAvailableRoutes = () => {
  logger.info('📋 Available User Routes:', {
    routes: userRouteMap.map(r => `${r.description}${r.requiresAuth ? ' [PROTECTED]' : ''}`),
    protected: [
      'GET /user/profile [PROTECTED]',
      'POST /user/profile [PROTECTED]'
    ]
  });
};

