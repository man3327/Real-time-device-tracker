const request = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../app');
const testEmail = `testuser_${Date.now()}@example.com`;
describe('Auth routes', () => {
  afterAll(async () => {
    await mongoose.connection.close();
    server.close();
  });
  it('registers a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: `user_${Date.now()}`, email: testEmail, password: 'testpass123' });
    expect(res.statusCode).toBe(201);
  });
  it('rejects registration with missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'incomplete@example.com' }); // missing username/password
    expect(res.statusCode).toBe(400);
  });
  it('logs in with correct credentials and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'testpass123' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });
  it('rejects login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'wrongpassword' });
    expect(res.statusCode).toBe(401);
  });
  it('rejects access to a protected route without a token', async () => {
    const res = await request(app).get('/api/groups/mine');
    expect(res.statusCode).toBe(401);
  });
});