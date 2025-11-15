-- ============================================================================
-- INITIALIZATION SCRIPT - PostgreSQL
-- 
-- Este script se ejecuta automáticamente al crear el container Docker
-- Solo se ejecuta UNA VEZ (primera vez que se inicia el container)
-- ============================================================================

-- Crear schema si no existe
CREATE SCHEMA IF NOT EXISTS public;

-- Habilitar uuid extension (para generar UUIDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Habilitar creación automática de timestamps
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABLA: users
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL -- Soft delete
);

-- Índices para queries frecuentes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLA: refresh_tokens (para token management)
-- ============================================================================

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para queries frecuentes
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- Trigger para refresh_tokens
DROP TRIGGER IF EXISTS update_refresh_tokens_updated_at ON refresh_tokens;
CREATE TRIGGER update_refresh_tokens_updated_at
  BEFORE UPDATE ON refresh_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS (Documentación en la BD)
-- ============================================================================

COMMENT ON TABLE users IS 'Tabla de usuarios registrados en el sistema';
COMMENT ON COLUMN users.email IS 'Email único del usuario (caso insensible)';
COMMENT ON COLUMN users.password_hash IS 'Hash del password (usando bcrypt)';
COMMENT ON COLUMN users.first_name IS 'Nombre del usuario';
COMMENT ON COLUMN users.last_name IS 'Apellido del usuario';
COMMENT ON COLUMN users.deleted_at IS 'Timestamp de soft delete (NULL si activo)';

COMMENT ON TABLE refresh_tokens IS 'Tabla de refresh tokens para rotación de sesiones';
COMMENT ON COLUMN refresh_tokens.user_id IS 'FK a tabla users';
COMMENT ON COLUMN refresh_tokens.token IS 'Token JWT encriptado';
COMMENT ON COLUMN refresh_tokens.expires_at IS 'Fecha de expiración del token';
COMMENT ON COLUMN refresh_tokens.revoked_at IS 'Fecha de revocación (NULL si válido)';

-- ============================================================================
-- LOGGING
-- ============================================================================

-- Crear tabla para audit logs (opcional, para futuro)
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  entity VARCHAR(50) NOT NULL,
  entity_id INTEGER,
  changes JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================================
-- DATOS DE EJEMPLO (solo para desarrollo)
-- ============================================================================

-- Nota: Los datos de ejemplo se crean opcionalmente en migrations
-- Este script solo crea el schema

