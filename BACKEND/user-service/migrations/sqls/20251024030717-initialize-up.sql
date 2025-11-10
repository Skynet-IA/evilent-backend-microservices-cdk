-- ============================================================================
-- Migration: Initialize Users Table
-- Description: Creates users table with security constraints and indexes
-- Author: EVILENT Team
-- Date: 2025-10-17
-- ============================================================================

-- Tabla principal de usuarios
CREATE TABLE IF NOT EXISTS users (
    -- Identificadores
    id BIGSERIAL PRIMARY KEY,
    cognito_user_id VARCHAR(255) UNIQUE NOT NULL,
    
    -- Información de contacto
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    
    -- Información personal
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    profile_pic TEXT,
    
    -- Tipo y estado
    user_type VARCHAR(20) NOT NULL DEFAULT 'BUYER',
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints de validación
    CONSTRAINT users_email_format_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT users_user_type_check CHECK (user_type IN ('BUYER', 'SELLER')),
    CONSTRAINT users_cognito_id_length_check CHECK (char_length(cognito_user_id) > 0),
    CONSTRAINT users_name_length_check CHECK (
        (first_name IS NULL OR char_length(trim(first_name)) > 0) AND
        (last_name IS NULL OR char_length(trim(last_name)) > 0)
    ),
    CONSTRAINT users_phone_format_check CHECK (
        phone IS NULL OR phone ~* '^\+?[1-9]\d{1,14}$'
    )
);

-- Índices para optimizar queries frecuentes
CREATE INDEX IF NOT EXISTS idx_users_cognito_id ON users(cognito_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type) WHERE user_type = 'SELLER';
CREATE INDEX IF NOT EXISTS idx_users_verified ON users(verified) WHERE verified = TRUE;
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Índice adicional para búsquedas case-insensitive en email
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users(LOWER(email));

-- Comentarios para documentación
COMMENT ON TABLE users IS 'Tabla principal de usuarios del sistema';
COMMENT ON COLUMN users.id IS 'ID único autoincremental del usuario';
COMMENT ON COLUMN users.cognito_user_id IS 'ID del usuario en AWS Cognito (sub claim del JWT)';
COMMENT ON COLUMN users.email IS 'Email del usuario (almacenado como VARCHAR, búsquedas case-insensitive via LOWER())';
COMMENT ON COLUMN users.phone IS 'Teléfono del usuario en formato E.164';
COMMENT ON COLUMN users.user_type IS 'Tipo de usuario: BUYER o SELLER';
COMMENT ON COLUMN users.verified IS 'Indica si el email del usuario ha sido verificado';
COMMENT ON COLUMN users.created_at IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN users.updated_at IS 'Fecha y hora de última actualización del registro';

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- End of migration
-- ============================================================================