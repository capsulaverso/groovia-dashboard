import { Pool } from 'pg';
import fs from 'fs';

const pool = new Pool({
  connectionString: 'postgresql://postgres:4iPjjDMPyRmHAbRy@db.pomliylhitigmqrdcqsy.supabase.co:5432/postgres'
});

async function setupDatabase() {
  try {
    console.log('📊 Conectando ao Supabase...');
    
    // Dropar tabelas existentes em ordem reversa
    console.log('🗑️  Limpando tabelas antigas...');
    await pool.query('DROP TABLE IF EXISTS agent_messages CASCADE');
    await pool.query('DROP TABLE IF EXISTS agent_conversations CASCADE');
    await pool.query('DROP TABLE IF EXISTS integrations CASCADE');
    await pool.query('DROP TABLE IF EXISTS user_progress CASCADE');
    await pool.query('DROP TABLE IF EXISTS messages CASCADE');
    await pool.query('DROP TABLE IF EXISTS conversations CASCADE');
    await pool.query('DROP TABLE IF EXISTS documents CASCADE');
    await pool.query('DROP TABLE IF EXISTS agents CASCADE');
    await pool.query('DROP TABLE IF EXISTS users CASCADE');
    await pool.query('DROP TABLE IF EXISTS clients CASCADE');
    
    console.log('✅ Tabelas limpas');
    
    // Ler SQL
    const sql = fs.readFileSync('./setup-db-fixed.sql', 'utf8');
    
    // Separar por comandos
    const commands = sql.split(';').filter(cmd => cmd.trim().length > 0 && !cmd.trim().startsWith('--'));
    
    console.log(`📝 Criando ${commands.length} tabelas...`);
    
    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i].trim();
      if (cmd.length > 0 && !cmd.startsWith('--')) {
        try {
          await pool.query(cmd);
          console.log(`✅ ${i + 1}/${commands.length}`);
        } catch (e) {
          console.log(`⚠️  Erro no comando ${i + 1}:`, e.message.substring(0, 80));
        }
      }
    }
    
    console.log('✅ Tabelas criadas com sucesso!');
    await pool.end();
  } catch (error) {
    console.error('❌ Erro:', error.message);
    await pool.end();
    process.exit(1);
  }
}

setupDatabase();
