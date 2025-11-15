import type { Knex } from "knex";

/**
 * Migration: Create users table
 * 
 * REGLA DE ORO: Migraciones como código versionado
 * - Reversibles (down es inverso de up)
 * - Idempotentes
 * - Documentadas
 */

export async function up(knex: Knex): Promise<void> {
  // Crear tabla users
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.string('first_name', 50);
    table.string('last_name', 50);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('deleted_at').nullable(); // Soft delete

    // Índices para performance
    table.index('email');
    table.index('created_at');
  });

  // Crear tabla refresh_tokens
  await knex.schema.createTable('refresh_tokens', (table) => {
    table.increments('id').primary();
    table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('token', 255).notNullable().unique();
    table.timestamp('expires_at').notNullable();
    table.timestamp('revoked_at').nullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    // Índices para performance
    table.index('user_id');
    table.index('token');
    table.index('expires_at');
  });

  // Crear tabla audit_logs (para futuros audits)
  await knex.schema.createTable('audit_logs', (table) => {
    table.increments('id').primary();
    table.integer('user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.string('action', 50).notNullable(); // 'CREATE', 'UPDATE', 'DELETE'
    table.string('entity', 50).notNullable(); // 'users', 'orders', etc
    table.integer('entity_id').nullable();
    table.jsonb('changes').nullable(); // Cambios hechos
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    // Índices para performance
    table.index('user_id');
    table.index('entity');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  // Eliminar en orden inverso (por foreign keys)
  await knex.schema.dropTableIfExists('audit_logs');
  await knex.schema.dropTableIfExists('refresh_tokens');
  await knex.schema.dropTableIfExists('users');
}

