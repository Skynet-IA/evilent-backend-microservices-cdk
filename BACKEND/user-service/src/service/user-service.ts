import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { UserRepository } from "../repository/index.js";
import { ErrorResponse, NotFoundResponse, SuccessResponse, createLogger, generateRandomProfile, parseAndValidateBody, validationErrorResponse } from "../utility/index.js";
import { UserProfileInput, UserProfileWithCognitoId, CreateProfileSchema, UpdateProfileSchema } from "../dto/index.js";

/**
 * Servicio de usuarios - Capa de lógica de negocio
 * 
 * Esta clase NO maneja autenticación (ya fue manejada por API Gateway)
 * Recibe userId y userEmail ya verificados desde el handler
 */
export class UserService {
    private _repository: UserRepository;
    private _logger = createLogger('UserService');

    constructor(repository: UserRepository) {
        this._repository = repository;
    }

    /**
     * ✨ Crea el perfil del usuario (SOLO CREACIÓN)
     * 
     * @param event - Evento de API Gateway con el body de la request
     * @param userId - ID del usuario desde Cognito (sub claim) - YA VERIFICADO
     * @param userEmail - Email del usuario desde Cognito - YA VERIFICADO
     * @returns Perfil creado
     * 
     * 🚨 Error si el perfil ya existe (409 Conflict)
     */
    async CreateProfile(event: APIGatewayEvent, userId: string, userEmail?: string): Promise<APIGatewayProxyResult> {
        try {
            this._logger.info('Iniciando CreateProfile', { userId: userId.substring(0, 8), hasEmail: !!userEmail });

            // ✅ REGLA #5: Validación centralizada con parseAndValidateBody
            const { data, error } = parseAndValidateBody(event, CreateProfileSchema);
            if (error) {
                this._logger.warn('Validación fallida en CreateProfile', { 
                    errorCount: error.details.length,
                    userId: userId.substring(0, 8)
                });
                return validationErrorResponse(error);
            }

            // Verificar si el usuario ya existe
            const existingUser = await this._repository.getAccountByCognitoId(userId);
            if (existingUser) {
                this._logger.warn('Intento de crear perfil que ya existe', { userId: userId.substring(0, 8) });
                return ErrorResponse(new Error('El perfil de usuario ya existe'), 409);
            }

            if (!userEmail) {
                this._logger.error('Email requerido para crear perfil', { userId: userId.substring(0, 8) });
                return ErrorResponse(new Error('Email requerido para crear perfil'), 400);
            }

            this._logger.debug('Validación exitosa en CreateProfile');
            
            // Agregar cognito_user_id al input validado
            const profileData: UserProfileWithCognitoId = {
                ...data!,
                cognito_user_id: userId,
                phone: data!.phone || ''
            };
            
            const result = await this._repository.createAccount(profileData, userEmail);
            this._logger.info('Perfil creado exitosamente', { userId: userId.substring(0, 8) });
            return SuccessResponse(result);
        } catch (error) {
            this._logger.error('Error en CreateProfile', error, { userId: userId.substring(0, 8) });
            return ErrorResponse(error);
        }
    }

    /**
     * 🔄 Actualiza el perfil del usuario (SOLO ACTUALIZACIÓN)
     *
     * @param event - Evento de API Gateway con el body de la request
     * @param userId - ID del usuario desde Cognito (sub claim) - YA VERIFICADO
     * @returns Perfil actualizado
     *
     * 🚨 Error si el perfil no existe (404 Not Found)
     */
    async UpdateProfile(event: APIGatewayEvent, userId: string): Promise<APIGatewayProxyResult> {
        try {
            this._logger.info('Iniciando UpdateProfile', { userId: userId.substring(0, 8) });

            // ✅ REGLA #5: Validación centralizada con parseAndValidateBody
            const { data, error } = parseAndValidateBody(event, UpdateProfileSchema);
            if (error) {
                this._logger.warn('Validación fallida en UpdateProfile', { 
                    errorCount: error.details.length,
                    userId: userId.substring(0, 8)
                });
                return validationErrorResponse(error);
            }

            // Verificar que el usuario existe
            const existingUser = await this._repository.getAccountByCognitoId(userId);
            if (!existingUser) {
                this._logger.warn('Intento de actualizar perfil que no existe', { userId: userId.substring(0, 8) });
                return NotFoundResponse('Perfil de usuario no encontrado');
            }

            this._logger.debug('Validación exitosa en UpdateProfile');
            
            // Agregar cognito_user_id al input validado
            // Para update, usamos los valores existentes si no se proporcionan nuevos
            const profileData: UserProfileWithCognitoId = {
                cognito_user_id: userId,
                first_name: data!.first_name ?? existingUser.first_name ?? '',
                last_name: data!.last_name ?? existingUser.last_name ?? '',
                phone: data!.phone !== undefined ? (data!.phone || '') : (existingUser.phone || '')
            };
            
            const result = await this._repository.updateAccount(profileData);
            this._logger.info('Perfil actualizado exitosamente', { userId: userId.substring(0, 8) });
            return SuccessResponse(result);
        } catch (error) {
            this._logger.error('Error en UpdateProfile', error, { userId: userId.substring(0, 8) });
            return ErrorResponse(error);
        }
    }

    /**
     * 📖 Obtiene el perfil del usuario autenticado (LAZY PROVISIONING)
     *
     * @param event - Evento de API Gateway
     * @param userId - ID del usuario desde Cognito (sub claim) - YA VERIFICADO
     * @param userEmail - Email del usuario desde Cognito - YA VERIFICADO
     * @returns Perfil del usuario (lo crea automáticamente si no existe)
     */
    async GetProfile(event: APIGatewayEvent, userId: string, userEmail?: string): Promise<APIGatewayProxyResult> {
        try {
            this._logger.info('Iniciando GetProfile', { userId: userId.substring(0, 8), hasEmail: !!userEmail });

            // Primero intentar obtener el perfil existente
            let result = await this._repository.getAccountByCognitoId(userId);

            // Si no existe, crear usuario automáticamente (lazy provisioning)
            if (!result) {
                this._logger.info('Usuario no encontrado, creando perfil automáticamente', { userId: userId.substring(0, 8) });

                if (!userEmail) {
                    this._logger.error('No se puede crear perfil: email faltante', { userId: userId.substring(0, 8) });
                    return ErrorResponse(new Error('Email requerido para crear perfil'), 400);
                }

                // Generar nombres basados en el email
                const randomNames = generateRandomProfile(userEmail);
                this._logger.debug('Nombres generados desde email para lazy provisioning');

                // Crear perfil básico con datos de Cognito y nombres generados
                const basicProfile = {
                    cognito_user_id: userId,
                    first_name: randomNames.firstName,
                    last_name: randomNames.lastName,
                    phone: ''
                };

                result = await this._repository.createAccount(basicProfile, userEmail);
                this._logger.info('Perfil creado automáticamente exitosamente', { 
                    userId: userId.substring(0, 8), 
                    emailDomain: userEmail?.split('@')[1] // Solo dominio, no email completo ni nombres
                });
            }

            this._logger.info('Perfil obtenido exitosamente', { userId: userId.substring(0, 8) });
            return SuccessResponse(result);
        } catch (error) {
            this._logger.error('Error en GetProfile', error, { userId: userId.substring(0, 8) });
            return ErrorResponse(error);
        }
    }
}
