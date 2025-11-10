/**
 * 🔐 Schemas de Validación para Configuración
 * 
 * REGLA #5: SIEMPRE validar datos de entrada con schemas (Zod)
 * REGLA #4: Centralizar validación de constantes
 * 
 * Estos schemas validan:
 * - Variables de entorno
 * - Valores por defecto
 * - Estructura de SERVICE_CONFIG
 * - Límites de negocio
 * - Configuración de infraestructura
 */

import { z } from 'zod';

// ========================================
// 🌍 ESQUEMAS GLOBALES
// ========================================

export const GlobalConfigSchema = z.object({
  PROJECT_NAME: z
    .string()
    .min(3, 'PROJECT_NAME debe tener al menos 3 caracteres')
    .max(50, 'PROJECT_NAME no puede exceder 50 caracteres'),
  
  AWS_REGION: z
    .enum(['eu-central-1', 'us-east-1', 'eu-west-1', 'ap-southeast-1'])
    .default('eu-central-1'),
});

// ========================================
// 🏗️ ESQUEMAS DE INFRAESTRUCTURA
// ========================================

export const InfrastructureConfigSchema = z.object({
  LAMBDA_TIMEOUT_SECONDS: z
    .number()
    .int('Timeout debe ser entero')
    .min(1, 'Timeout mínimo: 1s')
    .max(900, 'Timeout máximo: 900s (límite AWS)')
    .default(10),
  
  LAMBDA_MEMORY_MB: z
    .number()
    .int('Memoria debe ser entero')
    .min(128, 'Memoria mínima: 128MB')
    .max(10240, 'Memoria máxima: 10GB')
    .default(512),
  
  LAMBDA_EPHEMERAL_STORAGE_MB: z
    .number()
    .int('Storage debe ser entero')
    .min(512, 'Storage mínimo: 512MB')
    .max(10240, 'Storage máximo: 10GB')
    .default(512),
  
  API_GATEWAY_THROTTLING_RATE_LIMIT: z
    .number()
    .int()
    .min(1, 'Rate limit mínimo: 1 request/s')
    .max(40000, 'Rate limit máximo: 40k requests/s')
    .default(50),
  
  API_GATEWAY_THROTTLING_BURST_LIMIT: z
    .number()
    .int()
    .min(1, 'Burst limit mínimo: 1 request')
    .max(40000, 'Burst limit máximo: 40k requests')
    .default(100),
});

// ========================================
// 🗄️ ESQUEMAS DE S3
// ========================================

export const S3ConfigSchema = z.object({
  IMAGE_MAX_SIZE_MB: z
    .number()
    .int()
    .min(1, 'Tamaño mínimo: 1MB')
    .max(100, 'Tamaño máximo: 100MB')
    .default(5),
});

// ========================================
// 📊 ESQUEMAS DE LÍMITES DE NEGOCIO
// ========================================

export const BusinessLimitsSchema = z.object({
  PRODUCT: z.object({
    NAME_MAX_LENGTH: z.number().int().min(10, 'Mínimo 10').max(1000, 'Máximo 1000').default(200),
    NAME_MIN_LENGTH: z.number().int().min(1, 'Mínimo 1').max(50, 'Máximo 50').default(3),
    DESCRIPTION_MAX_LENGTH: z.number().int().min(100, 'Mínimo 100').max(10000, 'Máximo 10000').default(2000),
    PRICE_MIN: z.number().positive('Precio mínimo debe ser positivo').min(0.01, 'Min 0.01').default(0.01),
    PRICE_MAX: z.number().positive().max(999999999.99, 'Máximo 999M').default(999999.99),
  }),
  
  CATEGORY: z.object({
    NAME_MAX_LENGTH: z.number().int().min(10, 'Mínimo 10').max(500, 'Máximo 500').default(100),
    NAME_MIN_LENGTH: z.number().int().min(1, 'Mínimo 1').max(50, 'Máximo 50').default(2),
    DESCRIPTION_MAX_LENGTH: z.number().int().min(50, 'Mínimo 50').max(2000, 'Máximo 2000').default(500),
  }),
  
  DEAL: z.object({
    DISCOUNT_MIN: z.number().min(0, 'Mínimo 0').max(100, 'Máximo 100').default(0),
    DISCOUNT_MAX: z.number().min(1, 'Mínimo 1').max(100, 'Máximo 100').default(100),
  }),
  
  PAGINATION: z.object({
    DEFAULT_PAGE_SIZE: z.number().int().min(1).max(1000).default(20),
    MAX_PAGE_SIZE: z.number().int().min(1).max(10000).default(100),
  }),
});

// ========================================
// 📝 ESQUEMAS DE LOGGING
// ========================================

export const LogConfigSchema = z.object({
  LEVEL: z
    .enum(['debug', 'info', 'warn', 'error'])
    .default('info'),
  
  REQUEST_DETAILS: z.boolean().default(false),
});

// ========================================
// 🎨 ESQUEMAS DE CORS
// ========================================

export const CorsConfigSchema = z.object({
  ENABLED: z.boolean().default(false),
  ALLOWED_ORIGINS: z.array(z.string()).default(['*']),
});

// ========================================
// ⏱️ ESQUEMAS DE TIMEOUTS
// ========================================

export const TimeoutConfigSchema = z.object({
  API_REQUEST_TIMEOUT_MS: z
    .number()
    .int()
    .min(100, 'Timeout mínimo: 100ms')
    .max(30000, 'Timeout máximo: 30s')
    .default(5000),
});

// ========================================
// 🔒 ESQUEMAS DE AUTENTICACIÓN
// ========================================

export const AuthConfigSchema = z.object({
  COGNITO_POOL_ID: z
    .string()
    .regex(/^[a-z0-9_-]+_[a-zA-Z0-9]+$/, 'COGNITO_POOL_ID formato inválido (ej: eu-central-1_abc123)')
    .min(10, 'COGNITO_POOL_ID demasiado corto'),
  
  COGNITO_APP_CLIENT_ID: z
    .string()
    .min(20, 'COGNITO_APP_CLIENT_ID demasiado corto')
    .max(128, 'COGNITO_APP_CLIENT_ID demasiado largo'),
});

// ========================================
// 🗄️ ESQUEMAS DE MONGODB
// ========================================

export const MongoDBConfigSchema = z.object({
  MAX_POOL_SIZE: z
    .number()
    .int()
    .min(1, 'Pool size mínimo: 1')
    .max(100, 'Pool size máximo: 100')
    .default(10),
  
  MIN_POOL_SIZE: z
    .number()
    .int()
    .min(0, 'Min pool size mínimo: 0')
    .max(50, 'Min pool size máximo: 50')
    .default(2),
  
  SERVER_SELECTION_TIMEOUT_MS: z
    .number()
    .int()
    .min(100, 'Timeout mínimo: 100ms')
    .default(5000),
  
  SOCKET_TIMEOUT_MS: z
    .number()
    .int()
    .min(1000, 'Timeout mínimo: 1s')
    .default(45000),
  
  CONNECT_TIMEOUT_MS: z
    .number()
    .int()
    .min(1000, 'Timeout mínimo: 1s')
    .default(10000),
  
  MAX_IDLE_TIME_MS: z
    .number()
    .int()
    .min(1000, 'Timeout mínimo: 1s')
    .default(60000),
  
  RETRY_WRITES: z.boolean().default(true),
  RETRY_READS: z.boolean().default(true),
  AUTO_INDEX: z.boolean().default(false),
});

// ========================================
// 🏷️ ESQUEMAS DE SERVICIO
// ========================================

export const ServiceConfigSchema = z.object({
  identity: z.object({
    name: z
      .string()
      .min(3, 'Nombre del servicio debe tener al menos 3 caracteres')
      .regex(/^[a-z0-9-]+$/, 'Nombre debe ser lowercase con guiones (ej: product-service)')
      .describe('Nombre del servicio'),
    
    displayName: z
      .string()
      .min(3, 'Nombre para display debe tener al menos 3 caracteres')
      .describe('Nombre para display (ej: Product Service)'),
    
    description: z
      .string()
      .min(10, 'Descripción debe tener al menos 10 caracteres'),
  }),
  
  infrastructure: z.object({
    stack: z.object({
      name: z
        .string()
        .regex(/^[A-Z][a-zA-Z0-9]*Stack$/, 'Stack name debe seguir patrón: ProductServiceStack')
        .describe('Nombre del stack CDK'),
      
      serviceStackName: z.string().min(3),
      
      apiGatewayName: z
        .string()
        .regex(/^[A-Z][a-zA-Z0-9]*$/)
        .describe('Nombre del API Gateway'),
      
      s3BucketName: z.string()
        .regex(/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/, 
          'Bucket: 3-63 chars, lowercase/numbers/hyphen, start/end con letter o number'),
    }),
  }),
  
  lambdas: z.object({
    main: z.string().regex(/^[a-z0-9-]+$/, 'Lambda names deben ser kebab-case'),
    category: z.string().regex(/^[a-z0-9-]+$/, 'Lambda names deben ser kebab-case'),
    deal: z.string().regex(/^[a-z0-9-]+$/, 'Lambda names deben ser kebab-case'),
    image: z.string().regex(/^[a-z0-9-]+$/, 'Lambda names deben ser kebab-case'),
    queue: z.string().regex(/^[a-z0-9-]+$/, 'Lambda names deben ser kebab-case'),
  }),
  
  database: z.object({
    secretName: z.string().min(3),
    secretDescription: z.string().min(10),
  }),
  
  code: z.object({
    files: z.object({
      mainApi: z.string().min(3),
      categoryApi: z.string().min(3),
      dealApi: z.string().min(3),
      imageApi: z.string().min(3),
      mainService: z.string().min(3),
      categoryService: z.string().min(3),
    }),
    classes: z.object({
      mainService: z.string().min(3),
      categoryService: z.string().min(3),
      dealService: z.string().min(3),
      imageService: z.string().min(3),
      mainRepository: z.string().min(3),
      categoryRepository: z.string().min(3),
    }),
  }),
  
  api: z.object({
    routes: z.object({
      base: z.string().startsWith('/'),
      category: z.string().startsWith('/'),
      deal: z.string().startsWith('/'),
      image: z.string().startsWith('/'),
    }),
  }),
  
  naming: z.object({
    prefixes: z.object({
      project: z.string().min(3),
      s3Bucket: z.string().min(3),
      logGroup: z.string().min(3),
      secret: z.string().min(3),
    }),
    entities: z.object({
      main: z.string().min(3),
      category: z.string().min(3),
      deal: z.string().min(3),
      image: z.string().min(3),
    }),
  }),
});

// ========================================
// 🌐 ESQUEMA COMPLETO DE CONFIGURACIÓN
// ========================================

export const CompleteConfigSchema = z.object({
  global: GlobalConfigSchema,
  infrastructure: InfrastructureConfigSchema,
  s3: S3ConfigSchema,
  businessLimits: BusinessLimitsSchema,
  log: LogConfigSchema,
  cors: CorsConfigSchema,
  timeout: TimeoutConfigSchema,
  auth: AuthConfigSchema,
  mongodb: MongoDBConfigSchema,
  service: ServiceConfigSchema,
});

export type ValidatedConfig = z.infer<typeof CompleteConfigSchema>;

