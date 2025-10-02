const { expect } = require('chai');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../src/models/User');
const Note = require('../src/models/Note');

describe('Notes API Tests', () => {
    let authToken;
    let userId;
    let noteId;

    before(async () => {
        // Ensure we're connected to test database
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notes-app-test');
        }

        // Clean up existing data
        await User.deleteMany({ email: 'notetest@example.com' });
        await Note.deleteMany({});

        // Create test user and get token
        const user = await User.create({
            name: 'Note Test User',
            email: 'notetest@example.com',
            password: 'password123'
        });
        userId = user._id;
        authToken = user.getSignedJwtToken();
    });

    after(async () => {
        await User.deleteMany({ email: 'notetest@example.com' });
        await Note.deleteMany({ user: userId });
    });

    describe('POST /api/notes', () => {
        it('should create a new note', async () => {
            const res = await request(app)
                .post('/api/notes')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Test Note',
                    content: 'This is test content'
                });

            expect(res.status).to.equal(201);
            expect(res.body.data).to.have.property('title', 'Test Note');
            noteId = res.body.data._id;
        });

        it('should require authentication', async () => {
            const res = await request(app)
                .post('/api/notes')
                .send({
                    title: 'Test Note',
                    content: 'Content'
                });

            expect(res.status).to.equal(401);
        });
    });

    describe('GET /api/notes', () => {
        it('should get all user notes', async () => {
            const res = await request(app)
                .get('/api/notes')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');
            expect(res.body.data.length).to.be.at.least(1);
        });
    });

    describe('PUT /api/notes/:id', () => {
        it('should update a note', async () => {
            const res = await request(app)
                .put(`/api/notes/${noteId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Updated Title',
                    content: 'Updated content'
                });

            expect(res.status).to.equal(200);
            expect(res.body.data.title).to.equal('Updated Title');
        });
    });

    describe('DELETE /api/notes/:id', () => {
        it('should delete a note', async () => {
            const res = await request(app)
                .delete(`/api/notes/${noteId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).to.equal(200);
        });
    });
});