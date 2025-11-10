import { createLogger } from "./logger.js";

const logger = createLogger('ValidationUtility');

/**
 * Representa un un error de validación simple
 */
interface SimpleValidationError {
    property: string;
    message: string;
}

/**
 * Resultado de la validación manual
 */
interface ValidationResult {
    isValid: boolean;
    errors: SimpleValidationError[];
}

/**
 * Valida un objeto de entrada con reglas simples.
 * @param input - Objeto a validar.
 * @returns ValidationResult con información de la validación.
 */
export const validateInput = async (input: any): Promise<ValidationResult> => {
    const errors: SimpleValidationError[] = [];

    if (!input || typeof input !== 'object') {
        errors.push({ property: 'body', message: 'El cuerpo de la solicitud debe ser un objeto JSON válido.' });
        return { isValid: false, errors };
    }

    // Validar first_name
    if (typeof input.first_name !== 'string' || input.first_name.trim().length === 0) {
        errors.push({ property: 'first_name', message: 'El nombre es requerido y debe ser una cadena no vacía.' });
    } else if (input.first_name.trim().length > 50) {
        errors.push({ property: 'first_name', message: 'El nombre no debe exceder los 50 caracteres.' });
    }

    // Validar last_name
    if (typeof input.last_name !== 'string' || input.last_name.trim().length === 0) {
        errors.push({ property: 'last_name', message: 'El apellido es requerido y debe ser una cadena no vacía.' });
    } else if (input.last_name.trim().length > 50) {
        errors.push({ property: 'last_name', message: 'El apellido no debe exceder los 50 caracteres.' });
    }

    // Validar email (requerido para usuarios)
    if (!input.email || typeof input.email !== 'string' || input.email.trim().length === 0) {
        errors.push({ property: 'email', message: 'El email es requerido y debe ser una cadena no vacía.' });
    } else {
        // Validación básica de formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.email.trim())) {
            errors.push({ property: 'email', message: 'El email debe tener un formato válido (ej: usuario@dominio.com).' });
        } else if (input.email.trim().length > 255) {
            errors.push({ property: 'email', message: 'El email no debe exceder los 255 caracteres.' });
        }
    }

    // Validar phone (opcional, pero si existe, debe ser string y con formato básico)
    if (input.phone !== undefined && input.phone !== null && input.phone.trim().length > 0) {
        if (typeof input.phone !== 'string') {
            errors.push({ property: 'phone', message: 'El teléfono debe ser una cadena de texto.' });
        } else if (!/^\+?[0-9\s-()]{7,20}$/.test(input.phone.trim())) {
            errors.push({ property: 'phone', message: 'El formato del teléfono es inválido.' });
        }
        }
        
    if (errors.length > 0) {
        logger.warn('Errores de validación encontrados', { errors });
        return { isValid: false, errors };
    }

    return { isValid: true, errors: [] };
};
