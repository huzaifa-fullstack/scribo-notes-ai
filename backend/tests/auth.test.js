const { expect } = require('chai');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../src/models/User');

describe('Authentication Tests', () => {
    // Test user data
    const testUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
    };

    // Clean up before tests
    before(async () => {
        // Ensure we're connected to test database
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notes-app-test');
        }
        await User.deleteMany({ email: testUser.email });
    });

    // Clean up after tests
    after(async () => {
        await User.deleteMany({ email: testUser.email });
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(testUser);

            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('success', true);
            expect(res.body).to.have.property('token');
            expect(res.body.user).to.have.property('email', testUser.email);
        });

        it('should not register duplicate email', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send(testUser);

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property('success', false);
        });

        it('should validate required fields', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ email: 'test2@example.com' });

            expect(res.status).to.equal(400);
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login existing user', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('token');
        });

        it('should reject invalid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'wrongpassword'
                });

            expect(res.status).to.equal(401);
        });
    });
});