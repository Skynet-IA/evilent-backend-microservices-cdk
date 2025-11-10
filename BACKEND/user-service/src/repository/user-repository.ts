import { DBOperation } from "../db/db-operation";
import { UserModel } from "../models/user-model";
import { createLogger } from "../utility/logger";
import { UserProfileWithCognitoId } from "../dto/index.js";

export class UserRepository extends DBOperation {
    private _repoLogger = createLogger('UserRepository');

    constructor() {
        super();
    }

    async createAccount(input: UserProfileWithCognitoId, email: string): Promise<UserModel> {
        try {
            const query = `
                INSERT INTO users (cognito_user_id, email, first_name, last_name, phone, user_type)
                VALUES ($1, $2, $3, $4, $5, 'BUYER')
                RETURNING id, cognito_user_id, email, first_name, last_name, phone, user_type, profile_pic, verified, created_at, updated_at
            `;
            
            // Convertir string vacío a null para cumplir con el constraint de la BD
            const phoneValue = input.phone && input.phone.trim() !== '' ? input.phone : null;
            
            const result = await this.ExecuteQuery(query, [
                input.cognito_user_id,
                email,
                input.first_name,
                input.last_name,
                phoneValue
            ]);

            if (result.rowCount === 0 || !result.rows[0]) {
                throw new Error('No se pudo crear el usuario');
            }

            const row = result.rows[0];
            this._repoLogger.info('Usuario creado exitosamente', { userId: row.id });
            return {
                user_id: row.id,
                cognito_user_id: row.cognito_user_id,
                email: row.email,
                first_name: row.first_name,
                last_name: row.last_name,
                phone: row.phone,
                userType: row.user_type,
                profile_pic: row.profile_pic,
                verified: row.verified,
                created_at: row.created_at,
                updated_at: row.updated_at,
            };
        } catch (error) {
            this._repoLogger.error('Error in createAccount', error);
            throw error;
        }
    }

    async updateAccount(input: UserProfileWithCognitoId): Promise<UserModel> {
        try {
            const query = `
                UPDATE users
                SET first_name = $2, last_name = $3, phone = $4, updated_at = CURRENT_TIMESTAMP
                WHERE cognito_user_id = $1
                RETURNING id, cognito_user_id, email, first_name, last_name, phone, user_type, profile_pic, verified, created_at, updated_at
            `;

            // Convertir string vacío a null para cumplir con el constraint de la BD
            const phoneValue = input.phone && input.phone.trim() !== '' ? input.phone : null;

            const result = await this.ExecuteQuery(query, [
                input.cognito_user_id,
                input.first_name,
                input.last_name,
                phoneValue
            ]);

            if (result.rowCount === 0 || !result.rows[0]) {
                throw new Error('Usuario no encontrado para actualizar');
            }

            const row = result.rows[0];
            this._repoLogger.info('Usuario actualizado exitosamente', { userId: row.id });
            return {
                user_id: row.id,
                cognito_user_id: row.cognito_user_id,
                email: row.email,
                first_name: row.first_name,
                last_name: row.last_name,
                phone: row.phone,
                userType: row.user_type,
                profile_pic: row.profile_pic,
                verified: row.verified,
                created_at: row.created_at,
                updated_at: row.updated_at,
            };
        } catch (error) {
            this._repoLogger.error('Error in updateAccount', error);
            throw error;
        }
    }


    async getAccountByCognitoId(cognitoUserId: string): Promise<UserModel | null> {
        try {
            
            const query = `
                SELECT id, cognito_user_id, email, first_name, last_name, phone, user_type, profile_pic, verified, created_at, updated_at
                FROM users 
                WHERE cognito_user_id = $1
                LIMIT 1
            `;
            
            const result = await this.ExecuteQuery(query, [cognitoUserId]);

            // Si no existe, retornar null (no es un error)
            if (result.rowCount === 0 || !result.rows[0]) {
                this._repoLogger.debug('Perfil no encontrado', { cognitoUserId });
                return null;
            }

            const row = result.rows[0];
            this._repoLogger.info('Usuario encontrado exitosamente', { userId: row.id });
            return {
                user_id: row.id,
                cognito_user_id: row.cognito_user_id,
                email: row.email,
                first_name: row.first_name,
                last_name: row.last_name,
                phone: row.phone,
                userType: row.user_type,
                profile_pic: row.profile_pic,
                verified: row.verified,
                created_at: row.created_at,
                updated_at: row.updated_at,
            };
        } catch (error) {
            this._repoLogger.error('Error in getAccountByCognitoId', error);
            throw error;
        }
    }
}
