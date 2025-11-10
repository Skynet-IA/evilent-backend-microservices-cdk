#!/usr/bin/env node
/// <reference types="node" />
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { UserServiceStack } from '../dist/lib/user-service-stack.js';
import { DEFAULT_BUCKET_NAME, DEFAULT_INSTANCE_SIZE } from '../dist/src/config/constants.js';

const app = new cdk.App();

// ========================================
// 🔧 CONFIGURACIÓN POR CONTEXTO
// ========================================
/**
 * Permite pasar configuración mediante context:
 * cdk deploy -c cognitoPoolId=us-east-1_abc123 -c cognitoAppClientId=xyz123 -c withDatabase=true -c multiAz=false
 *
 * O mediante variables de entorno:
 * COGNITO_POOL_ID=us-east-1_abc123 COGNITO_APP_CLIENT_ID=xyz123 cdk deploy
 */
const cognitoPoolId = app.node.tryGetContext('cognitoPoolId') || process.env.COGNITO_POOL_ID || '';
const cognitoAppClientId = app.node.tryGetContext('cognitoAppClientId') || process.env.COGNITO_APP_CLIENT_ID || '';
const withDatabase = app.node.tryGetContext('withDatabase') === 'true' || process.env.WITH_DATABASE === 'true';
const multiAz = app.node.tryGetContext('multiAz') === 'true' || process.env.MULTI_AZ === 'true';
const bucket = app.node.tryGetContext('bucket') || process.env.BUCKET_NAME || DEFAULT_BUCKET_NAME;

// Mapear string a InstanceSize
const instanceSizeMap: Record<string, ec2.InstanceSize> = {
  'MICRO': ec2.InstanceSize.MICRO,
  'SMALL': ec2.InstanceSize.SMALL,
  'MEDIUM': ec2.InstanceSize.MEDIUM,
};
const instanceSizeStr = app.node.tryGetContext('instanceSize') || process.env.INSTANCE_SIZE || DEFAULT_INSTANCE_SIZE;
const instanceSize = instanceSizeMap[instanceSizeStr] || ec2.InstanceSize.MICRO;

// ========================================
// 📋 RESUMEN DE CONFIGURACIÓN
// ========================================

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║                                                                ║');
console.log('║           📋 USER SERVICE STACK - CONFIGURACIÓN               ║');
console.log('║                                                                ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

// Sección: Autenticación Cognito
console.log('🔐 AUTENTICACIÓN:');
if (!cognitoPoolId || !cognitoAppClientId) {
  console.log('   ⚠️  Cognito NO configurado completamente');
  console.log('       └─ Pool ID:', cognitoPoolId || 'NO CONFIGURADO');
  console.log('       └─ App Client ID:', cognitoAppClientId || 'NO CONFIGURADO');
  console.log('       └─ API Gateway sin autenticación (DESARROLLO SOLO)\n');
} else {
  console.log(`   ✅ CognitoPoolId: ${cognitoPoolId}`);
  console.log(`   ✅ CognitoAppClientId: ${cognitoAppClientId}\n`);
}

// Sección: Base de Datos
console.log('🗄️  BASE DE DATOS:');
if (!withDatabase) {
  console.log('   ❌ Desactivada (Solo Lambda + API Gateway)');
  console.log('       └─ Costo: ~$5/mes\n');
} else {
  const dbConfig = multiAz ? 'Multi-AZ (Alta Disponibilidad)' : 'Single-AZ (Económico)';
  const cost = multiAz ? '~$174/mes' : '~$18/mes';
  
  console.log(`   ✅ Activada (PRODUCCIÓN - ${dbConfig})`);
  console.log(`       ├─ Instance: t4g.${instanceSizeStr.toLowerCase()}`);
  console.log(`       ├─ Storage: 20GB → 100GB (auto-scaling)`);
  console.log(`       ├─ Backups: ${multiAz ? '7 días (recomendado)' : '0 días (ahorro costos)'}`);
  console.log(`       └─ Costo: ${cost}\n`);
}

// Sección: Storage S3
console.log('📦 ALMACENAMIENTO:');
console.log(`   ✅ Bucket S3: ${bucket}\n`);

// Sección: Resumen de Costos
console.log('💰 RESUMEN DE COSTOS:');
let totalCost = 0;
const costBreakdown: string[] = [];

if (withDatabase) {
  const rdsCost = multiAz ? 120 : 15;
  const backupCost = multiAz ? 50 : 0;
  const bastionCost = 5; // Bastion EC2 t4g.micro
  totalCost = rdsCost + backupCost + 3 + 5 + 0.5; // RDS + backups + storage + bastion + lambda
  costBreakdown.push(`   ├─ RDS ${instanceSizeStr.toUpperCase()}: $${rdsCost}/mes`);
  costBreakdown.push(`   ├─ Storage GP3: $3/mes`);
  if (multiAz) costBreakdown.push(`   ├─ Backups: $${backupCost}/mes`);
  costBreakdown.push(`   ├─ Bastion (t4g.micro): $${bastionCost}/mes`);
  costBreakdown.push(`   ├─ SSM Session Manager: $0 (GRATIS) ✨`);
  costBreakdown.push(`   ├─ Lambda+API: $0.50/mes`);
} else {
  totalCost = 5;
  costBreakdown.push(`   ├─ Lambda+API: $5/mes`);
}

costBreakdown.forEach(line => console.log(line));
console.log(`   └─ TOTAL: $${totalCost}/mes\n`);

// Sección: Próximos Pasos
console.log('🚀 PRÓXIMOS PASOS:');
console.log('   1. Verificar configuración arriba ⬆️');
if (!cognitoPoolId && withDatabase) {
  console.log('   2. ⚠️  IMPORTANTE: Configura CognitoPoolId para usar autenticación');
}
console.log('   3. Ejecutar: cdk deploy');
console.log('   4. Destruir después: cdk destroy --all\n');

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

new UserServiceStack(app, 'UserServiceStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'eu-central-1'
  },
  cognitoPoolId,
  cognitoAppClientId,
  bucket,
  databaseConfig: withDatabase ? {
    multiAz,
    instanceSize,
    backupRetentionDays: multiAz ? 7 : 0,
  } : undefined,
});