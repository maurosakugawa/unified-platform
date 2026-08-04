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
