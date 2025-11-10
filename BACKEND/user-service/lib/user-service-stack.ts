import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { ServiceStack } from './service-stack.js';
import { ApiGatewayStack } from './api-gateway-stack.js';
import { DatabaseStack } from './database-stack.js';
import { BastionStack } from './bastion-stack.js';

export interface UserServiceStackProps extends cdk.StackProps {
  cognitoPoolId: string;
  cognitoAppClientId: string;
  bucket: string;
  databaseConfig?: {
    multiAz: boolean;
    instanceSize: ec2.InstanceSize;
    backupRetentionDays: number;
  };
}

export class UserServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: UserServiceStackProps) {
    super(scope, id, props);

    const { cognitoPoolId, cognitoAppClientId, bucket, databaseConfig } = props;

    // ========================================
    // 🗄️ BASE DE DATOS (OPCIONAL)
    // ========================================
    let vpc: ec2.IVpc | undefined;
    let dbSecretArn: string | undefined;
    let dbEndpoint: string | undefined;

    if (databaseConfig) {
      const databaseStack = new DatabaseStack(this, 'Database', {
        multiAz: databaseConfig.multiAz,
        instanceSize: databaseConfig.instanceSize,
        backupRetentionDays: databaseConfig.backupRetentionDays,
      });

      vpc = databaseStack.vpc;
      dbSecretArn = databaseStack.dbSecret.secretArn;
      dbEndpoint = databaseStack.dbEndpoint;

      // Bastion Host (solo si hay base de datos)
      new BastionStack(this, 'Bastion', {
        vpc: databaseStack.vpc,
      });
    }

    // ========================================
    // 🚀 SERVICIO LAMBDA
    // ========================================
    const serviceStack = new ServiceStack(this, 'Service', {
      vpc,
      dbSecretArn,
      dbEndpoint,
      bucket,
      cognitoPoolId,
      cognitoAppClientId,
    });

    // ========================================
    // 🌐 API GATEWAY
    // ========================================
    new ApiGatewayStack(this, 'ApiGateway', {
      userService: serviceStack.userService,
      cognitoPoolId,
    });
  }
}
