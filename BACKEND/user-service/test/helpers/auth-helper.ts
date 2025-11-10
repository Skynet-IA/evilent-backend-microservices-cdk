/**
 * 🧪 AUTH HELPER - Cognito Integration
 * 
 * TESTING PURO Y DURO: Llamadas REALES a Cognito TEST
 * ✅ REGLA #2: Credenciales desde variables de entorno
 * ✅ REGLA CRÍTICA: Tests validan respuestas REALES de Cognito
 * ✅ REGLA #3: Logger estructurado
 */

import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminDeleteUserCommand,
  AdminInitiateAuthCommand,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { createLogger } from '../../src/utility/logger.js';

const logger = createLogger('AuthHelper');

export interface TestUser {
  email: string;
  password: string;
  token: string;
}

/**
 * Helper para operaciones de Cognito en tests
 * Crea usuarios TEST en Cognito y obtiene tokens JWT REALES
 */
export class AuthHelper {
  private cognitoClient: CognitoIdentityProviderClient;
  private poolId: string;
  private clientId: string;
  private region: string;
  private createdUsers: Set<string> = new Set();

  constructor() {
    // ✅ REGLA #2: Cargar desde variables de entorno (no hardcoded)
    this.poolId = process.env.COGNITO_POOL_ID_TEST || '';
    this.clientId = process.env.COGNITO_CLIENT_ID_TEST || '';
    this.region = process.env.COGNITO_REGION || 'eu-central-1';

    if (!this.poolId || !this.clientId) {
      logger.warn('⚠️ Cognito credentials no configurados', {
        poolIdExists: !!this.poolId,
        clientIdExists: !!this.clientId,
      });
    }

    this.cognitoClient = new CognitoIdentityProviderClient({
      region: this.region,
    });

    logger.info('✅ AuthHelper inicializado', {
      region: this.region,
      poolId: this.poolId ? 'configured' : 'missing',
    });
  }

  /**
   * Crear usuario TEST en Cognito y obtener token JWT REAL
   * 
   * TESTING PURO Y DURO: Llamadas reales a Cognito
   * No usa mocks - valida respuestas reales de Cognito
   */
  async setupTestUser(email: string, password: string): Promise<TestUser> {
    try {
      logger.info('🔐 Creando usuario de test en Cognito', {
        email,
        poolId: this.poolId,
      });

      // 1. Crear usuario en Cognito TEST
      try {
        await this.cognitoClient.send(
          new AdminCreateUserCommand({
            UserPoolId: this.poolId,
            Username: email,
            UserAttributes: [
              { Name: 'email', Value: email },
              { Name: 'email_verified', Value: 'true' },
            ],
            MessageAction: 'SUPPRESS',
          })
        );

        logger.info('✅ Usuario creado en Cognito', { email });
      } catch (error: any) {
        // Si el usuario ya existe, continuar
        if (error.name === 'UserExistsException') {
          logger.info('ℹ️ Usuario ya existe en Cognito', { email });
        } else {
          throw error;
        }
      }

      // 2. Establecer contraseña permanente
      await this.cognitoClient.send(
        new AdminSetUserPasswordCommand({
          UserPoolId: this.poolId,
          Username: email,
          Password: password,
          Permanent: true,
        })
      );

      logger.info('✅ Contraseña establecida', { email });

      // 3. Obtener token JWT REAL desde Cognito
      const authResponse = await this.cognitoClient.send(
        new AdminInitiateAuthCommand({
          AuthFlow: 'ADMIN_NO_SRP_AUTH',
          ClientId: this.clientId,
          UserPoolId: this.poolId,
          AuthParameters: {
            USERNAME: email,
            PASSWORD: password,
          },
        })
      );

      const token = authResponse.AuthenticationResult?.IdToken;
      if (!token) {
        throw new Error(
          '❌ No se pudo obtener token JWT de Cognito'
        );
      }

      this.createdUsers.add(email);

      logger.info('✅ Token JWT obtenido de Cognito', {
        email,
        tokenLength: token.length,
      });

      return { email, password, token };
    } catch (error) {
      logger.error('❌ Error en setupTestUser', {
        email,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Limpiar usuarios TEST creados en Cognito
   * 
   * IMPORTANTE: Ejecutar en afterAll() para cleanup
   */
  async cleanupTestUsers(): Promise<void> {
    logger.info('🧹 Limpiando usuarios de test', {
      count: this.createdUsers.size,
    });

    for (const email of this.createdUsers) {
      try {
        await this.cognitoClient.send(
          new AdminDeleteUserCommand({
            UserPoolId: this.poolId,
            Username: email,
          })
        );

        logger.info('✅ Usuario eliminado', { email });
      } catch (error: any) {
        // Si el usuario no existe, ignorar
        if (error.name !== 'UserNotFoundException') {
          logger.warn('⚠️ Error eliminando usuario', {
            email,
            error: error.message,
          });
        }
      }
    }

    this.createdUsers.clear();
    logger.info('✅ Cleanup completado');
  }

  /**
   * Obtener el Pool ID configurado
   */
  getPoolId(): string {
    return this.poolId;
  }

  /**
   * Obtener el Client ID configurado
   */
  getClientId(): string {
    return this.clientId;
  }

  /**
   * Verificar si Cognito está configurado
   */
  isConfigured(): boolean {
    return !!this.poolId && !!this.clientId;
  }
}

// Export singleton
export const authHelper = new AuthHelper();

