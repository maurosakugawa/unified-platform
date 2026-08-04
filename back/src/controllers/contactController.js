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
