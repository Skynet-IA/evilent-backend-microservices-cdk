import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { LAMBDA_TIMEOUT_SECONDS, LAMBDA_MEMORY_MB, LAMBDA_NODE_ENV, LAMBDA_DEBUG_LOGS } from '../src/config/constants.js';

export interface ServiceStackProps {
  vpc?: ec2.IVpc;
  dbSecretArn?: string;
  dbEndpoint?: string;
  bucket: string;
  cognitoPoolId: string;
  cognitoAppClientId: string;
}

export class ServiceStack extends Construct {
  public readonly userService: lambda.Function;

  constructor(scope: Construct, id: string, props: ServiceStackProps) {
    super(scope, id);

    const { vpc, dbSecretArn, dbEndpoint, bucket, cognitoPoolId, cognitoAppClientId } = props;

    // ========================================
    // 📦 BUCKET S3
    // ========================================

    const s3Bucket = new s3.Bucket(this, 'UserServiceBucket', {
      bucketName: bucket,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // ========================================
    // 🔐 POLÍTICAS IAM PARA LAMBDA
    // ========================================

    const lambdaRole = new iam.Role(this, 'UserServiceLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });

    // Política básica para CloudWatch Logs
    lambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
    );

    // Política para VPC (si se usa base de datos)
    if (vpc) {
      lambdaRole.addManagedPolicy(
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole')
      );
    }

    // Política para Secrets Manager (si se usa base de datos)
    if (dbSecretArn) {
      lambdaRole.addToPolicy(new iam.PolicyStatement({
        actions: ['secretsmanager:GetSecretValue'],
        resources: [dbSecretArn],
      }));
    }

    // Política para S3
    lambdaRole.addToPolicy(new iam.PolicyStatement({
      actions: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject'],
      resources: [s3Bucket.bucketArn + '/*'],
    }));

    // ========================================
    // 🚀 FUNCIÓN LAMBDA
    // ========================================

    this.userService = new lambda.Function(this, 'UserServiceFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset('lambda-deploy'),
      handler: 'index.handler',
      role: lambdaRole,
      timeout: cdk.Duration.seconds(LAMBDA_TIMEOUT_SECONDS),
      memorySize: LAMBDA_MEMORY_MB,
      environment: {
        NODE_ENV: LAMBDA_NODE_ENV,
        EVILENT_DEBUG_LOGS: LAMBDA_DEBUG_LOGS,
        // Configuración de Cognito
        COGNITO_POOL_ID: cognitoPoolId,
        COGNITO_APP_CLIENT_ID: cognitoAppClientId,
        // Configuración de base de datos
        ...(dbSecretArn && { DB_SECRET_ARN: dbSecretArn }),
        ...(dbEndpoint && { DB_ENDPOINT: dbEndpoint }),
        // Bucket S3
        BUCKET_NAME: bucket,
      },
      // NOTA: Lambda SIN VPC para acceder a Cognito (que no soporta VPC Endpoints)
      // La Lambda NO necesita estar en VPC porque:
      // - RDS es públicamente accesible (desarrollo)
      // - Secrets Manager tiene VPC Endpoint (pero Lambda puede acceder sin VPC)
      // - Cognito NO tiene VPC Endpoint (requiere internet público)
    });
  }
}
