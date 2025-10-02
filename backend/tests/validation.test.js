const { expect } = require('chai');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../src/models/User');

describe('Input Validation and Edge Cases', () => {
    let authToken;
    let userId;

    before(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI);
        }

        await User.deleteMany({ email: 'validation@example.com' });

        const user = await User.create({
            name: 'Validation User',
            email: 'validation@example.com',
            password: 'password123'
        });

        userId = user._id;
        authToken = user.getSignedJwtToken();
    });

    after(async () => {
        await User.deleteMany({ email: 'validation@example.com' });
    });

    describe('Authentication Validation', () => {
        it('should reject registration with invalid email format', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test',
                    email: 'invalid-email',
                    password: 'password123'
                });

            expect(res.status).to.be.oneOf([400, 500]);
        });

        it('should reject registration with short password', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test',
                    email: 'test@example.com',
                    password: '123'
                });

            expect(res.status).to.be.oneOf([400, 500]);
        });

        it('should reject login with missing fields', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com' });

            expect(res.status).to.equal(400);
        });
    });

    describe('Notes Validation', () => {
        it('should reject note creation without title', async () => {
            const res = await request(app)
                .post('/api/notes')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ content: 'Content only' });

            expect(res.status).to.equal(400);
        });

        it('should reject note creation without content', async () => {
            const res = await request(app)
                .post('/api/notes')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ title: 'Title only' });

            expect(res.status).to.equal(400);
        });

        it('should handle very long title gracefully', async () => {
            const longTitle = 'a'.repeat(200);
            const res = await request(app)
                .post('/api/notes')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: longTitle,
                    content: 'Content'
                });

            expect(res.status).to.be.oneOf([400, 500]);
        });

        it('should handle empty tags array', async () => {
            const res = await request(app)
                .post('/api/notes')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Test',
                    content: 'Content',
                    tags: []
                });

            expect(res.status).to.equal(201);
        });
    });

    describe('MongoDB ObjectId Edge Cases', () => {
        it('should handle invalid ObjectId format for notes', async () => {
            const res = await request(app)
                .get('/api/notes/not-a-valid-id')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).to.equal(404);
        });

        it('should handle non-existent valid ObjectId', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .get(`/api/notes/${fakeId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).to.equal(404);
        });
    });

    describe('Error Handling', () => {
        it('should return 404 for undefined routes', async () => {
            const res = await request(app)
                .get('/api/nonexistent')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).to.equal(404);
        });

        it('should handle malformed JSON', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .set('Content-Type', 'application/json')
                .send('{"invalid json}');

            expect(res.status).to.be.oneOf([400, 500]);
        });
    });
});