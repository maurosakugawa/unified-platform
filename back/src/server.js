import { initDatabase } from './db/index.js';
import app from './app.js';

const PORT = process.env.PORT || 3101;

async function start() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
      console.log(`   Auth:     POST /auth/register, POST /auth/login`);
      console.log(`   Contacts: GET/POST/PUT/DELETE /api/contacts`);
      console.log(`   Events:   GET/POST/PUT/DELETE /api/events`);
    });
  } catch (err) {
    console.error('❌ Falha ao iniciar:', err);
    process.exit(1);
  }
}

start();
