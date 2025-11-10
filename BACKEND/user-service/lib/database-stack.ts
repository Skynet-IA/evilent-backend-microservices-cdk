import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { DB_SECRET_PREFIX, DB_ADMIN_USER, DB_PASSWORD_LENGTH, DB_MIN_STORAGE_GB, DEFAULT_MAX_STORAGE_GB } from '../src/config/constants.js';

export interface DatabaseStackProps {
  multiAz: boolean;
  instanceSize: ec2.InstanceSize;
  backupRetentionDays: number;
}

export class DatabaseStack extends Construct {
  public readonly vpc: ec2.IVpc;
  public readonly dbSecret: secretsmanager.ISecret;
  public readonly dbEndpoint: string;

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id);

    const { multiAz, instanceSize, backupRetentionDays } = props;

    // ========================================
    // 🌐 VPC PRIVADA
    // ========================================

    // RDS requiere al menos 2 AZs para el subnet group
    this.vpc = new ec2.Vpc(this, 'UserServiceVpc', {
      maxAzs: 2, // Siempre 2 AZs mínimo para RDS
      natGateways: 0, // ✅ SIN NAT Gateway - Usamos VPC Endpoints para SSM (ahorro: $32.40/mes)
      restrictDefaultSecurityGroup: false, // Deshabilitar custom resource restrict default SG
      subnetConfiguration: [
        {
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 24,
        },
      ],
    });

    // ========================================
    // 🌐 VPC ENDPOINTS PARA SSM (BASTION)
    // ========================================

    // Security Group para VPC Endpoints
    const vpcEndpointSG = new ec2.SecurityGroup(this, 'VpcEndpointSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for VPC endpoints',
      allowAllOutbound: true,
    });

    // Permitir tráfico HTTPS desde la VPC hacia los VPC Endpoints
    vpcEndpointSG.addIngressRule(
      ec2.Peer.ipv4(this.vpc.vpcCidrBlock),
      ec2.Port.tcp(443),
      'Allow HTTPS from VPC for Lambda and Bastion to access AWS services'
    );

    // VPC Endpoints para SSM (permiten que bastion se conecte sin NAT Gateway)
    this.vpc.addInterfaceEndpoint('SSMEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.SSM,
      securityGroups: [vpcEndpointSG],
      subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
    });

    this.vpc.addInterfaceEndpoint('SSMMessagesEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.SSM_MESSAGES,
      securityGroups: [vpcEndpointSG],
      subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
    });

    this.vpc.addInterfaceEndpoint('EC2MessagesEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.EC2_MESSAGES,
      securityGroups: [vpcEndpointSG],
      subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
    });

    // VPC Endpoint para Secrets Manager (necesario para credenciales DB)
    this.vpc.addInterfaceEndpoint('SecretsManagerEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
      securityGroups: [vpcEndpointSG],
      subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
    });

    // VPC Endpoint para CloudWatch Logs (para logs del bastion)
    this.vpc.addInterfaceEndpoint('CloudWatchLogsEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
      securityGroups: [vpcEndpointSG],
      subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
    });

    // NOTA: Cognito NO soporta VPC Endpoints
    // La Lambda debe estar FUERA de la VPC o usar NAT Gateway para acceder a Cognito
    // Por ahora, la Lambda se desplegará SIN VPC para acceso directo a internet

    // ========================================
    // 🔐 SECRET PARA CREDENCIALES DB
    // ========================================

    // Crear nuevo secreto para credenciales DB
    this.dbSecret = new secretsmanager.Secret(this, 'DbSecretV3', {
      secretName: `${DB_SECRET_PREFIX}/db-credentials-v3-${Date.now()}`,
      description: 'Credenciales para la base de datos PostgreSQL del User Service',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: DB_ADMIN_USER,
        }),
        generateStringKey: 'password',
        excludePunctuation: true,
        includeSpace: false,
        passwordLength: DB_PASSWORD_LENGTH,
      },
    });

    // ========================================
    // 🗄️ INSTANCIA RDS POSTGRESQL
    // ========================================

    // Security Group para RDS que permite conexiones desde Bastion
    const dbSecurityGroup = new ec2.SecurityGroup(this, 'DbSecurityGroup', {
      vpc: this.vpc,
      description: 'Security group for RDS PostgreSQL',
      allowAllOutbound: true,
    });

    // Permitir conexiones PostgreSQL desde cualquier IP (desarrollo temporal)
    // NOTA: En producción, restringir a IPs específicas o usar VPN
    dbSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(5432),
      'Allow PostgreSQL access from anywhere (development only)'
    );

    const dbInstance = new rds.DatabaseInstance(this, 'UserServiceDatabaseV3', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15,
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, instanceSize),
      vpc: this.vpc,
      publiclyAccessible: true,
      securityGroups: [dbSecurityGroup],
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      credentials: rds.Credentials.fromSecret(this.dbSecret),
      multiAz,
      allocatedStorage: DB_MIN_STORAGE_GB,
      maxAllocatedStorage: DEFAULT_MAX_STORAGE_GB,
      storageType: rds.StorageType.GP3,
      backupRetention: cdk.Duration.days(backupRetentionDays),
      deleteAutomatedBackups: backupRetentionDays === 0,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      deletionProtection: false,
    });

    this.dbEndpoint = dbInstance.dbInstanceEndpointAddress;

    // ========================================
    // 📊 OUTPUTS
    // ========================================

    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: this.dbEndpoint,
      description: 'Endpoint de la base de datos RDS',
    });

    new cdk.CfnOutput(this, 'DatabaseSecretArn', {
      value: this.dbSecret.secretArn,
      description: 'ARN del secreto con credenciales de la base de datos',
    });
  }
}
