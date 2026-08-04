
# =============================================================================
# CORREÇÕES FASE 1 — Problemas identificados nos testes
# =============================================================================

cd ~/Sites/github/01-PI-planner/unified-platform/back

# -----------------------------------------------------------------------------
# CORREÇÃO 1: Criar server.js separado do app.js
# Isso permite que testes importem o app sem iniciar o servidor
# -----------------------------------------------------------------------------

cat > src/server.js << 'EOFSERVER'
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
EOFSERVER

echo "✅ src/server.js criado"

# -----------------------------------------------------------------------------
# CORREÇÃO 2: Atualizar app.js — remover o app.listen() e initDatabase()
# -----------------------------------------------------------------------------

cat > src/app.js << 'EOFAPP'
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';
import { requireAuth } from './middleware/requireAuth.js';
import authRoutes from './routes/auth.js';
import contactRoutes from './routes/contacts.js';
import eventRoutes from './routes/events.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-prod',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', phase: 1 });
});

// Rotas públicas
app.use('/auth', authRoutes);

// Rotas protegidas
app.use('/api/contacts', requireAuth, contactRoutes);
app.use('/api/events', requireAuth, eventRoutes);

// Error handler (sempre por último)
app.use(errorHandler);

export default app;
EOFAPP

echo "✅ src/app.js atualizado (sem listen)"

# -----------------------------------------------------------------------------
# CORREÇÃO 3: Atualizar package.json para usar server.js no dev/start
# -----------------------------------------------------------------------------

cat > package.json << 'EOFPKG'
{
  "name": "unified-platform-backend",
  "version": "1.0.0",
  "description": "Backend unificado — Auth, Contacts, Events",
  "main": "src/server.js",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "express-session": "^1.17.3",
    "cors": "^2.8.5",
    "@electric-sql/pglite": "^0.2.0",
    "bcryptjs": "^2.4.3",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "vitest": "^1.0.0",
    "supertest": "^6.3.3"
  },
  "type": "module"
}
EOFPKG

echo "✅ package.json atualizado (dev usa server.js)"

# -----------------------------------------------------------------------------
# CORREÇÃO 4: Atualizar errorHandler para retornar 404 corretamente
# -----------------------------------------------------------------------------

cat > src/middleware/errorHandler.js << 'EOFERR'
export function errorHandler(err, req, res, next) {
  console.error('[ERROR]', err.message);

  // Se a mensagem contiver "não encontrado", retornar 404
  const isNotFound = err.message && err.message.toLowerCase().includes('não encontrado');
  const status = isNotFound ? 404 : (err.status || 500);

  res.status(status).json({
    error: err.message || 'Erro interno do servidor',
  });
}
EOFERR

echo "✅ errorHandler atualizado (404 para 'não encontrado')"

# -----------------------------------------------------------------------------
# CORREÇÃO 5: Atualizar teste para criar evento novo antes do teste de outro usuário
# -----------------------------------------------------------------------------

cat > test/events.test.js << 'EOFTEST'
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Events API', () => {
  let sessionCookie;
  let otherSessionCookie;
  let eventId;
  let otherEventId;
  let contactId;

  beforeAll(async () => {
    // Registrar e logar usuário de teste
    await request(app).post('/auth/register').send({ username: 'testuser', password: '123456' });

    const loginRes = await request(app).post('/auth/login').send({ username: 'testuser', password: '123456' });
    sessionCookie = loginRes.headers['set-cookie'];

    // Registrar e logar OUTRO usuário
    await request(app).post('/auth/register').send({ username: 'outro', password: '123456' });
    const otherLoginRes = await request(app).post('/auth/login').send({ username: 'outro', password: '123456' });
    otherSessionCookie = otherLoginRes.headers['set-cookie'];

    // Criar contato de teste
    const contactRes = await request(app)
      .post('/api/contacts')
      .set('Cookie', sessionCookie)
      .send({ name: 'João Teste', phone: '11999999999', email: 'joao@test.com' });
    contactId = contactRes.body.id;
  });

  it('deve criar um evento', async () => {
    const res = await request(app)
      .post('/api/events')
      .set('Cookie', sessionCookie)
      .send({
        title: 'Reunião de Teste',
        description: 'Teste do sistema',
        event_date: '2026-08-10',
        event_time: '14:00',
        category: 'trabalho',
        priority: 'alta',
        location: 'São Paulo',
        contact_ids: [contactId],
        reminder_minutes: 30,
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('Reunião de Teste');
    expect(res.body.location).toBe('São Paulo');
    expect(Array.isArray(res.body.contact_ids)).toBe(true);
    eventId = res.body.id;
  });

  it('deve listar eventos do usuário', async () => {
    const res = await request(app)
      .get('/api/events')
      .set('Cookie', sessionCookie);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('deve atualizar um evento', async () => {
    const res = await request(app)
      .put(`/api/events/${eventId}`)
      .set('Cookie', sessionCookie)
      .send({
        title: 'Reunião Atualizada',
        description: 'Descrição atualizada',
        event_date: '2026-08-11',
        event_time: '15:00',
        category: 'trabalho',
        priority: 'media',
        location: 'Rio de Janeiro',
        contact_ids: [contactId],
        reminder_minutes: 60,
      });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Reunião Atualizada');
    expect(res.body.location).toBe('Rio de Janeiro');
  });

  it('deve buscar contatos do evento', async () => {
    const res = await request(app)
      .get(`/api/events/${eventId}/contacts`)
      .set('Cookie', sessionCookie);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].name).toBe('João Teste');
  });

  it('deve rejeitar evento de outro usuário', async () => {
    // Criar um evento com o primeiro usuário para testar isolamento
    const createRes = await request(app)
      .post('/api/events')
      .set('Cookie', sessionCookie)
      .send({
        title: 'Evento Privado',
        event_date: '2026-08-15',
        category: 'pessoal',
        priority: 'alta',
      });
    const privateEventId = createRes.body.id;

    // Tentar deletar com outro usuário
    const res = await request(app)
      .delete(`/api/events/${privateEventId}`)
      .set('Cookie', otherSessionCookie);
    expect(res.status).toBe(404);
    expect(res.body.error).toContain('não encontrado');
  });

  it('deve deletar um evento', async () => {
    const res = await request(app)
      .delete(`/api/events/${eventId}`)
      .set('Cookie', sessionCookie);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Evento removido');
  });

  it('deve rejeitar sem autenticação', async () => {
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(401);
  });
});
EOFTEST

echo "✅ test/events.test.js atualizado"

echo ""
echo "=============================="
echo "✅ CORREÇÕES APLICADAS!"
echo "=============================="
echo ""
echo "Agora teste:"
echo "  1. Pare o servidor se estiver rodando (Ctrl+C)"
echo "  2. npm run dev     # Subir servidor na porta 3101"
echo "  3. (outro terminal) npm test   # Rodar testes (não vai conflitar mais)"
echo ""
