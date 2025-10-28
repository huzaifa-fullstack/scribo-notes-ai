const request = require('supertest');
const { expect } = require('chai');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../src/models/User');
const Note = require('../src/models/Note');

describe('Profile API', () => {
    let authToken;
    let userId;
    let testUser;

    before(async () => {
        // Create test user
        testUser = await User.create({
            name: 'Profile Test User',
            email: 'profiletest@example.com',
            password: 'Test123456'
        });

        userId = testUser._id;
        authToken = testUser.getSignedJwtToken();

        // Create some test notes for statistics
        await Note.create([
            {
                title: 'Test Note 1',
                content: 'Content 1',
                user: userId,
                isPinned: true,
                category: 'Work',
                tags: ['important', 'work'],
                priority: 'high',
                color: 'red'
            },
            {
                title: 'Test Note 2',
                content: 'Content 2',
                user: userId,
                isArchived: true,
                category: 'Personal',
                tags: ['personal'],
                priority: 'medium',
                color: 'blue'
            },
            {
                title: 'Test Note 3',
                content: 'Content 3',
                user: userId,
                category: 'Work',
                tags: ['work'],
                priority: 'low',
                color: 'default'
            }
        ]);
    });

    after(async () => {
        await User.deleteMany({});
        await Note.deleteMany({});
    });

    describe('GET /api/profile', () => {
        it('should get user profile with statistics', async () => {
            const res = await request(app)
                .get('/api/profile')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.data).to.have.property('user');
            expect(res.body.data).to.have.property('stats');

            // Check user data
            expect(res.body.data.user.email).to.equal('profiletest@example.com');
            expect(res.body.data.user.name).to.equal('Profile Test User');
            expect(res.body.data.user).to.not.have.property('password');

            // Check stats
            expect(res.body.data.stats.totalNotes).to.equal(3);
            expect(res.body.data.stats.pinnedNotes).to.equal(1);
            expect(res.body.data.stats.archivedNotes).to.equal(1);
            expect(res.body.data.stats.activeNotes).to.equal(2);
            expect(res.body.data.stats.totalTags).to.be.at.least(2);
        });

        it('should fail without authentication', async () => {
            const res = await request(app)
                .get('/api/profile');

            expect(res.status).to.equal(401);
        });

        it('should fail with invalid token', async () => {
            const res = await request(app)
                .get('/api/profile')
                .set('Authorization', 'Bearer invalid_token');

            expect(res.status).to.equal(401);
        });
    });

    describe('PUT /api/profile', () => {
        it('should update user name', async () => {
            const res = await request(app)
                .put('/api/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Updated Profile Name'
                });

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.data.user.name).to.equal('Updated Profile Name');
            expect(res.body.message).to.equal('Profile updated successfully');
        });

        it('should update user avatar', async () => {
            const avatarData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

            const res = await request(app)
                .put('/api/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    avatar: avatarData
                });

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.data.user.avatar).to.equal(avatarData);
        });

        it('should update both name and avatar', async () => {
            const res = await request(app)
                .put('/api/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Another Name',
                    avatar: 'https://example.com/avatar.png'
                });

            expect(res.status).to.equal(200);
            expect(res.body.data.user.name).to.equal('Another Name');
            expect(res.body.data.user.avatar).to.equal('https://example.com/avatar.png');
        });

        it('should fail with empty name', async () => {
            const res = await request(app)
                .put('/api/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: '   '
                });

            expect(res.status).to.equal(400);
            expect(res.body.error).to.include('cannot be empty');
        });

        it('should fail without authentication', async () => {
            const res = await request(app)
                .put('/api/profile')
                .send({
                    name: 'New Name'
                });

            expect(res.status).to.equal(401);
        });
    });

    describe('PUT /api/profile/password', () => {
        it('should change password successfully', async () => {
            const res = await request(app)
                .put('/api/profile/password')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    currentPassword: 'Test123456',
                    newPassword: 'NewPassword123'
                });

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.message).to.equal('Password changed successfully');

            // Verify can login with new password
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'profiletest@example.com',
                    password: 'NewPassword123'
                });

            expect(loginRes.status).to.equal(200);

            // Change password back for other tests
            await request(app)
                .put('/api/profile/password')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    currentPassword: 'NewPassword123',
                    newPassword: 'Test123456'
                });
        });

        it('should fail with incorrect current password', async () => {
            const res = await request(app)
                .put('/api/profile/password')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    currentPassword: 'WrongPassword',
                    newPassword: 'NewPassword123'
                });

            expect(res.status).to.equal(401);
            expect(res.body.error).to.include('incorrect');
        });

        it('should fail with short new password', async () => {
            const res = await request(app)
                .put('/api/profile/password')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    currentPassword: 'Test123456',
                    newPassword: '12345'
                });

            expect(res.status).to.equal(400);
            expect(res.body.error).to.include('at least 6 characters');
        });

        it('should fail when new password same as current', async () => {
            const res = await request(app)
                .put('/api/profile/password')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    currentPassword: 'Test123456',
                    newPassword: 'Test123456'
                });

            expect(res.status).to.equal(400);
            expect(res.body.error).to.include('must be different');
        });

        it('should fail with missing fields', async () => {
            const res = await request(app)
                .put('/api/profile/password')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    currentPassword: 'Test123456'
                });

            expect(res.status).to.equal(400);
        });
    });

    describe('POST /api/profile/avatar', () => {
        it('should upload avatar successfully', async () => {
            const avatarData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

            const res = await request(app)
                .post('/api/profile/avatar')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    avatar: avatarData
                });

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.data.avatar).to.equal(avatarData);
        });

        it('should fail with missing avatar data', async () => {
            const res = await request(app)
                .post('/api/profile/avatar')
                .set('Authorization', `Bearer ${authToken}`)
                .send({});

            expect(res.status).to.equal(400);
        });

        it('should fail with invalid image format', async () => {
            const res = await request(app)
                .post('/api/profile/avatar')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    avatar: 'not-a-valid-image'
                });

            expect(res.status).to.equal(400);
            expect(res.body.error).to.include('Invalid image format');
        });
    });

    describe('DELETE /api/profile/avatar', () => {
        it('should delete avatar successfully', async () => {
            // First upload an avatar
            await request(app)
                .post('/api/profile/avatar')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    avatar: 'data:image/png;base64,test'
                });

            // Then delete it
            const res = await request(app)
                .delete('/api/profile/avatar')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;

            // Verify avatar is deleted
            const profileRes = await request(app)
                .get('/api/profile')
                .set('Authorization', `Bearer ${authToken}`);

            expect(profileRes.body.data.user.avatar).to.be.null;
        });
    });

    describe('GET /api/profile/stats', () => {
        it('should get detailed user statistics', async () => {
            const res = await request(app)
                .get('/api/profile/stats')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.data).to.have.property('totalNotes');
            expect(res.body.data).to.have.property('pinnedNotes');
            expect(res.body.data).to.have.property('categories');
            expect(res.body.data).to.have.property('priorities');
            expect(res.body.data).to.have.property('colors');
            expect(res.body.data).to.have.property('allTags');

            expect(res.body.data.totalNotes).to.equal(3);
            expect(res.body.data.categories).to.have.property('Work');
            expect(res.body.data.categories.Work).to.equal(2);
        });

        it('should fail without authentication', async () => {
            const res = await request(app)
                .get('/api/profile/stats');

            expect(res.status).to.equal(401);
        });
    });

    describe('Google OAuth User Password Change', () => {
        let googleUser;
        let googleToken;

        before(async () => {
            // Create a Google OAuth user (no password)
            googleUser = await User.create({
                name: 'Google User',
                email: 'googleuser@example.com',
                googleId: '1234567890',
                isEmailVerified: true
            });

            googleToken = googleUser.getSignedJwtToken();
        });

        it('should prevent password change for Google OAuth users', async () => {
            const res = await request(app)
                .put('/api/profile/password')
                .set('Authorization', `Bearer ${googleToken}`)
                .send({
                    currentPassword: 'anything',
                    newPassword: 'NewPassword123'
                });

            expect(res.status).to.equal(400);
            expect(res.body.error).to.include('social login');
        });
    });
});
