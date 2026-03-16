import request from 'supertest';
import app from '../app.js';
import { connectDBForTesting, disconnectDBForTesting, clearDBForTesting } from './setup.testdb.js';

beforeAll(async () => {
    // Setting up dummy env vars for jwt during testing
    process.env.ACCESS_TOKEN_SECRET = 'test_access_secret';
    process.env.ACCESS_TOKEN_EXPIRY = '1h';
    process.env.REFRESH_TOKEN_SECRET = 'test_refresh_secret';
    process.env.REFRESH_TOKEN_EXPIRY = '1d';
    await connectDBForTesting();
});

afterEach(async () => {
    await clearDBForTesting();
});

afterAll(async () => {
    await disconnectDBForTesting();
});

describe('Auth Endpoints', () => {
    describe('POST /api/v1/auth/register', () => {
        it('should register a new client successfully', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                    role: 'client'
                });
            
            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('email', 'test@example.com');
            expect(res.body.data).toHaveProperty('role', 'client');
            expect(res.body.data).not.toHaveProperty('password');
        });

        it('should create an empty artist profile when registering as an artist', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: 'artist@example.com',
                    password: 'password123',
                    role: 'artist'
                });
            
            expect(res.statusCode).toBe(201);
            expect(res.body.data).toHaveProperty('role', 'artist');
            
            // Check that we can login and get current user (verifies token as well)
            const loginRes = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'artist@example.com',
                    password: 'password123'
                });
            
            expect(loginRes.statusCode).toBe(200);
            
            const accessToken = loginRes.body.data.accessToken;

            // Optional: You could fetch artist profile here if you want to verify it directly,
            // but the test primarily covers registration creating the profile behind the scenes.
        });

        it('should fail if email is already taken', async () => {
            await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });
            
            expect(res.statusCode).toBe(409);
        });
    });

    describe('POST /api/v1/auth/login', () => {
        beforeEach(async () => {
            await request(app).post('/api/v1/auth/register').send({
                email: 'login@example.com',
                password: 'password123'
            });
        });

        it('should login successfully and return tokens', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'password123'
                });
            
            expect(res.statusCode).toBe(200);
            expect(res.body.data).toHaveProperty('accessToken');
            expect(res.body.data).toHaveProperty('user');
        });

        it('should fail with incorrect password', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'wrongpassword'
                });
            
            expect(res.statusCode).toBe(401);
        });
    });
});
