import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../shared/schema.js';

// Criar banco SQLite em memória temporário
const sqlite = new Database(':memory:');
export const db = drizzle(sqlite, { schema });

// Habilitar chaves estrangeiras no SQLite
sqlite.pragma('foreign_keys = ON');

console.log('✅ Banco de dados SQLite em memória criado');

