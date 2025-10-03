const { expect } = require('chai');
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../server');
const User = require('../src/models/User');

describe('Advanced Authentication Tests', () => {
    let testUser;
    let authToken;

    before(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI);
        }

        await User.deleteMany({ email: 'advauth@example.com' });

        testUser = await User.create({
            name: 'Advanced Test User',
            email: 'advauth@example.com',
            password: 'password123'
        });

        authToken = testUser.getSignedJwtToken();
    });

    after(async () => {
        await User.deleteMany({ email: 'advauth@example.com' });
    });

    describe('GET /api/auth/me', () => {
        it('should get current user profile', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.user).to.have.property('email', 'advauth@example.com');
            expect(res.body.user).to.not.have.property('password');
        });

        it('should fail without token', async () => {
            const res = await request(app)
                .get('/api/auth/me');

            expect(res.status).to.equal(401);
            expect(res.body.success).to.be.false;
        });

        it('should fail with invalid token', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalidtoken123');

            expect(res.status).to.equal(401);
            expect(res.body.success).to.be.false;
        });

        it('should fail with expired token', async () => {
            const expiredToken = jwt.sign(
                { id: testUser._id },
                process.env.JWT_SECRET,
                { expiresIn: '0s' }
            );

            // Wait a moment to ensure expiration
            await new Promise(resolve => setTimeout(resolve, 100));

            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${expiredToken}`);

            expect(res.status).to.equal(401);
        });
    });

    describe('PUT /api/auth/profile', () => {
        it('should update user profile name', async () => {
            const res = await request(app)
                .put('/api/auth/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ name: 'Updated Name' });

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.user.name).to.equal('Updated Name');
        });

        it('should update user avatar', async () => {
            const res = await request(app)
                .put('/api/auth/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ avatar: 'https://example.com/avatar.jpg' });

            expect(res.status).to.equal(200);
            expect(res.body.user.avatar).to.equal('https://example.com/avatar.jpg');
        });

        it('should fail without authentication', async () => {
            const res = await request(app)
                .put('/api/auth/profile')
                .send({ name: 'Should Fail' });

            expect(res.status).to.equal(401);
        });
    });

    describe('POST /api/auth/logout', () => {
        it('should logout user successfully', async () => {
            const res = await request(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.message).to.include('Logged out');
        });

        it('should require authentication for logout', async () => {
            const res = await request(app)
                .post('/api/auth/logout');

            expect(res.status).to.equal(401);
        });
    });

    describe('JWT Edge Cases', () => {
        it('should reject token with invalid format', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'InvalidFormat token123');

            expect(res.status).to.equal(401);
        });

        it('should reject token without Bearer prefix', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', authToken);

            expect(res.status).to.equal(401);
        });

        it('should reject token for deleted user', async () => {
            const tempUser = await User.create({
                name: 'Temp User',
                email: 'temp@example.com',
                password: 'password123'
            });

            const tempToken = tempUser.getSignedJwtToken();
            await User.findByIdAndDelete(tempUser._id);

            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${tempToken}`);

            expect(res.status).to.equal(401);
        });
    });
});