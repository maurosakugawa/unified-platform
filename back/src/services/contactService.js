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
