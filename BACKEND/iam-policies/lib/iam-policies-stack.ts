import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import {
  POLICY_NAMES,
  OUTPUT_KEYS,
  EXPORT_NAMES,
  USER_SERVICE_RESOURCES,
  PRODUCT_SERVICE_RESOURCES,
  SHARED_RESOURCES,
  SECRETS_MANAGER_ACTIONS,
  EC2_BASTION_ACTIONS,
  S3_BUCKET_ACTIONS,
  CLOUDWATCH_LOGS_ACTIONS,
  CLOUDFORMATION_ACTIONS,
  CLOUDFORMATION_ACTIONS_SHARED,
  XRAY_ACTIONS,
} from './config/constants';

/**
 * Stack de políticas IAM compartidas para todos los servicios Evilent
 * 
 * Este stack es independiente del ciclo de vida de los servicios individuales
 * y contiene políticas IAM que pueden ser reutilizadas por múltiples servicios.
 * 
 * Principios:
 * - Sin código especulativo: Solo políticas actualmente necesarias
 * - Sin hardcoding: Todos los valores vienen de constants.ts
 * - Least privilege: Permisos mínimos necesarios con conditions cuando es posible
 */
export class IamPoliciesStack extends cdk.Stack {
  public readonly userServiceDeveloperPolicy: iam.ManagedPolicy;
  public readonly productServiceDeveloperPolicy: iam.ManagedPolicy;
  public readonly sharedMonitoringPolicy: iam.ManagedPolicy;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ========================================
    // 🔐 POLÍTICA PARA USER SERVICE
    // ========================================
    this.userServiceDeveloperPolicy = new iam.ManagedPolicy(this, 'UserServiceDevPolicy', {
      managedPolicyName: POLICY_NAMES.USER_SERVICE,
      description: 'Política IAM para desarrolladores de User Service con permisos específicos',
      statements: [
        // Secrets Manager - Solo secretos de user-service
        new iam.PolicyStatement({
          sid: 'SecretsManagerUserServiceAccess',
          actions: [...SECRETS_MANAGER_ACTIONS],
          resources: [`arn:aws:secretsmanager:*:*:secret:${USER_SERVICE_RESOURCES.SECRETS_PREFIX}`],
        }),

        // EC2 - Solo instancias Bastion de UserService
        new iam.PolicyStatement({
          sid: 'EC2BastionManagement',
          actions: [...EC2_BASTION_ACTIONS],
          resources: ['*'], // EC2 no soporta resource-level permissions para estas acciones
          conditions: {
            'StringEquals': {
              'ec2:ResourceTag/Service': USER_SERVICE_RESOURCES.EC2_TAG_SERVICE,
              'ec2:ResourceTag/Component': USER_SERVICE_RESOURCES.EC2_TAG_COMPONENT,
            },
          },
        }),

        // CloudWatch Logs - Solo logs de UserService
        new iam.PolicyStatement({
          sid: 'CloudWatchLogsUserServiceAccess',
          actions: [...CLOUDWATCH_LOGS_ACTIONS],
          resources: [
            `arn:aws:logs:*:*:log-group:${USER_SERVICE_RESOURCES.LAMBDA_LOG_GROUP_PREFIX}`,
            `arn:aws:logs:*:*:log-group:${USER_SERVICE_RESOURCES.SSM_LOG_GROUP_PREFIX}`,
          ],
        }),

        // CloudFormation - Solo stacks de UserService
        new iam.PolicyStatement({
          sid: 'CloudFormationUserServiceAccess',
          actions: [...CLOUDFORMATION_ACTIONS],
          resources: [`arn:aws:cloudformation:*:*:stack/${USER_SERVICE_RESOURCES.CLOUDFORMATION_STACK_PREFIX}`],
        }),
      ],
    });

    // ========================================
    // 📦 POLÍTICA PARA PRODUCT SERVICE
    // ========================================
    this.productServiceDeveloperPolicy = new iam.ManagedPolicy(this, 'ProductServiceDevPolicy', {
      managedPolicyName: POLICY_NAMES.PRODUCT_SERVICE,
      description: 'Política IAM para desarrolladores de Product Service con permisos específicos',
      statements: [
        // Secrets Manager - Solo secretos de product-service
        new iam.PolicyStatement({
          sid: 'SecretsManagerProductServiceAccess',
          actions: [
            'secretsmanager:CreateSecret',
            'secretsmanager:GetSecretValue',
            'secretsmanager:PutSecretValue',
            'secretsmanager:UpdateSecret',
            'secretsmanager:DeleteSecret',
            'secretsmanager:DescribeSecret',
            'secretsmanager:ListSecrets',
          ],
          resources: [`arn:aws:secretsmanager:*:*:secret:${PRODUCT_SERVICE_RESOURCES.SECRETS_PREFIX}`],
        }),

        // S3 - Solo bucket de imágenes de productos
        new iam.PolicyStatement({
          sid: 'S3ProductImageBucketAccess',
          actions: [...S3_BUCKET_ACTIONS],
          resources: [
            `arn:aws:s3:::${PRODUCT_SERVICE_RESOURCES.S3_BUCKET_NAME}`,
            `arn:aws:s3:::${PRODUCT_SERVICE_RESOURCES.S3_BUCKET_NAME}/*`,
          ],
        }),

        // CloudWatch Logs - Solo logs de ProductService
        new iam.PolicyStatement({
          sid: 'CloudWatchLogsProductServiceAccess',
          actions: [...CLOUDWATCH_LOGS_ACTIONS],
          resources: [
            `arn:aws:logs:*:*:log-group:${PRODUCT_SERVICE_RESOURCES.LAMBDA_LOG_GROUP_PREFIX}`,
          ],
        }),

        // CloudFormation - Solo stacks de ProductService
        new iam.PolicyStatement({
          sid: 'CloudFormationProductServiceAccess',
          actions: [...CLOUDFORMATION_ACTIONS],
          resources: [`arn:aws:cloudformation:*:*:stack/${PRODUCT_SERVICE_RESOURCES.CLOUDFORMATION_STACK_PREFIX}`],
        }),
      ],
    });

    // ========================================
    // 📊 POLÍTICA COMPARTIDA DE MONITOREO
    // ========================================
    this.sharedMonitoringPolicy = new iam.ManagedPolicy(this, 'SharedMonitoringPolicy', {
      managedPolicyName: POLICY_NAMES.SHARED_MONITORING,
      description: 'Política compartida para monitoreo y observabilidad de todos los servicios',
      statements: [
        // CloudWatch Logs - Acceso a logs de todos los servicios Evilent
        new iam.PolicyStatement({
          sid: 'CloudWatchLogsGlobalAccess',
          actions: [...CLOUDWATCH_LOGS_ACTIONS],
          resources: [
            `arn:aws:logs:*:*:log-group:${SHARED_RESOURCES.LAMBDA_LOG_GROUP_PREFIX}`,
          ],
        }),

        // CloudFormation - Estado de todos los stacks
        new iam.PolicyStatement({
          sid: 'CloudFormationGlobalAccess',
          actions: [...CLOUDFORMATION_ACTIONS_SHARED],
          resources: ['*'], // CloudFormation ListStacks requiere *
        }),

        // X-Ray - Tracing de todos los servicios
        new iam.PolicyStatement({
          sid: 'XRayTracingAccess',
          actions: [...XRAY_ACTIONS],
          resources: ['*'], // X-Ray no soporta resource-level permissions
        }),
      ],
    });

    // ========================================
    // 📊 OUTPUTS
    // ========================================
    new cdk.CfnOutput(this, OUTPUT_KEYS.USER_SERVICE_POLICY_ARN, {
      value: this.userServiceDeveloperPolicy.managedPolicyArn,
      description: 'ARN de la política IAM para User Service',
      exportName: EXPORT_NAMES.USER_SERVICE_POLICY_ARN,
    });

    new cdk.CfnOutput(this, OUTPUT_KEYS.PRODUCT_SERVICE_POLICY_ARN, {
      value: this.productServiceDeveloperPolicy.managedPolicyArn,
      description: 'ARN de la política IAM para Product Service',
      exportName: EXPORT_NAMES.PRODUCT_SERVICE_POLICY_ARN,
    });

    new cdk.CfnOutput(this, OUTPUT_KEYS.SHARED_MONITORING_POLICY_ARN, {
      value: this.sharedMonitoringPolicy.managedPolicyArn,
      description: 'ARN de la política IAM compartida de monitoreo',
      exportName: EXPORT_NAMES.SHARED_MONITORING_POLICY_ARN,
    });
  }
}
