#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { IamPoliciesStack } from '../lib/iam-policies-stack.js';
import { DEFAULT_AWS_REGION, POLICY_NAMES } from '../lib/config/constants.js';

const app = new cdk.App();

// ========================================
// 📋 RESUMEN DE CONFIGURACIÓN
// ========================================
console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║                                                                ║');
console.log('║           📋 IAM POLICIES STACK - CONFIGURACIÓN               ║');
console.log('║                                                                ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

console.log('🔐 POLÍTICAS IAM COMPARTIDAS:');
console.log(`   ├─ ${POLICY_NAMES.USER_SERVICE}`);
console.log(`   ├─ ${POLICY_NAMES.PRODUCT_SERVICE}`);
console.log(`   └─ ${POLICY_NAMES.SHARED_MONITORING}`);
console.log('');
console.log('💰 COSTO: $0/mes (políticas IAM son GRATUITAS)');
console.log('');
console.log('🌍 REGIÓN:');
console.log(`   └─ ${process.env.CDK_DEFAULT_REGION || DEFAULT_AWS_REGION}`);
console.log('');
console.log('🚀 PRÓXIMOS PASOS:');
console.log('   1. Verificar configuración arriba ⬆️');
console.log('   2. Ejecutar: cdk deploy');
console.log('   3. Aplicar permisos: make apply-all');
console.log('');
console.log('════════════════════════════════════════════════════════════════\n');

// ========================================
// 🚀 DESPLEGAR STACK
// ========================================
new IamPoliciesStack(app, 'IamPoliciesStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || DEFAULT_AWS_REGION,
  },
  description: 'Políticas IAM compartidas para todos los servicios Evilent (User Service, Product Service)',
});
