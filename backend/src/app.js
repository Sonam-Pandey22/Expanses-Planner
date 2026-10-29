import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { randomBytes } from 'node:crypto';
import { User, Transaction, Budget, Goal } from './models.js';
import { transactionInput, budgetInput, goalInput, registerInput, loginInput } from './validation.js';

export function createApp(secret = process.env.JWT_SECRET) {
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET must contain at least 32 characters');
    secret = randomBytes(48).toString('hex');
  }
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(express.json({ limit: '32kb' }));
  app.use('/api', rateLimit({ windowMs: 60000, limit: 200, standardHeaders: 'draft-8', legacyHeaders: false }));
  // SameSite cookies and JSON-only mutation requests prevent cross-site form writes.
  app.use('/api', (req, res, next) => {
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && !req.is('application/json')) return res.status(415).json({ error: 'Use application/json' });
    if (req.get('sec-fetch-site') === 'cross-site' && req.method !== 'GET') return res.status(403).json({ error: 'Cross-site writes are not allowed' });
    next();
  });
  const validate = schema => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.issues[0].message });
    req.input = result.data;
    next();
  };
  const cookieOptions = { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 7 * 86400000 };
  const sendSession = (res, user, status = 200) => {
    const token = jwt.sign({ sub: String(user._id) }, secret, { expiresIn: '7d', algorithm: 'HS256' });
    res.cookie('expanse_session', token, cookieOptions).status(status).json({ user: { id: user._id, name: user.name, email: user.email } });
  };
  const auth = (req, res, next) => {
    const token = (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith('expanse_session='))?.slice(16);
    try {
      const payload = jwt.verify(token || '', secret, { algorithms: ['HS256'] });
      if (!mongoose.isValidObjectId(payload.sub)) throw new Error('Invalid user');
      req.userId = payload.sub;
      next();
    } catch { res.status(401).json({ error: 'Please sign in to continue' }); }
  };
  const authLimit = rateLimit({ windowMs: 15 * 60000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false });
  app.get('/api/health', (_req, res) => res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({ status: mongoose.connection.readyState === 1 ? 'ok' : 'database unavailable' }));
  app.post('/api/auth/register', authLimit, validate(registerInput), async (req, res) => {
    const { name, email, password } = req.input;
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 12) });
    sendSession(res, user, 201);
  });
  app.post('/api/auth/login', authLimit, validate(loginInput), async (req, res) => {
    const user = await User.findOne({ email: req.input.email }).select('+password');
    if (!user || !await bcrypt.compare(req.input.password, user.password)) return res.status(401).json({ error: 'Email or password is incorrect' });
    sendSession(res, user);
  });
  app.post('/api/auth/logout', (_req, res) => res.clearCookie('expanse_session', { ...cookieOptions, maxAge: undefined }).json({ ok: true }));
  app.get('/api/auth/me', auth, async (req, res) => {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ error: 'Account no longer exists' });
    res.json({ user: { id: user._id, name: user.name, email: user.email } });
  });
  app.get('/api/workspace', auth, async (req, res) => {
    const filter = { user: req.userId };
    const [transactions, budgets, goals] = await Promise.all([
      Transaction.find(filter).sort({ date: -1, createdAt: -1 }).lean(), Budget.find(filter).lean(), Goal.find(filter).lean(),
    ]);
    res.json({ transactions, budgets, goals });
  });
  for (const [path, Model, schema] of [['transactions', Transaction, transactionInput], ['budgets', Budget, budgetInput], ['goals', Goal, goalInput]]) {
    app.post(`/api/${path}`, auth, validate(schema), async (req, res) => {
      const record = await Model.create({ ...req.input, user: req.userId });
      res.status(201).json(record);
    });
    app.put(`/api/${path}/:id`, auth, validate(schema), async (req, res) => {
      if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid record ID' });
      const record = await Model.findOneAndUpdate({ _id: req.params.id, user: req.userId }, { $set: req.input }, { new: true, runValidators: true });
      if (!record) return res.status(404).json({ error: 'Record not found' });
      res.json(record);
    });
    app.delete(`/api/${path}/:id`, auth, async (req, res) => {
      if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid record ID' });
      const record = await Model.findOneAndDelete({ _id: req.params.id, user: req.userId });
      if (!record) return res.status(404).json({ error: 'Record not found' });
      res.json({ ok: true });
    });
  }
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Endpoint not found' }));
  app.use((err, _req, res, _next) => {
    if (err.code === 11000) return res.status(409).json({ error: err.keyPattern?.email ? 'An account with this email already exists' : 'A budget for this category and month already exists' });
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON' });
    if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Request is too large' });
    console.error(err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  });
  return app;
}
