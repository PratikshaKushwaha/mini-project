import request from 'supertest';
import app from '../app.js';
import { connectDBForTesting, disconnectDBForTesting, clearDBForTesting } from './setup.testdb.js';

let artistAccessToken;
let artistId;

beforeAll(async () => {
    process.env.ACCESS_TOKEN_SECRET = 'test_access_secret';
    process.env.ACCESS_TOKEN_EXPIRY = '1h';
    await connectDBForTesting();
});

afterEach(async () => {
    // Usually clearDBForTesting, but in this suite we might want to keep the user between tests.
    // To be safe and isolated, let's clear and re-register in beforeEach
});

afterAll(async () => {
    await disconnectDBForTesting();
});

describe('Artist Profile Endpoints', () => {
    beforeEach(async () => {
        await clearDBForTesting();

        // Register new artist
        const res = await request(app)
            .post('/api/v1/auth/register')
            .send({
                email: 'profiletest@example.com',
                password: 'password123',
                role: 'artist'
            });
        artistId = res.body.data._id;

        // Login to get token
        const loginRes = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'profiletest@example.com',
                password: 'password123'
            });
        
        artistAccessToken = loginRes.body.data.accessToken;
    });

    it('should update artist profile', async () => {
        const res = await request(app)
            .post('/api/v1/artists/profile')
            .set('Authorization', `Bearer ${artistAccessToken}`)
            .send({
                bio: 'This is a test bio',
                location: 'Remote',
                categories: ['Digital Art']
            });
        
        expect(res.statusCode).toBe(200);
        expect(res.body.data).toHaveProperty('bio', 'This is a test bio');
        expect(res.body.data).toHaveProperty('location', 'Remote');
        expect(res.body.data.categories).toContain('Digital Art');
    });

    it('should fetch an artist profile by artistId', async () => {
        // First update the profile so it has data
        await request(app)
            .post('/api/v1/artists/profile')
            .set('Authorization', `Bearer ${artistAccessToken}`)
            .send({ bio: 'Fetched Bio' });

        const res = await request(app).get(`/api/v1/artists/${artistId}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.data).toHaveProperty('bio', 'Fetched Bio');
        expect(res.body.data.artistId).toHaveProperty('email', 'profiletest@example.com');
    });

    it('should browse artists', async () => {
        // First update the profile
        await request(app)
            .post('/api/v1/artists/profile')
            .set('Authorization', `Bearer ${artistAccessToken}`)
            .send({ location: 'TestCity' });

        const res = await request(app).get('/api/v1/artists');
        
        expect(res.statusCode).toBe(200);
        expect(res.body.data.profiles.length).toBeGreaterThan(0);
        expect(res.body.data.profiles[0]).toHaveProperty('location', 'TestCity');
    });
});
