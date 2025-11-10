import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuid } from 'uuid';
import { createLogger } from "../../utility/logger.js";
import { AWS_REGION } from "../../config/constants.js";
import { ImageUploadSchema } from "../../dto/validation-schemas.js";
import { validateQueryParams } from "../../utility/zod-validator.js";
import { SuccessResponse, ErrorResponse } from "../../utility/response.js";
import { AuthMiddleware, UnauthorizedError } from "../middleware/auth-middleware.js";
import { UnauthorizedResponse } from "../../utility/response.js";

const s3Client = new S3Client({ region: AWS_REGION });
const logger = createLogger('ImageHandler');

/**
 * 🎯 Handler principal para el servicio de imágenes
 *
 * ARQUITECTURA HÍBRIDA (Regla #9 + Regla Platino):
 * - ✅ Middleware reutilizable (AuthMiddleware)
 * - ✅ Validación Zod (REGLA #5)
 * - ✅ Defense in Depth (JWT en API Gateway + Lambda)
 * - ✅ Manejo de errores centralizado
 *
 * Funcionalidad:
 * - Genera URLs firmadas de S3 para subir imágenes
 * - Valida formato de archivo
 * - Asigna content-type correcto
 */

export const handler = async (
    event: APIGatewayEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {

    const requestId = context.awsRequestId;
    const startTime = Date.now();

    try {
        // ========================================
        // 📊 LOGGING: Request iniciada
        // ========================================
        logger.info('Request iniciada', {
            requestId,
            method: event.httpMethod,
            path: event.path,
        });

        // ========================================
        // 🔐 AUTENTICACIÓN JWT (Middleware reutilizable)
        // ========================================
        // REGLA #6: Defense in Depth
        // Capa 1: API Gateway Authorizer (ya validó el token)
        // Capa 2: Lambda JWT Verification (validación adicional)
        const claims = await AuthMiddleware.authenticate(event);

        logger.info('Usuario autenticado (JWT verificado)', {
            userIdHash: claims.userId.substring(0, 8),
            hasEmail: !!claims.userEmail
        });

        // ========================================
        // ✅ VALIDACIÓN CON ZOD (REGLA #5)
        // ========================================
        const validationError = validateQueryParams(ImageUploadSchema, event.queryStringParameters);
        if (validationError) {
            logger.warn('Validación fallida', {
                requestId,
                queryParams: event.queryStringParameters
            });
            return validationError;
        }

        const file = event.queryStringParameters!.file!;
        
        logger.info('Generando URL firmada para subir imagen', { 
            file,
            userIdHash: claims.userId.substring(0, 8)
        });

        // ========================================
        // 🖼️ GENERAR URL FIRMADA DE S3
        // ========================================
        // Generar un nombre de archivo único
        const fileName = `${uuid()}-${file}`;

        // Detectar content type basado en extensión
        const extension = file.split('.').pop()?.toLowerCase();
        const contentTypeMap: Record<string, string> = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'webp': 'image/webp',
        };
        const contentType = contentTypeMap[extension || 'jpeg'] || 'image/jpeg';

        const s3Params = {
            Bucket: process.env.BUCKET_NAME,
            Key: fileName,
            ContentType: contentType,
        };

        const command = new PutObjectCommand(s3Params);
        const url = await getSignedUrl(s3Client, command, { expiresIn: 60 * 60 * 24 }); // 24 horas

        const duration = Date.now() - startTime;
        logger.info('URL firmada generada exitosamente', { 
            requestId,
            fileName, 
            contentType,
            duration: `${duration}ms`,
            userIdHash: claims.userId.substring(0, 8)
        });

        return SuccessResponse(
            { fileName, url, expiresIn: '24 hours' },
            'URL firmada generada correctamente'
        );

    } catch (error) {
        // ========================================
        // ❌ MANEJO CENTRALIZADO DE ERRORES
        // ========================================
        const duration = Date.now() - startTime;

        if (error instanceof UnauthorizedError) {
            logger.warn('Error de autenticación', {
                requestId,
                error: error.message,
                duration: `${duration}ms`,
                method: event.httpMethod,
                path: event.path
            });

            return UnauthorizedResponse(error.message);

        } else {
            logger.error('Error inesperado al generar URL firmada', {
                requestId,
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                duration: `${duration}ms`,
                method: event.httpMethod,
                path: event.path
            });

            return ErrorResponse(500, 'Error al generar URL firmada para imagen');
        }
    }
};

