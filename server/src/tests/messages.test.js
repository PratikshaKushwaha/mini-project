import request from 'supertest';
import app from '../app.js';
import { connectDBForTesting, disconnectDBForTesting, clearDBForTesting } from './setup.testdb.js';

beforeAll(async () => {
    process.env.ACCESS_TOKEN_SECRET = 'test_access_secret';
    process.env.ACCESS_TOKEN_EXPIRY = '1h';
    process.env.REFRESH_TOKEN_SECRET = 'test_refresh_secret';
    process.env.REFRESH_TOKEN_EXPIRY = '1d';
    await connectDBForTesting();
});

afterAll(async () => { await disconnectDBForTesting(); });

describe('Messages – Authorization Guard', () => {
    let artistToken, clientToken, orderId;

    beforeEach(async () => {
        await clearDBForTesting();

        const artistReg = await request(app).post('/api/v1/auth/register').send({
            email: 'artist@msg.com', password: 'pass123!', username: 'msgartist', role: 'artist'
        });
        const artistLogin = await request(app).post('/api/v1/auth/login').send({
            identifier: 'msgartist', password: 'pass123!'
        });
        artistToken = artistLogin.body.data.accessToken;
        const artistId = artistReg.body.data.user._id;

        await request(app).post('/api/v1/auth/register').send({
            email: 'client@msg.com', password: 'pass123!', username: 'msgclient', role: 'client'
        });
        const clientLogin = await request(app).post('/api/v1/auth/login').send({
            identifier: 'msgclient', password: 'pass123!'
        });
        clientToken = clientLogin.body.data.accessToken;

        const orderRes = await request(app)
            .post('/api/v1/orders')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
                artistId,
                title: 'Test Msg Order',
                description: 'Desc',
                orderType: 'custom'
            });
        orderId = orderRes.body.data._id;
    });

    it('client can send a text message to order', async () => {
        const res = await request(app)
            .post(`/api/v1/orders/${orderId}/messages`)
            .set('Authorization', `Bearer ${clientToken}`)
            .send({ message: 'Hello artist!' });
        expect(res.statusCode).toBe(201);
        expect(res.body.data).toHaveProperty('message', 'Hello artist!');
    });

    it('artist can reply with a text message', async () => {
        const res = await request(app)
            .post(`/api/v1/orders/${orderId}/messages`)
            .set('Authorization', `Bearer ${artistToken}`)
            .send({ message: 'Hello client!' });
        expect(res.statusCode).toBe(201);
    });

    it('should reject message without text and without image', async () => {
        const res = await request(app)
            .post(`/api/v1/orders/${orderId}/messages`)
            .set('Authorization', `Bearer ${clientToken}`)
            .send({});
        expect(res.statusCode).toBe(400);
    });

    it('unauthorized user cannot see messages', async () => {
        const strangerReg = await request(app).post('/api/v1/auth/register').send({
            email: 'str@msg.com', password: 'pass123!', username: 'msgstranger'
        });
        const strangerLogin = await request(app).post('/api/v1/auth/login').send({
            identifier: 'msgstranger', password: 'pass123!'
        });
        const res = await request(app)
            .get(`/api/v1/orders/${orderId}/messages`)
            .set('Authorization', `Bearer ${strangerLogin.body.data.accessToken}`);
        expect(res.statusCode).toBe(403);
    });
});
