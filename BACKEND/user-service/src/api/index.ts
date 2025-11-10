// API Layer - Arquitectura por capas
export { handler as userHandler } from './handlers/user-handler.js';

// Middlewares
export { AuthMiddleware } from './middleware/auth-middleware.js';
export { BodyParserMiddleware } from './middleware/body-parser.js';
export { CorsMiddleware } from './middleware/cors-middleware.js'; // Solo para desarrollo/testing

// Tipos compartidos
export * from '../types/api-types.js';
