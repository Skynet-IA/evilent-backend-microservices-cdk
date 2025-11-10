import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

export interface ApiGatewayStackProps {
  userService: lambda.Function;
  userPool?: cognito.IUserPool;
  cognitoPoolId?: string;
}

/**
 * 🌐 API Gateway Stack para User Service
 * 
 * Gestiona la creación de API Gateway y sus endpoints para:
 * - User Service (CRUD de perfiles de usuario)
 * 
 * Características:
 * - Autenticación Cognito opcional
 * - Throttling configurable
 * - Método helper para evitar código duplicado
 * - Outputs CDK para integración con otros stacks
 */
export class ApiGatewayStack extends Construct {
  public readonly api: apigateway.RestApi;
  public readonly userResource: apigateway.Resource;

  constructor(scope: Construct, id: string, props: ApiGatewayStackProps) {
    super(scope, id);

    const { userService, userPool, cognitoPoolId } = props;

    // ========================================
    // 🌐 API GATEWAY
    // ========================================

    this.api = new apigateway.RestApi(this, 'UserServiceApi', {
      restApiName: 'UserServiceApi',
      description: 'API para el servicio de usuarios',
      deployOptions: {
        stageName: 'prod',
        throttlingRateLimit: 100,
        throttlingBurstLimit: 200,
      },
    });

    // ========================================
    // 🔐 AUTENTICACIÓN COGNITO (OPCIONAL)
    // ========================================

    let cognitoAuthorizer: apigateway.CognitoUserPoolsAuthorizer | undefined;

    if (userPool && cognitoPoolId) {
      cognitoAuthorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
        cognitoUserPools: [userPool],
        authorizerName: 'UserServiceAuthorizer',
        identitySource: 'method.request.header.Authorization',
      });
    }

    // ========================================
    // 📍 RECURSOS Y MÉTODOS
    // ========================================

    // Recurso /user
    this.userResource = this.api.root.addResource('user');

    // Método GET /user - Obtener perfil
    this.addMethod(this.userResource, 'GET', userService, cognitoAuthorizer, ['200', '401', '404', '500']);

    // Método POST /user - Crear perfil
    this.addMethod(this.userResource, 'POST', userService, cognitoAuthorizer, ['201', '400', '401', '409', '500']);

    // Método PUT /user - Actualizar perfil
    this.addMethod(this.userResource, 'PUT', userService, cognitoAuthorizer, ['200', '400', '401', '404', '500']);

    // ========================================
    // 📊 OUTPUTS CDK
    // ========================================

    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: this.api.url,
      description: 'URL de la API Gateway de User Service',
      exportName: 'UserServiceApiUrl',
    });

    new cdk.CfnOutput(this, 'ApiGatewayId', {
      value: this.api.restApiId,
      description: 'ID de la API Gateway',
      exportName: 'UserServiceApiId',
    });

    if (cognitoPoolId) {
      new cdk.CfnOutput(this, 'CognitoPoolId', {
        value: cognitoPoolId,
        description: 'ID del User Pool de Cognito',
        exportName: 'UserServiceCognitoPoolId',
      });
    }
  }

  /**
   * 🔧 Helper para agregar métodos HTTP de forma consistente
   * 
   * Evita código duplicado y mantiene consistencia en la configuración.
   * 
   * @param resource - Recurso de API Gateway donde agregar el método
   * @param httpMethod - Método HTTP (GET, POST, PUT, DELETE, etc.)
   * @param handler - Función Lambda que manejará las peticiones
   * @param authorizer - Autorizador Cognito (opcional)
   * @param statusCodes - Códigos de estado HTTP esperados
   */
  private addMethod(
    resource: apigateway.Resource,
    httpMethod: string,
    handler: lambda.Function,
    authorizer?: apigateway.CognitoUserPoolsAuthorizer,
    statusCodes: string[] = ['200']
  ): void {
    resource.addMethod(httpMethod, new apigateway.LambdaIntegration(handler), {
      authorizationType: authorizer ? apigateway.AuthorizationType.COGNITO : apigateway.AuthorizationType.NONE,
      authorizer: authorizer,
      methodResponses: statusCodes.map(statusCode => ({ statusCode })),
    });
  }
}
