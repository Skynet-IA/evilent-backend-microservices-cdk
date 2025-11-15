/**
 * Knex Configuration for Migrations
 * 
 * REGLA DE ORO: Centralizar configuración de BD
 * - Migrations en src/db/migrations/
 * - Seeds en src/db/seeds/ (opcional)
 */

import type { Knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'evilent_user',
      password: process.env.DB_PASSWORD || 'secure_password_change_in_prod',
      database: process.env.DB_NAME || 'express_service_db',
    },
    migrations: {
      extension: 'ts',
      directory: './src/db/migrations',
      tableName: 'knex_migrations',
    },
    seeds: {
      extension: 'ts',
      directory: './src/db/seeds',
    },
  },

  test: {
    client: 'pg',
    connection: {
      host: process.env.TEST_DB_HOST || 'localhost',
      port: parseInt(process.env.TEST_DB_PORT || '5432'),
      user: process.env.TEST_DB_USER || 'evilent_user',
      password: process.env.TEST_DB_PASSWORD || 'secure_password_change_in_prod',
      database: process.env.TEST_DB_NAME || 'express_service_test_db',
    },
    migrations: {
      extension: 'ts',
      directory: './src/db/migrations',
      tableName: 'knex_migrations',
    },
  },

  production: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    },
    migrations: {
      extension: 'ts',
      directory: './src/db/migrations',
      tableName: 'knex_migrations',
    },
    pool: {
      min: 5,
      max: 30,
    },
  },
};

export default config;

