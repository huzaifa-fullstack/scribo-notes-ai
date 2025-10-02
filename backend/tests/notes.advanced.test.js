const { expect } = require('chai');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../src/models/User');
const Note = require('../src/models/Note');

describe('Advanced Notes Tests', () => {
    let user1, user2;
    let token1, token2;
    let noteId;

    before(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI);
        }

        await User.deleteMany({ email: { $in: ['advnote1@example.com', 'advnote2@example.com'] } });
        await Note.deleteMany({});

        user1 = await User.create({
            name: 'User One',
            email: 'advnote1@example.com',
            password: 'password123'
        });

        user2 = await User.create({
            name: 'User Two',
            email: 'advnote2@example.com',
            password: 'password123'
        });

        token1 = user1.getSignedJwtToken();
        token2 = user2.getSignedJwtToken();

        // Create a test note
        const note = await Note.create({
            title: 'Test Note',
            content: 'Test Content',
            user: user1._id
        });
        noteId = note._id;
    });

    after(async () => {
        await User.deleteMany({ email: { $in: ['advnote1@example.com', 'advnote2@example.com'] } });
        await Note.deleteMany({});
    });

    describe('GET /api/notes/:id', () => {
        it('should get single note by owner', async () => {
            const res = await request(app)
                .get(`/api/notes/${noteId}`)
                .set('Authorization', `Bearer ${token1}`);

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.data).to.have.property('title', 'Test Note');
        });

        it('should fail for unauthorized user', async () => {
            const res = await request(app)
                .get(`/api/notes/${noteId}`)
                .set('Authorization', `Bearer ${token2}`);

            expect(res.status).to.equal(403);
        });

        it('should handle invalid note ID', async () => {
            const res = await request(app)
                .get('/api/notes/invalid-id')
                .set('Authorization', `Bearer ${token1}`);

            expect(res.status).to.equal(404);
        });

        it('should handle non-existent note', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .get(`/api/notes/${fakeId}`)
                .set('Authorization', `Bearer ${token1}`);

            expect(res.status).to.equal(404);
        });
    });

    describe('PUT /api/notes/:id/pin', () => {
        it('should pin a note', async () => {
            const res = await request(app)
                .put(`/api/notes/${noteId}/pin`)
                .set('Authorization', `Bearer ${token1}`);

            expect(res.status).to.equal(200);
            expect(res.body.data.isPinned).to.be.true;
        });

        it('should unpin a note', async () => {
            const res = await request(app)
                .put(`/api/notes/${noteId}/pin`)
                .set('Authorization', `Bearer ${token1}`);

            expect(res.status).to.equal(200);
            expect(res.body.data.isPinned).to.be.false;
        });

        it('should fail for unauthorized user', async () => {
            const res = await request(app)
                .put(`/api/notes/${noteId}/pin`)
                .set('Authorization', `Bearer ${token2}`);

            expect(res.status).to.equal(403);
        });
    });

    describe('PUT /api/notes/:id/archive', () => {
        it('should archive a note', async () => {
            const res = await request(app)
                .put(`/api/notes/${noteId}/archive`)
                .set('Authorization', `Bearer ${token1}`);

            expect(res.status).to.equal(200);
            expect(res.body.data.isArchived).to.be.true;
        });

        it('should unarchive a note', async () => {
            const res = await request(app)
                .put(`/api/notes/${noteId}/archive`)
                .set('Authorization', `Bearer ${token1}`);

            expect(res.status).to.equal(200);
            expect(res.body.data.isArchived).to.be.false;
        });
    });

    describe('Note Sharing', () => {
        it('should share note with another user', async () => {
            const res = await request(app)
                .post(`/api/notes/${noteId}/share`)
                .set('Authorization', `Bearer ${token1}`)
                .send({
                    email: 'advnote2@example.com',
                    permission: 'read'
                });

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });

        it('should allow shared user to view note', async () => {
            const res = await request(app)
                .get(`/api/notes/${noteId}`)
                .set('Authorization', `Bearer ${token2}`);

            expect(res.status).to.equal(200);
        });

        it('should prevent sharing with non-existent user', async () => {
            const res = await request(app)
                .post(`/api/notes/${noteId}/share`)
                .set('Authorization', `Bearer ${token1}`)
                .send({
                    email: 'nonexistent@example.com',
                    permission: 'read'
                });

            expect(res.status).to.equal(404);
        });

        it('should prevent sharing with self', async () => {
            const res = await request(app)
                .post(`/api/notes/${noteId}/share`)
                .set('Authorization', `Bearer ${token1}`)
                .send({
                    email: 'advnote1@example.com',
                    permission: 'read'
                });

            expect(res.status).to.equal(400);
        });

        it('should only allow owner to share', async () => {
            const res = await request(app)
                .post(`/api/notes/${noteId}/share`)
                .set('Authorization', `Bearer ${token2}`)
                .send({
                    email: 'someone@example.com',
                    permission: 'read'
                });

            expect(res.status).to.equal(403);
        });

        it('should unshare note', async () => {
            const res = await request(app)
                .delete(`/api/notes/${noteId}/share/${user2._id}`)
                .set('Authorization', `Bearer ${token1}`);

            expect(res.status).to.equal(200);
        });
    });

    describe('GET /api/notes/stats', () => {
        before(async () => {
            // Create more notes for stats testing
            await Note.create([
                { title: 'Note 2', content: 'Content 2', user: user1._id, isPinned: true },
                { title: 'Note 3', content: 'Content 3', user: user1._id, isArchived: true },
                { title: 'Note 4', content: 'Content 4', user: user1._id }
            ]);
        });

        it('should get user note statistics', async () => {
            const res = await request(app)
                .get('/api/notes/stats')
                .set('Authorization', `Bearer ${token1}`);

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.data).to.have.property('totalNotes');
            expect(res.body.data).to.have.property('pinnedNotes');
            expect(res.body.data).to.have.property('archivedNotes');
            expect(res.body.data.totalNotes).to.be.at.least(4);
        });
    });

    describe('Query Parameters and Filtering', () => {
        before(async () => {
            await Note.deleteMany({ user: user1._id });
            await Note.create([
                { title: 'Work Note', content: 'Work content', user: user1._id, tags: ['work'], category: 'Work' },
                { title: 'Personal Note', content: 'Personal content', user: user1._id, tags: ['personal'], category: 'Personal' },
                { title: 'Archived Note', content: 'Archived', user: user1._id, isArchived: true },
                { title: 'Pinned Note', content: 'Pinned', user: user1._id, isPinned: true }
            ]);
        });

        it('should search notes by title', async () => {
            const res = await request(app)
                .get('/api/notes?search=Work')
                .set('Authorization', `Bearer ${token1}`);

            expect(res.status).to.equal(200);
            expect(res.body.data.some(note => note.title.includes('Work'))).to.be.true;
        });

        it('should filter by category', async () => {
            const res = await request(app)
                .get('/api/notes?category=Work')
                .set('Authorization', `Bearer ${token1}`);

            expect(res.status).to.equal(200);
            expect(res.body.data.every(note => note.category === 'Work')).to.be.true;
        });

        it('should filter by tags', async () => {
            const res = await request(app)
                .get('/api/notes?tags=work')
                .set('Authorization', `Bearer ${token1}`);

            expect(res.status).to.equal(200);
            expect(res.body.data.some(note => note.tags.includes('work'))).to.be.true;
        });

        it('should filter pinned notes', async () => {
            const res = await request(app)
                .get('/api/notes?pinned=true')
                .set('Authorization', `Bearer ${token1}`);

            expect(res.status).to.equal(200);
            expect(res.body.data.every(note => note.isPinned === true)).to.be.true;
        });

        it('should filter archived notes', async () => {
            const res = await request(app)
                .get('/api/notes?archived=true')
                .set('Authorization', `Bearer ${token1}`);

            expect(res.status).to.equal(200);
            expect(res.body.data.some(note => note.isArchived === true)).to.be.true;
        });

        it('should support pagination', async () => {
            const res = await request(app)
                .get('/api/notes?page=1&limit=2')
                .set('Authorization', `Bearer ${token1}`);

            expect(res.status).to.equal(200);
            expect(res.body.data.length).to.be.at.most(2);
            expect(res.body).to.have.property('pages');
        });
    });
});