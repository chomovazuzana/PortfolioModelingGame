import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';

// Tests run with DISABLE_LOGIN=true set in test environment
process.env.DISABLE_LOGIN = 'true';

const app = createApp();

describe('Auth routes (dev bypass)', () => {
  it('GET /api/auth/session returns mock user when DISABLE_LOGIN=true', async () => {
    const res = await request(app).get('/api/auth/session');
    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.id).toBe('00000000-0000-0000-0000-000000000001');
    expect(res.body.user.email).toBe('dev@example.com');
    expect(res.body.user.role).toBe('admin');
  });

  it('GET /api/auth/login returns dev mode message when DISABLE_LOGIN=true', async () => {
    const res = await request(app).get('/api/auth/login');
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('disabled');
  });

  it('GET /api/auth/logout returns success', async () => {
    const res = await request(app).get('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('Auth middleware injects mock user on protected routes', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
  });
});
