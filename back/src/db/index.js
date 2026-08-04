import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const db = new PGlite('./pgdata');

export async function initDatabase() {
  console.log('🗄️  Inicializando banco de dados...');

  // Verificar se tabela users existe (se não, rodar migrations)
  const result = await db.query(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name='users'
  `).catch(() => ({ rows: [] }));

  // PGlite usa SQLite internamente para metadata, mas vamos tentar outra abordagem
  // Rodar migrations sempre (idempotentes com IF NOT EXISTS)
  const migrations = [
    '001_create_users.sql',
    '002_create_contacts.sql',
    '003_create_events.sql',
  ];

  for (const migration of migrations) {
    const path = join(__dirname, 'migrations', migration);
    try {
      const sql = readFileSync(path, 'utf-8');
      await db.exec(sql);
      console.log(`   ✅ ${migration}`);
    } catch (err) {
      console.error(`   ❌ Erro em ${migration}:`, err.message);
      throw err;
    }
  }

  console.log('✅ Banco pronto!');
}

export { db };
