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
