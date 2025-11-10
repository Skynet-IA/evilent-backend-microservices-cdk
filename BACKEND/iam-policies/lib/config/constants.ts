/**
 * Configuración centralizada para IAM Policies Stack
 * 
 * Todos los valores configurables están aquí para evitar hardcoding
 * y facilitar cambios futuros sin modificar el código de infraestructura.
 */

// ========================================
// 🌍 CONFIGURACIÓN GENERAL
// ========================================

/**
 * Región de AWS por defecto
 * Puede ser sobrescrita por CDK_DEFAULT_REGION
 */
export const DEFAULT_AWS_REGION = process.env.CDK_DEFAULT_REGION || 'eu-central-1';

/**
 * Prefijo del proyecto para nombrar recursos
 */
export const PROJECT_PREFIX = 'Evilent';

/**
 * Nombre del usuario IAM desarrollador
 * Este usuario recibirá las políticas creadas
 */
export const DEVELOPER_IAM_USER = process.env.DEVELOPER_IAM_USER || 'skynet-developer';

// ========================================
// 🔐 CONFIGURACIÓN DE POLÍTICAS IAM
// ========================================

/**
 * Nombres de las políticas IAM
 */
export const POLICY_NAMES = {
  USER_SERVICE: `${PROJECT_PREFIX}UserServiceDeveloperPolicy`,
  PRODUCT_SERVICE: `${PROJECT_PREFIX}ProductServiceDeveloperPolicy`,
  SHARED_MONITORING: `${PROJECT_PREFIX}SharedMonitoringPolicy`,
} as const;

/**
 * Nombres de los outputs de CloudFormation
 */
export const OUTPUT_KEYS = {
  USER_SERVICE_POLICY_ARN: 'UserServicePolicyArn',
  PRODUCT_SERVICE_POLICY_ARN: 'ProductServicePolicyArn',
  SHARED_MONITORING_POLICY_ARN: 'SharedMonitoringPolicyArn',
} as const;

/**
 * Nombres de exports de CloudFormation (para cross-stack references)
 */
export const EXPORT_NAMES = {
  USER_SERVICE_POLICY_ARN: `${PROJECT_PREFIX}UserServiceDeveloperPolicyArn`,
  PRODUCT_SERVICE_POLICY_ARN: `${PROJECT_PREFIX}ProductServiceDeveloperPolicyArn`,
  SHARED_MONITORING_POLICY_ARN: `${PROJECT_PREFIX}SharedMonitoringPolicyArn`,
} as const;

// ========================================
// 📋 RECURSOS AWS - USER SERVICE
// ========================================

/**
 * Prefijos de recursos para User Service
 */
export const USER_SERVICE_RESOURCES = {
  SECRETS_PREFIX: 'evilent/user-service/*',
  EC2_TAG_SERVICE: 'UserService',
  EC2_TAG_COMPONENT: 'Bastion',
  LAMBDA_LOG_GROUP_PREFIX: '/aws/lambda/UserService*',
  SSM_LOG_GROUP_PREFIX: '/aws/ssm/*',
  CLOUDFORMATION_STACK_PREFIX: 'UserService*',
} as const;

// ========================================
// 📦 RECURSOS AWS - PRODUCT SERVICE
// ========================================

/**
 * Prefijos de recursos para Product Service
 */
export const PRODUCT_SERVICE_RESOURCES = {
  SECRETS_PREFIX: 'prod/product-service/*',
  S3_BUCKET_NAME: 'evilent-product-images',
  LAMBDA_LOG_GROUP_PREFIX: '/aws/lambda/ProductService*',
  CLOUDFORMATION_STACK_PREFIX: 'ProductService*',
} as const;

// ========================================
// 📊 RECURSOS AWS - COMPARTIDOS
// ========================================

/**
 * Prefijos de recursos compartidos entre servicios
 */
export const SHARED_RESOURCES = {
  LAMBDA_LOG_GROUP_PREFIX: `/aws/lambda/${PROJECT_PREFIX}*`,
} as const;

// ========================================
// 🔧 ACCIONES IAM - SECRETS MANAGER
// ========================================

export const SECRETS_MANAGER_ACTIONS = [
  'secretsmanager:GetSecretValue',
  'secretsmanager:DescribeSecret',
  'secretsmanager:ListSecrets',
] as const;

// ========================================
// 🔧 ACCIONES IAM - EC2
// ========================================

export const EC2_BASTION_ACTIONS = [
  'ec2:StartInstances',
  'ec2:StopInstances',
  'ec2:DescribeInstances',
  'ec2:DescribeInstanceStatus',
] as const;

// ========================================
// 🔧 ACCIONES IAM - S3
// ========================================

export const S3_BUCKET_ACTIONS = [
  's3:GetObject',
  's3:PutObject',
  's3:DeleteObject',
  's3:ListBucket',
] as const;

// ========================================
// 🔧 ACCIONES IAM - CLOUDWATCH LOGS
// ========================================

export const CLOUDWATCH_LOGS_ACTIONS = [
  'logs:DescribeLogGroups',
  'logs:DescribeLogStreams',
  'logs:GetLogEvents',
  'logs:FilterLogEvents',
] as const;

// ========================================
// 🔧 ACCIONES IAM - CLOUDFORMATION
// ========================================

export const CLOUDFORMATION_ACTIONS = [
  'cloudformation:DescribeStacks',
  'cloudformation:DescribeStackEvents',
  'cloudformation:GetTemplate',
  'cloudformation:ListStacks',
] as const;

export const CLOUDFORMATION_ACTIONS_SHARED = [
  'cloudformation:DescribeStacks',
  'cloudformation:ListStacks',
  'cloudformation:DescribeStackResources',
] as const;

// ========================================
// 🔧 ACCIONES IAM - X-RAY
// ========================================

export const XRAY_ACTIONS = [
  'xray:GetTraceSummaries',
  'xray:GetTraceGraph',
  'xray:GetServiceGraph',
] as const;

