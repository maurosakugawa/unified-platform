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
