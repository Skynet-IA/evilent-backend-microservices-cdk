/**
 * Generador de nombres aleatorios para auto-provisioning de usuarios
 * Genera firstName basado en el email y lastName con números aleatorios
 */

/**
 * Genera un nombre basado en el email del usuario
 * Extrae la parte antes del @ y la sanitiza
 * @param email - Email del usuario
 * @returns String sanitizado del email
 */
function generateNameFromEmail(email: string): string {
    // Extraer la parte antes del @
    const username = email.split('@')[0];
    
    // Sanitizar: remover caracteres especiales y números, mantener solo letras
    const sanitized = username.replace(/[^a-zA-Z]/g, '');
    
    // Si después de sanitizar queda vacío o muy corto, usar un nombre genérico
    if (sanitized.length < 3) {
        return 'User' + Math.floor(Math.random() * 1000);
    }
    
    // Capitalizar primera letra
    return sanitized.charAt(0).toUpperCase() + sanitized.slice(1).toLowerCase();
}

/**
 * Genera un apellido con números aleatorios
 * @returns String con números aleatorios (6 dígitos)
 */
function generateRandomNumbers(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Genera un perfil de nombres completo
 * - firstName: basado en el email del usuario
 * - lastName: números aleatorios
 * 
 * Ej: email "john.doe123@example.com" -> { firstName: "Johndoe", lastName: "847392" }
 */
export function generateRandomProfile(email: string): { firstName: string; lastName: string } {
    return {
        firstName: generateNameFromEmail(email),
        lastName: generateRandomNumbers()
    };
}
