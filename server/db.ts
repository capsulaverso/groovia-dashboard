import 'dotenv/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema.js';

// Verifica se a variável está configurada
const databaseUrl = process.env.DATABASE_URL;
console.log('🔍 DATABASE_URL no db.ts:', databaseUrl ? `${databaseUrl.substring(0, 20)}...` : '❌ NÃO DEFINIDA');

if (!databaseUrl) {
  console.error('❌ DATABASE_URL não definida no .env');
  throw new Error('❌ DATABASE_URL não definida. Configure no arquivo .env.');
}

let pool;
let db;

try {
  pool = new Pool({ connectionString: databaseUrl });
  db = drizzle(pool, { schema });
  console.log('✅ Conectado ao PostgreSQL com Drizzle ORM');
  
  // Testar conexão
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('❌ Erro ao testar conexão:', err.message);
    } else {
      console.log('✅ Teste de conexão bem-sucedido');
    }
  });
} catch (error: any) {
  console.error('❌ Erro ao inicializar o banco de dados:', error.message);
  console.error('❌ Stack:', error.stack);
  throw error;
}

export { pool, db };
