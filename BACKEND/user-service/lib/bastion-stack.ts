import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface BastionStackProps {
  vpc: ec2.IVpc;
}

export class BastionStack extends Construct {
  public readonly bastionHost: ec2.BastionHostLinux;

  constructor(scope: Construct, id: string, props: BastionStackProps) {
    super(scope, id);

    const { vpc } = props;

    // ========================================
    // 🔐 ROL IAM PARA BASTION
    // ========================================

    const bastionRole = new iam.Role(this, 'BastionHostRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
    });

    // Política para SSM Session Manager
    bastionRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')
    );

    // ========================================
    // 🖥️ INSTANCIA BASTION
    // ========================================

    this.bastionHost = new ec2.BastionHostLinux(this, 'BastionHost', {
      vpc,
      subnetSelection: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      machineImage: ec2.MachineImage.latestAmazonLinux2023(),
    });

    // Asignar el rol IAM al bastion host
    this.bastionHost.instance.addToRolePolicy(new iam.PolicyStatement({
      actions: ['ssm:StartSession', 'ssm:TerminateSession'],
      resources: ['*'],
    }));

    // ========================================
    // 📊 OUTPUTS
    // ========================================

    new cdk.CfnOutput(this, 'BastionHostInstanceId', {
      value: this.bastionHost.instanceId,
      description: 'ID de la instancia Bastion Host',
    });
  }
}
