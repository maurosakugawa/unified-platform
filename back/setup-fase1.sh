#!/bin/bash
# =============================================================================
# SETUP FASE 1 — Backend Unificado
# =============================================================================
# Cria todo o backend: migrations, controllers, services, rotas, testes
# Pré-requisito: Fase 0 concluída e Node.js 20+ instalado
# =============================================================================

set -e

echo "🚀 FASE 1 — Backend Unificado"
echo "==============================="
echo ""

cd ~/Sites/github/01-PI-planner/unified-platform/back

# -----------------------------------------------------------------------------
# 1. CONEXÃO COM BANCO (PGlite)
# -----------------------------------------------------------------------------
echo "📦 1. Criando conexão com PGlite..."

cat > src/db/index.js << 'EOFDB'
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
EOFDB

echo "   ✅ src/db/index.js"

# -----------------------------------------------------------------------------
# 2. MIGRATIONS
# -----------------------------------------------------------------------------
echo "📦 2. Criando migrations..."

cat > src/db/migrations/001_create_users.sql << 'EOFSQL'
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
EOFSQL

cat > src/db/migrations/002_create_contacts.sql << 'EOFSQL'
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  cep VARCHAR(9),
  logradouro VARCHAR(150),
  numero VARCHAR(20),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  uf CHAR(2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
EOFSQL

cat > src/db/migrations/003_create_events.sql << 'EOFSQL'
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  category VARCHAR(50) DEFAULT 'geral',
  priority VARCHAR(20) DEFAULT 'media',
  location VARCHAR(100),
  contact_ids TEXT DEFAULT '[]',
  reminder_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
EOFSQL

echo "   ✅ 3 migrations criadas"

# -----------------------------------------------------------------------------
# 3. UTILS
# -----------------------------------------------------------------------------
echo "📦 3. Criando utilitários..."

cat > src/utils/logger.js << 'EOFUTIL'
export const logger = {
  info: (msg) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
  error: (msg, err) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, err?.message || ''),
};
EOFUTIL

cat > src/utils/normalizer.js << 'EOFUTIL'
export function normalizePhone(phone) {
  return phone.replace(/\D/g, '');
}

export function normalizeCEP(cep) {
  return cep.replace(/\D/g, '').slice(0, 8);
}
EOFUTIL

echo "   ✅ src/utils/"

# -----------------------------------------------------------------------------
# 4. MIDDLEWARES
# -----------------------------------------------------------------------------
echo "📦 4. Criando middlewares..."

cat > src/middleware/requireAuth.js << 'EOFMID'
export function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Não autenticado. Faça login.' });
  }
  next();
}
EOFMID

cat > src/middleware/errorHandler.js << 'EOFMID'
export function errorHandler(err, req, res, next) {
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
  });
}
EOFMID

echo "   ✅ src/middleware/"

# -----------------------------------------------------------------------------
# 5. SERVICES
# -----------------------------------------------------------------------------
echo "📦 5. Criando services..."

cat > src/services/authService.js << 'EOFSVC'
import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';

export async function registerUser(username, password) {
  const existing = await db.query('SELECT id FROM users WHERE username = $1', [username]);
  if (existing.rows.length > 0) {
    throw new Error('Usuário já existe');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await db.query(
    'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
    [username, passwordHash]
  );
  return result.rows[0];
}

export async function loginUser(username, password) {
  const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
  if (result.rows.length === 0) {
    throw new Error('Usuário ou senha inválidos');
  }

  const user = result.rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new Error('Usuário ou senha inválidos');
  }

  return { id: user.id, username: user.username };
}

export async function getUserById(id) {
  const result = await db.query('SELECT id, username, created_at FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
}
EOFSVC

cat > src/services/contactService.js << 'EOFSVC'
import { db } from '../db/index.js';

export async function getContactsByUser(userId) {
  const result = await db.query(
    'SELECT * FROM contacts WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

export async function createContact(userId, data) {
  const { name, phone, email, cep, logradouro, numero, bairro, cidade, uf } = data;
  const result = await db.query(
    `INSERT INTO contacts (user_id, name, phone, email, cep, logradouro, numero, bairro, cidade, uf)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [userId, name, phone, email, cep, logradouro, numero, bairro, cidade, uf]
  );
  return result.rows[0];
}

export async function updateContact(userId, contactId, data) {
  const { name, phone, email, cep, logradouro, numero, bairro, cidade, uf } = data;
  const result = await db.query(
    `UPDATE contacts 
     SET name=$1, phone=$2, email=$3, cep=$4, logradouro=$5, numero=$6, bairro=$7, cidade=$8, uf=$9, updated_at=NOW()
     WHERE id=$10 AND user_id=$11
     RETURNING *`,
    [name, phone, email, cep, logradouro, numero, bairro, cidade, uf, contactId, userId]
  );
  if (result.rows.length === 0) throw new Error('Contato não encontrado');
  return result.rows[0];
}

export async function deleteContact(userId, contactId) {
  const result = await db.query(
    'DELETE FROM contacts WHERE id = $1 AND user_id = $2 RETURNING id',
    [contactId, userId]
  );
  if (result.rows.length === 0) throw new Error('Contato não encontrado');
  return { message: 'Contato removido' };
}
EOFSVC

cat > src/services/eventService.js << 'EOFSVC'
import { db } from '../db/index.js';

export async function getEventsByUser(userId, filters = {}) {
  let sql = 'SELECT * FROM events WHERE user_id = $1';
  const params = [userId];
  let paramIndex = 2;

  if (filters.from) {
    sql += ` AND event_date >= $${paramIndex++}`;
    params.push(filters.from);
  }
  if (filters.to) {
    sql += ` AND event_date <= $${paramIndex++}`;
    params.push(filters.to);
  }
  if (filters.category) {
    sql += ` AND category = $${paramIndex++}`;
    params.push(filters.category);
  }

  sql += ' ORDER BY event_date ASC, event_time ASC';

  const result = await db.query(sql, params);
  return result.rows.map(row => ({
    ...row,
    contact_ids: JSON.parse(row.contact_ids || '[]'),
  }));
}

export async function createEvent(userId, data) {
  const { title, description, event_date, event_time, category, priority, location, contact_ids, reminder_minutes } = data;
  const result = await db.query(
    `INSERT INTO events (user_id, title, description, event_date, event_time, category, priority, location, contact_ids, reminder_minutes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [userId, title, description, event_date, event_time, category || 'geral', priority || 'media', location, JSON.stringify(contact_ids || []), reminder_minutes || 0]
  );
  const row = result.rows[0];
  row.contact_ids = JSON.parse(row.contact_ids || '[]');
  return row;
}

export async function updateEvent(userId, eventId, data) {
  const { title, description, event_date, event_time, category, priority, location, contact_ids, reminder_minutes } = data;
  const result = await db.query(
    `UPDATE events 
     SET title=$1, description=$2, event_date=$3, event_time=$4, category=$5, priority=$6, location=$7, contact_ids=$8, reminder_minutes=$9, updated_at=NOW()
     WHERE id=$10 AND user_id=$11
     RETURNING *`,
    [title, description, event_date, event_time, category, priority, location, JSON.stringify(contact_ids || []), reminder_minutes, eventId, userId]
  );
  if (result.rows.length === 0) throw new Error('Evento não encontrado');
  const row = result.rows[0];
  row.contact_ids = JSON.parse(row.contact_ids || '[]');
  return row;
}

export async function deleteEvent(userId, eventId) {
  const result = await db.query(
    'DELETE FROM events WHERE id = $1 AND user_id = $2 RETURNING id',
    [eventId, userId]
  );
  if (result.rows.length === 0) throw new Error('Evento não encontrado');
  return { message: 'Evento removido' };
}

export async function getEventContacts(eventId, userId) {
  const eventResult = await db.query(
    'SELECT contact_ids FROM events WHERE id = $1 AND user_id = $2',
    [eventId, userId]
  );
  if (eventResult.rows.length === 0) throw new Error('Evento não encontrado');

  const contactIds = JSON.parse(eventResult.rows[0].contact_ids || '[]');
  if (contactIds.length === 0) return [];

  const placeholders = contactIds.map((_, i) => `$${i + 2}`).join(',');
  const contactsResult = await db.query(
    `SELECT * FROM contacts WHERE user_id = $1 AND id IN (${placeholders})`,
    [userId, ...contactIds]
  );
  return contactsResult.rows;
}
EOFSVC

echo "   ✅ src/services/"

# -----------------------------------------------------------------------------
# 6. CONTROLLERS
# -----------------------------------------------------------------------------
echo "📦 6. Criando controllers..."

cat > src/controllers/authController.js << 'EOFCTRL'
import * as authService from '../services/authService.js';

export async function register(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username e senha são obrigatórios' });
    }
    const user = await authService.registerUser(username, password);
    res.status(201).json({ message: 'Usuário criado', userId: user.id });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username e senha são obrigatórios' });
    }
    const user = await authService.loginUser(username, password);
    req.session.userId = user.id;
    req.session.username = user.username;
    res.json({ message: 'Login realizado', user: { id: user.id, username: user.username } });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  req.session.destroy();
  res.json({ message: 'Logout realizado' });
}

export async function me(req, res, next) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Não autenticado' });
    }
    const user = await authService.getUserById(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }
    res.json({ id: user.id, username: user.username });
  } catch (err) {
    next(err);
  }
}
EOFCTRL

cat > src/controllers/contactController.js << 'EOFCTRL'
import * as contactService from '../services/contactService.js';

export async function list(req, res, next) {
  try {
    const contacts = await contactService.getContactsByUser(req.session.userId);
    res.json(contacts);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const contact = await contactService.createContact(req.session.userId, req.body);
    res.status(201).json(contact);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const contact = await contactService.updateContact(req.session.userId, req.params.id, req.body);
    res.json(contact);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await contactService.deleteContact(req.session.userId, req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
EOFCTRL

cat > src/controllers/eventController.js << 'EOFCTRL'
import * as eventService from '../services/eventService.js';

export async function list(req, res, next) {
  try {
    const events = await eventService.getEventsByUser(req.session.userId, req.query);
    res.json(events);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const event = await eventService.createEvent(req.session.userId, req.body);
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const event = await eventService.updateEvent(req.session.userId, req.params.id, req.body);
    res.json(event);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await eventService.deleteEvent(req.session.userId, req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getContacts(req, res, next) {
  try {
    const contacts = await eventService.getEventContacts(req.params.id, req.session.userId);
    res.json(contacts);
  } catch (err) {
    next(err);
  }
}
EOFCTRL

echo "   ✅ src/controllers/"

# -----------------------------------------------------------------------------
# 7. ROTAS
# -----------------------------------------------------------------------------
echo "📦 7. Criando rotas..."

cat > src/routes/auth.js << 'EOFRT'
import express from 'express';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.me);

export default router;
EOFRT

cat > src/routes/contacts.js << 'EOFRT'
import express from 'express';
import * as contactController from '../controllers/contactController.js';

const router = express.Router();

router.get('/', contactController.list);
router.post('/', contactController.create);
router.put('/:id', contactController.update);
router.delete('/:id', contactController.remove);

export default router;
EOFRT

cat > src/routes/events.js << 'EOFRT'
import express from 'express';
import * as eventController from '../controllers/eventController.js';

const router = express.Router();

router.get('/', eventController.list);
router.post('/', eventController.create);
router.put('/:id', eventController.update);
router.delete('/:id', eventController.remove);
router.get('/:id/contacts', eventController.getContacts);

export default router;
EOFRT

echo "   ✅ src/routes/"

# -----------------------------------------------------------------------------
# 8. APP.JS ATUALIZADO
# -----------------------------------------------------------------------------
echo "📦 8. Atualizando app.js..."

cat > src/app.js << 'EOFAPP'
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import { initDatabase, db } from './db/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requireAuth } from './middleware/requireAuth.js';
import authRoutes from './routes/auth.js';
import contactRoutes from './routes/contacts.js';
import eventRoutes from './routes/events.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3101;

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

// Inicializar banco e subir servidor
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

export default app;
EOFAPP

echo "   ✅ src/app.js"

# -----------------------------------------------------------------------------
# 9. TESTES AUTOMATIZADOS
# -----------------------------------------------------------------------------
echo "📦 9. Criando testes..."

cat > test/events.test.js << 'EOFTEST'
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Events API', () => {
  let sessionCookie;
  let userId;
  let eventId;
  let contactId;

  beforeAll(async () => {
    // Registrar usuário de teste
    await request(app).post('/auth/register').send({ username: 'testuser', password: '123456' });

    // Login
    const loginRes = await request(app).post('/auth/login').send({ username: 'testuser', password: '123456' });
    sessionCookie = loginRes.headers['set-cookie'];
    userId = loginRes.body.user.id;

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

  it('deve rejeitar evento de outro usuário', async () => {
    // Criar outro usuário
    await request(app).post('/auth/register').send({ username: 'outro', password: '123456' });
    const loginRes = await request(app).post('/auth/login').send({ username: 'outro', password: '123456' });
    const otherCookie = loginRes.headers['set-cookie'];

    // Tentar deletar evento do primeiro usuário
    const res = await request(app)
      .delete(`/api/events/${eventId}`)
      .set('Cookie', otherCookie);
    expect(res.status).toBe(404); // ou 404/403 dependendo da implementação
  });
});
EOFTEST

echo "   ✅ test/events.test.js"

# -----------------------------------------------------------------------------
# 10. CONFIG VITEST
# -----------------------------------------------------------------------------
echo "📦 10. Criando config do Vitest..."

cat > vitest.config.js << 'EOFCFG'
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [],
  },
});
EOFCFG

echo "   ✅ vitest.config.js"

# -----------------------------------------------------------------------------
# 11. RESUMO
# -----------------------------------------------------------------------------
echo ""
echo "==============================="
echo "✅ FASE 1 CONCLUÍDA!"
echo "==============================="
echo ""
echo "Arquivos criados:"
find src -type f | sort
echo ""
echo "Testes:"
ls -la test/
echo ""
echo "Próximos passos:"
echo "  1. cd ~/Sites/github/01-PI-planner/unified-platform/back"
echo "  2. npm run dev                          # Subir backend"
echo "  3. (outro terminal) npm test            # Rodar testes"
echo "  4. Testar com Postman/Insomnia:"
echo "     POST http://localhost:3101/auth/register"
echo "     POST http://localhost:3101/auth/login"
echo "     POST http://localhost:3101/api/events (com cookie)"
echo "  5. git add . && git commit -m 'fase-1: backend unificado com auth, contacts e events'"
echo "  6. git push origin main"
