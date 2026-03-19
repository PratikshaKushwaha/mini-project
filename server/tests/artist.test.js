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

describe('Artist Profile', () => {
    beforeEach(async () => {
        await clearDBForTesting();

        const artistRes = await request(app).post('/api/v1/auth/register').send({
            email: 'artist@example.com', password: 'password123', username: 'artisttest', role: 'artist'
        });
        artistId = artistRes.body.data.user._id;

        const loginRes = await request(app).post('/api/v1/auth/login').send({
            identifier: 'artisttest', password: 'password123'
        });
        artistToken = loginRes.body.data.accessToken;
    });

    it('should update artist profile', async () => {
        const res = await request(app)
            .post('/api/v1/artists/profile')
            .set('Authorization', `Bearer ${artistToken}`)
            .send({ bio: 'Test bio', location: 'Remote', categories: ['Digital Art'] });

        expect(res.statusCode).toBe(200);
        expect(res.body.data).toHaveProperty('bio', 'Test bio');
        expect(res.body.data.categories).toContain('Digital Art');
    });

    it('should fetch artist profile by artistId', async () => {
        await request(app).post('/api/v1/artists/profile')
            .set('Authorization', `Bearer ${artistToken}`)
            .send({ bio: 'Public bio' });

        const res = await request(app).get(`/api/v1/artists/${artistId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.data).toHaveProperty('bio', 'Public bio');
    });

    it('should browse artists with pagination', async () => {
        const res = await request(app).get('/api/v1/artists?page=1&limit=10');
        expect(res.statusCode).toBe(200);
        expect(res.body.data).toHaveProperty('profiles');
        expect(Array.isArray(res.body.data.profiles)).toBe(true);
    });

    it('should reject profile update for non-artist', async () => {
        const clientRes = await request(app).post('/api/v1/auth/register').send({
            email: 'client@example.com', password: 'password123', username: 'clienttest', role: 'client'
        });
        const clientLogin = await request(app).post('/api/v1/auth/login').send({
            identifier: 'clienttest', password: 'password123'
        });

        const res = await request(app)
            .post('/api/v1/artists/profile')
            .set('Authorization', `Bearer ${clientLogin.body.data.accessToken}`)
            .send({ bio: 'Hacking' });
        expect(res.statusCode).toBe(403);
    });
});
