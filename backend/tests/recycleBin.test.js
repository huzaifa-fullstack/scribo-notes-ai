const request = require('supertest');
const app = require('../server');
const Note = require('../src/models/Note');
const User = require('../src/models/User');
const { cleanupRecycleBin, RECYCLE_BIN_RETENTION_DAYS } = require('../src/utils/recycleBinCleanup');

describe('Recycle Bin API Tests', () => {
    let authToken;
    let userId;
    let noteId;

    beforeAll(async () => {
        // Create test user
        const user = await User.create({
            name: 'Test User',
            email: 'recycleBinTest@test.com',
            password: 'Test123!@#',
            isEmailVerified: true
        });
        userId = user._id;

        // Login to get token
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'recycleBinTest@test.com',
                password: 'Test123!@#'
            });

        authToken = loginRes.body.data.token;
    });

    afterAll(async () => {
        // Cleanup test data
        await Note.deleteMany({ user: userId });
        await User.findByIdAndDelete(userId);
    });

    describe('POST /api/notes - Create note for testing', () => {
        it('should create a new note', async () => {
            const res = await request(app)
                .post('/api/notes')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Test Note for Recycle Bin',
                    content: 'This note will be deleted and restored'
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('_id');
            noteId = res.body.data._id;
        });
    });

    describe('DELETE /api/notes/:id - Soft delete (move to recycle bin)', () => {
        it('should soft delete a note', async () => {
            const res = await request(app)
                .delete(`/api/notes/${noteId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toContain('recycle bin');
            expect(res.body.data.isDeleted).toBe(true);
            expect(res.body.data.deletedAt).toBeDefined();
        });

        it('should not show deleted note in regular notes list', async () => {
            const res = await request(app)
                .get('/api/notes')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            const deletedNote = res.body.data.find(note => note._id === noteId);
            expect(deletedNote).toBeUndefined();
        });

        it('should return 404 for non-existent note', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const res = await request(app)
                .delete(`/api/notes/${fakeId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it('should not allow deleting another user\'s note', async () => {
            // Create another user
            const otherUser = await User.create({
                name: 'Other User',
                email: 'otheruser@test.com',
                password: 'Test123!@#',
                isEmailVerified: true
            });

            // Create note for other user
            const otherNote = await Note.create({
                title: 'Other User Note',
                content: 'This belongs to another user',
                user: otherUser._id
            });

            const res = await request(app)
                .delete(`/api/notes/${otherNote._id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);

            // Cleanup
            await Note.findByIdAndDelete(otherNote._id);
            await User.findByIdAndDelete(otherUser._id);
        });
    });

    describe('GET /api/notes/recycle-bin - Get deleted notes', () => {
        it('should retrieve deleted notes', async () => {
            const res = await request(app)
                .get('/api/notes/recycle-bin')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data.length).toBeGreaterThan(0);

            const deletedNote = res.body.data.find(note => note._id === noteId);
            expect(deletedNote).toBeDefined();
            expect(deletedNote.isDeleted).toBe(true);
        });

        it('should support pagination', async () => {
            // Create multiple deleted notes
            for (let i = 0; i < 5; i++) {
                const note = await Note.create({
                    title: `Deleted Note ${i}`,
                    content: `Content ${i}`,
                    user: userId,
                    isDeleted: true,
                    deletedAt: new Date()
                });
            }

            const res = await request(app)
                .get('/api/notes/recycle-bin?page=1&limit=3')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.length).toBeLessThanOrEqual(3);
            expect(res.body.page).toBe(1);
            expect(res.body.pages).toBeGreaterThanOrEqual(1);
        });
    });

    describe('PUT /api/notes/:id/restore - Restore note from recycle bin', () => {
        it('should restore a deleted note', async () => {
            const res = await request(app)
                .put(`/api/notes/${noteId}/restore`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toContain('restored');
            expect(res.body.data.isDeleted).toBe(false);
            expect(res.body.data.deletedAt).toBeNull();
        });

        it('should show restored note in regular notes list', async () => {
            const res = await request(app)
                .get('/api/notes')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            const restoredNote = res.body.data.find(note => note._id === noteId);
            expect(restoredNote).toBeDefined();
            expect(restoredNote.isDeleted).toBe(false);
        });

        it('should return 404 for non-existent note', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const res = await request(app)
                .put(`/api/notes/${fakeId}/restore`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it('should return error if note is not in recycle bin', async () => {
            // Note is already restored
            const res = await request(app)
                .put(`/api/notes/${noteId}/restore`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toContain('not in recycle bin');
        });
    });

    describe('DELETE /api/notes/:id/permanent - Permanently delete note', () => {
        let noteToDelete;

        beforeEach(async () => {
            // Create and delete a note
            const note = await Note.create({
                title: 'Note to Permanently Delete',
                content: 'This will be gone forever',
                user: userId,
                isDeleted: true,
                deletedAt: new Date()
            });
            noteToDelete = note._id;
        });

        it('should permanently delete a note', async () => {
            const res = await request(app)
                .delete(`/api/notes/${noteToDelete}/permanent`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toContain('permanently deleted');

            // Verify note is completely removed from database
            const note = await Note.findById(noteToDelete);
            expect(note).toBeNull();
        });

        it('should return 404 for non-existent note', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const res = await request(app)
                .delete(`/api/notes/${fakeId}/permanent`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });
    });

    describe('DELETE /api/notes/recycle-bin/empty - Empty recycle bin', () => {
        beforeEach(async () => {
            // Create multiple deleted notes
            for (let i = 0; i < 3; i++) {
                await Note.create({
                    title: `Deleted Note ${i}`,
                    content: `Content ${i}`,
                    user: userId,
                    isDeleted: true,
                    deletedAt: new Date()
                });
            }
        });

        it('should empty the recycle bin', async () => {
            const res = await request(app)
                .delete('/api/notes/recycle-bin/empty')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.deletedCount).toBeGreaterThan(0);

            // Verify all deleted notes are gone
            const deletedNotes = await Note.find({
                user: userId,
                isDeleted: true
            });
            expect(deletedNotes.length).toBe(0);
        });

        it('should only delete current user\'s notes', async () => {
            // Create another user with deleted notes
            const otherUser = await User.create({
                name: 'Other User',
                email: 'otheruser2@test.com',
                password: 'Test123!@#',
                isEmailVerified: true
            });

            const otherNote = await Note.create({
                title: 'Other User Deleted Note',
                content: 'This should not be deleted',
                user: otherUser._id,
                isDeleted: true,
                deletedAt: new Date()
            });

            await request(app)
                .delete('/api/notes/recycle-bin/empty')
                .set('Authorization', `Bearer ${authToken}`);

            // Verify other user's note still exists
            const stillExists = await Note.findById(otherNote._id);
            expect(stillExists).toBeDefined();

            // Cleanup
            await Note.findByIdAndDelete(otherNote._id);
            await User.findByIdAndDelete(otherUser._id);
        });
    });

    describe('Recycle Bin Cleanup Utility', () => {
        it('should automatically delete notes older than retention period', async () => {
            // Create old deleted note (older than 30 days)
            const oldDate = new Date();
            oldDate.setDate(oldDate.getDate() - (RECYCLE_BIN_RETENTION_DAYS + 1));

            const oldNote = await Note.create({
                title: 'Old Deleted Note',
                content: 'This should be auto-deleted',
                user: userId,
                isDeleted: true,
                deletedAt: oldDate
            });

            // Create recent deleted note (within 30 days)
            const recentNote = await Note.create({
                title: 'Recent Deleted Note',
                content: 'This should remain',
                user: userId,
                isDeleted: true,
                deletedAt: new Date()
            });

            // Run cleanup
            const deletedCount = await cleanupRecycleBin();

            expect(deletedCount).toBeGreaterThan(0);

            // Verify old note is deleted
            const oldNoteExists = await Note.findById(oldNote._id);
            expect(oldNoteExists).toBeNull();

            // Verify recent note still exists
            const recentNoteExists = await Note.findById(recentNote._id);
            expect(recentNoteExists).toBeDefined();

            // Cleanup
            await Note.findByIdAndDelete(recentNote._id);
        });
    });

    describe('Authorization Tests', () => {
        it('should require authentication for recycle bin endpoints', async () => {
            const endpoints = [
                { method: 'get', path: '/api/notes/recycle-bin' },
                { method: 'delete', path: '/api/notes/recycle-bin/empty' },
                { method: 'put', path: `/api/notes/${noteId}/restore` },
                { method: 'delete', path: `/api/notes/${noteId}/permanent` }
            ];

            for (const endpoint of endpoints) {
                const res = await request(app)[endpoint.method](endpoint.path);
                expect(res.status).toBe(401);
            }
        });
    });
});
