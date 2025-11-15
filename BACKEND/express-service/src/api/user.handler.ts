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
import { extractZodErrors, CreateUserDTO, UpdateUserDTO, PaginationDTO } from '../dto';
import {
  successResponse,
  successResponseNoData,
  validationErrorResponse,
  notFoundErrorResponse,
  internalServerErrorResponse,
  conflictErrorResponse
} from '../utility/response';
import logger from '../utility/logger';

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
      
      // En producción, inyectar repositorio real
      logger.info('Listing users', { page, pageSize });
      
      // Mock response
      const mockUsers = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      successResponse(res, {
        users: mockUsers,
        total: 1,
        page,
        pageSize
      }, 'Users retrieved successfully', 200);
    } catch (error: any) {
      internalServerErrorResponse(res, error);
    }
  },

  /**
   * POST /users - Crear
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

      // Mock response
      const newUser = {
        id: `${Date.now()}`,
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      successResponse(res, newUser, 'User created successfully', 201);
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

      // Mock response
      if (id === '1') {
        const user = {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        successResponse(res, user, 'User retrieved successfully', 200);
        return;
      }

      notFoundErrorResponse(res, 'User not found');
    } catch (error: any) {
      internalServerErrorResponse(res, error);
    }
  },

  /**
   * PUT /users/:id - Actualizar
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

      // Mock response
      const updated = {
        id,
        firstName: validation.data.firstName || 'John',
        lastName: validation.data.lastName || 'Doe',
        email: validation.data.email || 'john@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      successResponse(res, updated, 'User updated successfully', 200);
    } catch (error: any) {
      internalServerErrorResponse(res, error);
    }
  },

  /**
   * DELETE /users/:id - Eliminar
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

      successResponseNoData(res, 'User deleted successfully', 200);
    } catch (error: any) {
      internalServerErrorResponse(res, error);
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
};

/**
 * Logging de rutas disponibles
 */
export const logAvailableRoutes = () => {
  logger.info('📋 Available User Routes:', {
    routes: userRouteMap.map(r => r.description)
  });
};

