import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';
import { createApp } from '../src/app.js';
import { transactionInput, budgetInput, goalInput } from '../src/validation.js';
import { User, Transaction, Budget, Goal } from '../src/models.js';

const app = createApp('test-secret-with-more-than-32-characters');
test('transaction validation rejects invalid dates, negative amounts and unknown categories', () => {
  const valid = { title: 'Lunch', amount: 250.25, type: 'expense', category: 'Food & drinks', date: '2026-10-29' };
  assert.equal(transactionInput.safeParse(valid).success, true);
  for (const change of [{ amount: -1 }, { amount: 1.001 }, { date: '2026-02-30' }, { category: 'Unknown' }, { title: '   ' }]) assert.equal(transactionInput.safeParse({ ...valid, ...change }).success, false);
});
test('budgets reject invalid months, goals reject saved amounts beyond target', () => {
  assert.equal(budgetInput.safeParse({ category: 'Shopping', limit: 1000, month: '2026-13' }).success, false);
  assert.equal(goalInput.safeParse({ title: 'Trip', target: 1000, saved: 1100 }).success, false);
});
test('private endpoints require a valid session', async () => {
  await request(app).get('/api/workspace').expect(401);
  await request(app).get('/api/workspace').set('Cookie', 'expanse_session=forged').expect(401);
  await request(app).post('/api/transactions').send({}).expect(401);
});
test('JSON-only writes, cross-site protection, auth validation, and malformed JSON', async () => {
  await request(app).post('/api/auth/register').type('form').send({ name: 'Test' }).expect(415);
  await request(app).post('/api/auth/register').set('sec-fetch-site', 'cross-site').send({}).expect(403);
  await request(app).post('/api/auth/register').send({ name: 'Test', email: 'invalid', password: 'short' }).expect(400);
  await request(app).post('/api/auth/register').set('Content-Type', 'application/json').send('{bad json').expect(400);
});
test('MongoDB integration: sessions, CRUD, isolation and persistence', { skip: !process.env.TEST_MONGODB_URI }, async () => {
  await mongoose.connect(process.env.TEST_MONGODB_URI);
  await Promise.all([User.init(), Transaction.init(), Budget.init(), Goal.init()]);
  const first = request.agent(app), second = request.agent(app);
  const tag = randomUUID();
  const users = [];
  try {
    for (const [agent, name] of [[first, 'One'], [second, 'Two']]) {
      const registered = await agent.post('/api/auth/register').send({ name, email: `${name}-${tag}@example.com`, password: 'test-password-123' }).expect(201);
      users.push(registered.body.user.id);
      assert.match(registered.headers['set-cookie'][0], /HttpOnly/);
      assert.match(registered.headers['set-cookie'][0], /SameSite=Strict/);
    }
    await first.get('/api/auth/me').expect(200);
    await first.post('/api/auth/register').send({ name: 'One', email: `One-${tag}@example.com`, password: 'test-password-123' }).expect(409);
    const payload = { title: 'Lunch', amount: 250, type: 'expense', category: 'Food & drinks', date: '2026-10-29', note: 'Test record' };
    const created = await first.post('/api/transactions').send(payload).expect(201);
    const id = created.body._id;
    assert.equal((await second.get('/api/workspace').expect(200)).body.transactions.length, 0);
    await second.put(`/api/transactions/${id}`).send({ ...payload, amount: 1 }).expect(404);
    await second.delete(`/api/transactions/${id}`).expect(404);
    const updated = await first.put(`/api/transactions/${id}`).send({ ...payload, amount: 300 }).expect(200);
    assert.equal(updated.body.amount, 300);
    assert.equal((await Transaction.findById(id)).amount, 300);
    await first.put('/api/transactions/invalid-id').send(payload).expect(400);
    const budgetPayload = { category: 'Shopping', limit: 4000, month: '2026-10' };
    const budget = await first.post('/api/budgets').send(budgetPayload).expect(201);
    await first.post('/api/budgets').send(budgetPayload).expect(409);
    await second.put(`/api/budgets/${budget.body._id}`).send(budgetPayload).expect(404);
    await first.put(`/api/budgets/${budget.body._id}`).send({ ...budgetPayload, limit: 5000 }).expect(200);
    const goalPayload = { title: 'Trip', target: 5000, saved: 500 };
    const goal = await first.post('/api/goals').send(goalPayload).expect(201);
    await first.put(`/api/goals/${goal.body._id}`).send({ ...goalPayload, saved: 1000 }).expect(200);
    await second.delete(`/api/goals/${goal.body._id}`).expect(404);
    const stored = (await first.get('/api/workspace').expect(200)).body;
    assert.equal(stored.transactions[0].amount, 300);
    assert.equal(stored.budgets[0].limit, 5000);
    assert.equal(stored.goals[0].saved, 1000);
    await first.delete(`/api/transactions/${id}`).expect(200);
    await first.delete(`/api/budgets/${budget.body._id}`).expect(200);
    await first.delete(`/api/goals/${goal.body._id}`).expect(200);
    await first.post('/api/auth/logout').send({}).expect(200);
    await first.get('/api/workspace').expect(401);
    await first.post('/api/auth/login').send({ email: `One-${tag}@example.com`, password: 'wrong-password' }).expect(401);
    await first.post('/api/auth/login').send({ email: `One-${tag}@example.com`, password: 'test-password-123' }).expect(200);
    await first.get('/api/workspace').expect(200);
  } finally {
    await Promise.all([User.deleteMany({ _id: { $in: users } }), Transaction.deleteMany({ user: { $in: users } }), Budget.deleteMany({ user: { $in: users } }), Goal.deleteMany({ user: { $in: users } })]);
    await mongoose.disconnect();
  }
});
