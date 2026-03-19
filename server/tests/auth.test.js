import request from 'supertest';
import app from '../app.js';
import { connectDBForTesting, disconnectDBForTesting, clearDBForTesting } from './setup.testdb.js';

beforeAll(async () => {
    process.env.ACCESS_TOKEN_SECRET = 'test_access_secret';
    process.env.ACCESS_TOKEN_EXPIRY = '1h';
    process.env.REFRESH_TOKEN_SECRET = 'test_refresh_secret';
    process.env.REFRESH_TOKEN_EXPIRY = '1d';
    process.env.ADMIN_EMAILS = 'admin@example.com';
    await connectDBForTesting();
});

afterEach(async () => { await clearDBForTesting(); });
afterAll(async () => { await disconnectDBForTesting(); });

describe('Auth – Register', () => {
    it('should register a new client with username', async () => {
        const res = await request(app).post('/api/v1/auth/register').send({
            email: 'test@example.com',
            password: 'password123',
            username: 'testuser',
            role: 'client'
        });
        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.user).toHaveProperty('email', 'test@example.com');
        expect(res.body.data.user).toHaveProperty('username', 'testuser');
        expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('should reject registration without username', async () => {
        const res = await request(app).post('/api/v1/auth/register').send({
            email: 'test@example.com',
            password: 'password123'
        });
        expect(res.statusCode).toBe(400);
    });

    it('should reject invalid username format', async () => {
        const res = await request(app).post('/api/v1/auth/register').send({
            email: 'test@example.com',
            password: 'password123',
            username: 'ab' // too short
        });
        expect(res.statusCode).toBe(400);
    });

    it('should create artist profile when registering as artist', async () => {
        const res = await request(app).post('/api/v1/auth/register').send({
            email: 'artist@example.com',
            password: 'password123',
            username: 'artistuser',
            role: 'artist'
        });
        expect(res.statusCode).toBe(201);
        expect(res.body.data.user).toHaveProperty('role', 'artist');
    });

    it('should reject duplicate email', async () => {
        await request(app).post('/api/v1/auth/register').send({
            email: 'dup@example.com', password: 'pass123', username: 'user1'
        });
        const res = await request(app).post('/api/v1/auth/register').send({
            email: 'dup@example.com', password: 'pass123', username: 'user2'
        });
        expect(res.statusCode).toBe(409);
    });

    it('should reject duplicate username', async () => {
        await request(app).post('/api/v1/auth/register').send({
            email: 'a@example.com', password: 'pass123', username: 'sameuser'
        });
        const res = await request(app).post('/api/v1/auth/register').send({
            email: 'b@example.com', password: 'pass123', username: 'sameuser'
        });
        expect(res.statusCode).toBe(409);
    });
});

describe('Auth – Login', () => {
    beforeEach(async () => {
        await request(app).post('/api/v1/auth/register').send({
            email: 'login@example.com', password: 'password123', username: 'loginuser'
        });
    });

    it('should login by email successfully', async () => {
        const res = await request(app).post('/api/v1/auth/login').send({
            identifier: 'login@example.com', password: 'password123'
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.data).toHaveProperty('accessToken');
        expect(res.body.data).toHaveProperty('user');
    });

    it('should login by username successfully', async () => {
        const res = await request(app).post('/api/v1/auth/login').send({
            identifier: 'loginuser', password: 'password123'
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.data).toHaveProperty('accessToken');
    });

    it('should fail with wrong password', async () => {
        const res = await request(app).post('/api/v1/auth/login').send({
            identifier: 'login@example.com', password: 'wrongpassword'
        });
        expect(res.statusCode).toBe(401);
    });

    it('should fail with non-existent user', async () => {
        const res = await request(app).post('/api/v1/auth/login').send({
            identifier: 'nobody@example.com', password: 'password123'
        });
        expect(res.statusCode).toBe(401);
    });
});
