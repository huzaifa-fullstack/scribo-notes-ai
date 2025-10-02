const { expect } = require('chai');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Note = require('../src/models/Note');

describe('Model Unit Tests', () => {
    before(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI);
        }
    });

    describe('User Model', () => {
        afterEach(async () => {
            await User.deleteMany({ email: { $regex: /modeltest/ } });
        });

        it('should hash password on save', async () => {
            const user = await User.create({
                name: 'Test User',
                email: 'modeltest@example.com',
                password: 'plaintext'
            });

            expect(user.password).to.not.equal('plaintext');
            expect(user.password).to.have.lengthOf.at.least(60);
        });

        it('should validate email format', async () => {
            try {
                await User.create({
                    name: 'Test',
                    email: 'invalid-email',
                    password: 'password123'
                });
                expect.fail('Should have thrown validation error');
            } catch (error) {
                expect(error.name).to.equal('ValidationError');
            }
        });

        it('should generate JWT token', async () => {
            const user = await User.create({
                name: 'Test',
                email: 'modeltest2@example.com',
                password: 'password123'
            });

            const token = user.getSignedJwtToken();
            expect(token).to.be.a('string');
            expect(token.split('.')).to.have.lengthOf(3);
        });

        it('should match correct password', async () => {
            const user = await User.create({
                name: 'Test',
                email: 'modeltest3@example.com',
                password: 'password123'
            });

            const userWithPassword = await User.findById(user._id).select('+password');
            const isMatch = await userWithPassword.matchPassword('password123');
            expect(isMatch).to.be.true;
        });

        it('should not match incorrect password', async () => {
            const user = await User.create({
                name: 'Test',
                email: 'modeltest4@example.com',
                password: 'password123'
            });

            const userWithPassword = await User.findById(user._id).select('+password');
            const isMatch = await userWithPassword.matchPassword('wrongpassword');
            expect(isMatch).to.be.false;
        });

        it('should not return sensitive fields in toJSON', async () => {
            const user = await User.create({
                name: 'Test',
                email: 'modeltest5@example.com',
                password: 'password123'
            });

            const json = user.toJSON();
            expect(json).to.not.have.property('password');
            expect(json).to.not.have.property('resetPasswordToken');
        });
    });

    describe('Note Model', () => {
        let testUser;

        before(async () => {
            testUser = await User.create({
                name: 'Note Test User',
                email: 'notemodel@example.com',
                password: 'password123'
            });
        });

        afterEach(async () => {
            await Note.deleteMany({ user: testUser._id });
        });

        after(async () => {
            await User.findByIdAndDelete(testUser._id);
        });

        it('should create note with required fields', async () => {
            const note = await Note.create({
                title: 'Test Note',
                content: 'Test Content',
                user: testUser._id
            });

            expect(note).to.have.property('title', 'Test Note');
            expect(note).to.have.property('isPinned', false);
            expect(note).to.have.property('isArchived', false);
        });

        it('should validate required fields', async () => {
            try {
                await Note.create({
                    title: 'No user'
                });
                expect.fail('Should have thrown validation error');
            } catch (error) {
                expect(error.name).to.equal('ValidationError');
            }
        });

        it('should check user access correctly', async () => {
            const note = await Note.create({
                title: 'Test',
                content: 'Content',
                user: testUser._id
            });

            const canAccess = note.canUserAccess(testUser._id);
            expect(canAccess).to.be.true;
        });

        it('should deny access to unauthorized user', async () => {
            const note = await Note.create({
                title: 'Test',
                content: 'Content',
                user: testUser._id
            });

            const otherId = new mongoose.Types.ObjectId();
            const canAccess = note.canUserAccess(otherId);
            expect(canAccess).to.be.false;
        });

        it('should update lastModified on save', async () => {
            const note = await Note.create({
                title: 'Test',
                content: 'Content',
                user: testUser._id
            });

            const originalModified = note.lastModified;

            await new Promise(resolve => setTimeout(resolve, 10));

            note.title = 'Updated';
            await note.save();

            expect(note.lastModified.getTime()).to.be.greaterThan(originalModified.getTime());
        });

        it('should share note with user', async () => {
            const otherUser = await User.create({
                name: 'Other User',
                email: 'other@example.com',
                password: 'password123'
            });

            const note = await Note.create({
                title: 'Test',
                content: 'Content',
                user: testUser._id
            });

            await note.shareWithUser(otherUser._id, 'read');

            expect(note.sharedWith).to.have.lengthOf(1);
            expect(note.sharedWith[0].permission).to.equal('read');

            await User.findByIdAndDelete(otherUser._id);
        });
    });
});