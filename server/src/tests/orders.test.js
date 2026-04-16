import request from 'supertest';
import app from '../app.js';
import { connectDBForTesting, disconnectDBForTesting, clearDBForTesting } from './setup.testdb.js';

let artistToken, clientToken, artistId, clientId;

beforeAll(async () => {
    process.env.ACCESS_TOKEN_SECRET = 'test_access_secret';
    process.env.ACCESS_TOKEN_EXPIRY = '1h';
    process.env.REFRESH_TOKEN_SECRET = 'test_refresh_secret';
    process.env.REFRESH_TOKEN_EXPIRY = '1d';
    await connectDBForTesting();
});

afterAll(async () => { await disconnectDBForTesting(); });

const setupUsers = async () => {
    await clearDBForTesting();

    const artistReg = await request(app).post('/api/v1/auth/register').send({
        email: 'artist@test.com', password: 'Password123!', username: 'artisttest', role: 'artist'
    });
    artistId = artistReg.body.data.user._id;
    const artistLogin = await request(app).post('/api/v1/auth/login').send({
        identifier: 'artisttest', password: 'Password123!'
    });
    artistToken = artistLogin.body.data.accessToken;

    const clientReg = await request(app).post('/api/v1/auth/register').send({
        email: 'client@test.com', password: 'Password123!', username: 'clienttest', role: 'client'
    });
    clientId = clientReg.body.data.user._id;
    const clientLogin = await request(app).post('/api/v1/auth/login').send({
        identifier: 'clienttest', password: 'Password123!'
    });
    clientToken = clientLogin.body.data.accessToken;
};

describe('Orders – Custom Flow', () => {
    let orderId;

    beforeEach(async () => {
        await setupUsers();

        const res = await request(app)
            .post('/api/v1/orders')
            .set('Authorization', `Bearer ${clientToken}`)
            .send({
                artistId,
                title: 'Test Commission',
                description: 'Please paint a sunset',
                orderType: 'custom'
            });
        expect(res.statusCode).toBe(201);
        orderId = res.body.data._id;
    });

    it('created order should have status pending', async () => {
        const res = await request(app)
            .get(`/api/v1/orders/${orderId}`)
            .set('Authorization', `Bearer ${clientToken}`);
        expect(res.body.data.status).toBe('pending');
    });

    it('artist can set price → status becomes price_quoted', async () => {
        const res = await request(app)
            .patch(`/api/v1/orders/${orderId}/price`)
            .set('Authorization', `Bearer ${artistToken}`)
            .send({ price: 1500 });
        expect(res.statusCode).toBe(200);
        expect(res.body.data.status).toBe('price_quoted');
        expect(res.body.data.price).toBe(1500);
    });

    it('client can confirm price → status becomes accepted', async () => {
        await request(app)
            .patch(`/api/v1/orders/${orderId}/price`)
            .set('Authorization', `Bearer ${artistToken}`)
            .send({ price: 1500 });

        const res = await request(app)
            .patch(`/api/v1/orders/${orderId}/status`)
            .set('Authorization', `Bearer ${clientToken}`)
            .send({ status: 'accepted' });
        expect(res.statusCode).toBe(200);
        expect(res.body.data.status).toBe('accepted');
    });

    it('should reject invalid status transition', async () => {
        // Pending → completed is invalid
        const res = await request(app)
            .patch(`/api/v1/orders/${orderId}/status`)
            .set('Authorization', `Bearer ${artistToken}`)
            .send({ status: 'completed' });
        expect(res.statusCode).toBe(400);
    });

    it('client cannot update status to in_progress', async () => {
        await request(app)
            .patch(`/api/v1/orders/${orderId}/price`)
            .set('Authorization', `Bearer ${artistToken}`)
            .send({ price: 500 });
        await request(app)
            .patch(`/api/v1/orders/${orderId}/status`)
            .set('Authorization', `Bearer ${clientToken}`)
            .send({ status: 'accepted' });

        const res = await request(app)
            .patch(`/api/v1/orders/${orderId}/status`)
            .set('Authorization', `Bearer ${clientToken}`)
            .send({ status: 'in_progress' });
        expect(res.statusCode).toBe(403);
    });

    it('only participants can view order', async () => {
        const stranger = await request(app).post('/api/v1/auth/register').send({
            email: 'stranger@test.com', password: 'pass123', username: 'stranger1'
        });
        const strangerLogin = await request(app).post('/api/v1/auth/login').send({
            identifier: 'stranger1', password: 'pass123'
        });

        const res = await request(app)
            .get(`/api/v1/orders/${orderId}`)
            .set('Authorization', `Bearer ${strangerLogin.body.data.accessToken}`);
        expect(res.statusCode).toBe(403);
    });
});

describe('Orders – Unauthenticated', () => {
    it('should reject unauthenticated order list request', async () => {
        const res = await request(app).get('/api/v1/orders');
        expect(res.statusCode).toBe(401);
    });
});
