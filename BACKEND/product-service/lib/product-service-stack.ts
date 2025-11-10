import * as cdk from 'aws-cdk-lib';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import path from 'path';

export interface ProductServiceStackProps extends cdk.StackProps {
  cognitoPoolId: string;
  cognitoAppClientId: string;
  mongodbUri?: string;
}

export class ProductServiceStack extends cdk.Stack {
  public readonly productApi: apigateway.RestApi;
  public readonly imageBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: ProductServiceStackProps) {
    super(scope, id, props);

    // ✅ Aceptar parámetros desde CLI o props
    const cognitoPoolIdParam = new cdk.CfnParameter(this, 'CognitoPoolId', {
      type: 'String',
      description: 'Cognito User Pool ID',
      default: props.cognitoPoolId || '',
    });

    const cognitoAppClientIdParam = new cdk.CfnParameter(this, 'CognitoAppClientId', {
      type: 'String',
      description: 'Cognito App Client ID',
      default: props.cognitoAppClientId || '',
    });

    const { cognitoPoolId, cognitoAppClientId, mongodbUri } = props;

    // 📦 S3 BUCKET
    this.imageBucket = new s3.Bucket(this, 'S3Bucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // 🚀 LAMBDA FUNCTIONS (entry paths point to dist/)
    const productFunction = new nodejs.NodejsFunction(this, 'ProductFn', {
      entry: path.join(process.cwd(), 'dist', 'api', 'handlers', 'product.js'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        MONGODB_URI: mongodbUri || '',
        COGNITO_POOL_ID: cognitoPoolId,
        S3_BUCKET: this.imageBucket.bucketName,
      },
    });

    const categoryFunction = new nodejs.NodejsFunction(this, 'CategoryFn', {
      entry: path.join(process.cwd(), 'dist', 'api', 'handlers', 'category.js'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        MONGODB_URI: mongodbUri || '',
        COGNITO_POOL_ID: cognitoPoolId,
      },
    });

    const dealFunction = new nodejs.NodejsFunction(this, 'DealFn', {
      entry: path.join(process.cwd(), 'dist', 'api', 'handlers', 'deal.js'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        MONGODB_URI: mongodbUri || '',
        COGNITO_POOL_ID: cognitoPoolId,
      },
    });

    const imageFunction = new nodejs.NodejsFunction(this, 'ImageFn', {
      entry: path.join(process.cwd(), 'dist', 'api', 'handlers', 'image.js'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        MONGODB_URI: mongodbUri || '',
        S3_BUCKET: this.imageBucket.bucketName,
      },
    });

    // 🔐 PERMISOS S3
    this.imageBucket.grantReadWrite(productFunction);
    this.imageBucket.grantReadWrite(imageFunction);

    // 🌐 API GATEWAY
    this.productApi = new apigateway.RestApi(this, 'Api', {
      restApiName: 'ProductService API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    // 🔑 AUTORIZACIÓN (sin Cognito por ahora - se configura en runtime)
    // Esto se validará en Lambda con JWT tokens desde Cognito
    // const authorizer = new apigateway.CognitoUserPoolsAuthorizer(...)

    // 📍 RUTAS API (validación en Lambda, no en API Gateway)
    const product = this.productApi.root.addResource('product');
    product.addMethod('GET', new apigateway.LambdaIntegration(productFunction));
    product.addMethod('POST', new apigateway.LambdaIntegration(productFunction));

    const productId = product.addResource('{id}');
    productId.addMethod('GET', new apigateway.LambdaIntegration(productFunction));
    productId.addMethod('PUT', new apigateway.LambdaIntegration(productFunction));
    productId.addMethod('DELETE', new apigateway.LambdaIntegration(productFunction));

    const category = this.productApi.root.addResource('category');
    category.addMethod('GET', new apigateway.LambdaIntegration(categoryFunction));
    category.addMethod('POST', new apigateway.LambdaIntegration(categoryFunction));

    const deal = this.productApi.root.addResource('deal');
    deal.addMethod('GET', new apigateway.LambdaIntegration(dealFunction));

    const image = this.productApi.root.addResource('image');
    image.addMethod('POST', new apigateway.LambdaIntegration(imageFunction));

    // 📤 OUTPUTS
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.productApi.url,
      exportName: 'ProductServiceApiUrl',
    });

    new cdk.CfnOutput(this, 'BucketName', {
      value: this.imageBucket.bucketName,
      exportName: 'ProductServiceImageBucket',
    });
  }
}
