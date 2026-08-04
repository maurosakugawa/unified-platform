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
