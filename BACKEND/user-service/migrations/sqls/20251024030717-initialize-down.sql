-- ============================================================================
-- Migration Rollback: Initialize Users Table
-- Description: Reverts the users table creation
-- ============================================================================

-- Eliminar trigger
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Eliminar función
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Eliminar tabla (CASCADE eliminará dependencias)
DROP TABLE IF EXISTS users CASCADE;

-- Eliminar extensión
DROP EXTENSION IF EXISTS citext CASCADE;

-- ============================================================================
-- End of rollback
-- ============================================================================