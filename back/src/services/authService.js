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
