/**
 * 🔐 Cognito JWT Verifier Service
 * 
 * PATRÓN REPLICADO DE: user-service y product-service
 * 
 * Servicio de verificación de tokens JWT de AWS Cognito
 * Implementa patrón Singleton para reutilización eficiente
 * 
 * REGLA #6: SIEMPRE implementar defense in depth en seguridad
 * - Verificación JWT centralizada
 * - Configuración validada (fail-fast)
 * - Logging estructurado de eventos de seguridad
 */

import { CognitoJwtVerifier } from 'aws-jwt-verify';
import type { CognitoJwtVerifierSingleUserPool } from 'aws-jwt-verify/cognito-verifier';
import logger from '../utility/logger';
import { COGNITO_POOL_ID, COGNITO_APP_CLIENT_ID } from '../config/constants';

/**
 * Verificador JWT de Cognito (Singleton)
 * 
 * IMPORTANTE: Variables de entorno COGNITO_POOL_ID y COGNITO_APP_CLIENT_ID
 * deben estar configuradas. Fallan inmediatamente (fail-fast) si no existen.
 */
export class CognitoVerifierService {
  private static instance: CognitoVerifierService;
  private verifier: CognitoJwtVerifierSingleUserPool<{
    userPoolId: string;
    tokenUse: 'id';
    clientId: string;
  }>;

  /**
   * Constructor privado - Patrón Singleton
   * Usa configuración centralizada validada en constants.ts
   */
  private constructor() {
    try {
      this.verifier = CognitoJwtVerifier.create({
        userPoolId: COGNITO_POOL_ID,
        tokenUse: 'id',
        clientId: COGNITO_APP_CLIENT_ID,
      });

      logger.info('CognitoJwtVerifier inicializado correctamente', {
        userPoolId: `${COGNITO_POOL_ID.substring(0, 15)}...`,
        clientId: `${COGNITO_APP_CLIENT_ID.substring(0, 10)}...`,
      });
    } catch (error: any) {
      logger.error('Error inicializando CognitoJwtVerifier', {
        error: error.message,
        userPoolId: COGNITO_POOL_ID ? 'SET' : 'NOT_SET',
        clientId: COGNITO_APP_CLIENT_ID ? 'SET' : 'NOT_SET',
      });
      throw error;
    }
  }

  /**
   * Obtiene la instancia Singleton del servicio
   */
  static getInstance(): CognitoVerifierService {
    if (!CognitoVerifierService.instance) {
      CognitoVerifierService.instance = new CognitoVerifierService();
    }
    return CognitoVerifierService.instance;
  }

  /**
   * Verificar JWT token de Cognito
   * 
   * @param token - Token JWT a verificar
   * @returns Payload del token verificado
   * @throws Error si token es inválido
   */
  async verifyToken(token: string): Promise<any> {
    try {
      logger.debug('Verificando token Cognito JWT');
      const payload = await this.verifier.verify(token);
      logger.debug('Token Cognito JWT verificado correctamente', {
        sub: payload.sub,
        email: payload.email,
      });
      return payload;
    } catch (error: any) {
      logger.warn('Error verificando token Cognito JWT', {
        error: error.message,
        code: error.code,
      });
      throw error;
    }
  }
}

/**
 * Export instancia singleton para uso en middlewares
 */
export const cognitoVerifier = CognitoVerifierService.getInstance();

