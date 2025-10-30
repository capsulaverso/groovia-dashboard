import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { Pool as PgPool } from 'pg';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import ws from 'ws';
import * as schema from '../shared/schema.js';

neonConfig.webSocketConstructor = ws;

const databaseUrl = process.env.DATABASE_URL || 
  'postgresql://authenticator:npg_M6Wqf5cFoSRe@ep-bold-poetry-a4sbv5mh-pooler.us-east-1.aws.neon.tech/capsula?sslmode=require';

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL must be set. Did you forget to provision a database?',
  );
}

// Se for Supabase, usar pg em vez de neon
let pool;
let db;

if (databaseUrl.includes('supabase.co')) {
  // Usar pg para Supabase
  pool = new PgPool({ connectionString: databaseUrl });
  db = drizzlePg(pool, { schema });
  console.log('✅ Usando driver PostgreSQL para Supabase');
} else {
  // Usar neon para Neon
  pool = new NeonPool({ connectionString: databaseUrl });
  db = drizzleNeon(pool, { schema });
  console.log('✅ Usando driver Neon serverless');
}

export { pool, db };
