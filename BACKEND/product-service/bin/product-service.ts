#!/usr/bin/env node
/// <reference types="node" />
import * as cdk from 'aws-cdk-lib';
import { ProductServiceStack } from '../lib/product-service-stack';

// Configuración mínima para permitir destroy sin depender de src/config
const SERVICE_CONFIG = {
  identity: {
    displayName: 'Product Service',
    description: 'Product Service Stack'
  },
  lambdas: {
    main: 'ProductFunction',
    category: 'CategoryFunction',
    deal: 'DealFunction',
    image: 'ImageFunction',
    queue: 'QueueFunction'
  },
  naming: {
    entities: {
      main: 'Product',
      category: 'Category',
      deal: 'Deal',
      image: 'Image'
    }
  },
  infrastructure: {
    stack: {
      name: 'ProductServiceStack'
    }
  }
} as any;

const app = new cdk.App();

// ========================================
// 🔧 CONFIGURACIÓN POR CONTEXTO
// ========================================
/**
 * Permite pasar configuración mediante context:
 * cdk deploy -c cognitoPoolId=eu-central-1_abc123
 *
 * O mediante variables de entorno:
 * COGNITO_POOL_ID=eu-central-1_abc123 cdk deploy
 */
const cognitoPoolId = app.node.tryGetContext('cognitoPoolId') || process.env.COGNITO_POOL_ID || '';
const cognitoAppClientId = app.node.tryGetContext('cognitoAppClientId') || process.env.COGNITO_APP_CLIENT_ID || '';
const mongodbUri = app.node.tryGetContext('mongodbUri') || process.env.MONGODB_URI || '';

// ========================================
// 📋 RESUMEN DE CONFIGURACIÓN
// ========================================

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║                                                                ║');
console.log(`║         📋 ${SERVICE_CONFIG.identity.displayName.toUpperCase()} STACK - CONFIGURACIÓN              ║`);
console.log('║                                                                ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

// Sección: Autenticación Cognito
console.log('🔐 AUTENTICACIÓN:');
if (!cognitoPoolId) {
  console.log('   ⚠️  Cognito NO configurado');
  console.log('       └─ Pool ID: NO CONFIGURADO');
  console.log('       └─ API Gateway sin autenticación (DESARROLLO SOLO)\n');
} else {
  console.log(`   ✅ CognitoPoolId: ${cognitoPoolId}\n`);
}

// Sección: Componentes del Servicio
console.log('🚀 COMPONENTES:');
console.log('   ✅ Lambda Functions:');
console.log(`       ├─ ${SERVICE_CONFIG.lambdas.main} (CRUD de ${SERVICE_CONFIG.naming.entities.main.toLowerCase()}s)`);
console.log(`       ├─ ${SERVICE_CONFIG.lambdas.category} (CRUD de ${SERVICE_CONFIG.naming.entities.category.toLowerCase()}s)`);
console.log(`       ├─ ${SERVICE_CONFIG.lambdas.deal} (CRUD de ${SERVICE_CONFIG.naming.entities.deal.toLowerCase()}s)`);
console.log(`       ├─ ${SERVICE_CONFIG.lambdas.image} (Subida de ${SERVICE_CONFIG.naming.entities.image.toLowerCase()}s)`);
console.log(`       └─ ${SERVICE_CONFIG.lambdas.queue} (Cola de mensajes)`);
console.log('   ✅ API Gateway REST API (con rate limiting)');
console.log('   ✅ S3 Bucket (almacenamiento de imágenes)');
console.log('   ✅ CloudWatch Logs (monitoreo)\n');

// Sección: Resumen de Costos
console.log('💰 RESUMEN DE COSTOS:');
console.log('   ├─ Lambda (5 funciones): $0-2/mes (free tier)');
console.log('   ├─ API Gateway: $0-3/mes (free tier)');
console.log('   ├─ S3 Storage: $0-1/mes (por GB)');
console.log('   ├─ CloudWatch Logs: $0.50/mes');
console.log('   └─ TOTAL: ~$0-5/mes (desarrollo)\n');

// Sección: Próximos Pasos
console.log('🚀 PRÓXIMOS PASOS:');
console.log('   1. Verificar configuración arriba ⬆️');
if (!cognitoPoolId) {
  console.log('   2. ⚠️  IMPORTANTE: Configura CognitoPoolId para usar autenticación');
  console.log('      └─ Uso: cdk deploy --parameters CognitoPoolId=eu-central-1_xxx');
}
console.log('   3. Ejecutar: cdk deploy');
console.log('   4. Obtener API URL: make api-url');
console.log('   5. Destruir después: make destroy\n');

console.log('════════════════════════════════════════════════════════════════\n');

// ========================================
// 📝 NOTA SOBRE POLÍTICAS IAM
// ========================================
console.log('📝 NOTA: Políticas IAM se gestionan en proyecto separado');
console.log('   └─ Ubicación: ../iam-policies/');
console.log('   └─ Comando: cd ../iam-policies && make deploy\n');

// ========================================
// 🚀 STACK PRINCIPAL DEL SERVICIO
// ========================================

new ProductServiceStack(app, SERVICE_CONFIG.infrastructure.stack.name, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'eu-central-1'
  },
  description: SERVICE_CONFIG.identity.description,
  cognitoPoolId: cognitoPoolId,
  cognitoAppClientId: cognitoAppClientId,
  mongodbUri: mongodbUri,
});