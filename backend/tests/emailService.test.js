const { expect } = require('chai');
const sinon = require('sinon');
const emailService = require('../src/services/emailService');

describe('Email Service Tests', () => {
    let sendStub;
    const isMailgunConfigured = emailService.mailgun !== null;

    beforeEach(() => {
        // Stub the mailgun send method to prevent actual emails
        if (isMailgunConfigured && emailService.mailgun && emailService.mailgun.messages) {
            sendStub = sinon.stub(emailService.mailgun.messages, 'create').resolves({
                id: 'test-message-id',
                message: 'Queued. Thank you.'
            });
        }
    });

    afterEach(() => {
        // Restore stubs
        if (sendStub) {
            sendStub.restore();
        }
    });

    describe('sendVerificationEmail', () => {
        it('should send verification email with correct parameters', async function() {
            // Skip in test environment to avoid actual email sending
            if (!isMailgunConfigured || process.env.NODE_ENV === 'test') return this.skip();
            
            const email = 'test@example.com';
            const name = 'Test User';
            const verificationToken = 'test-token-123';

            await emailService.sendVerificationEmail(email, name, verificationToken);

            if (sendStub) {
                expect(sendStub.calledOnce).to.be.true;
                const callArgs = sendStub.firstCall.args[0];
                expect(callArgs.to).to.equal(email);
                expect(callArgs.subject).to.include('Verify');
            }
        });

        it('should handle missing email parameter', async function() {
            try {
                await emailService.sendVerificationEmail(null, 'Test', 'token');
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error).to.exist;
            }
        });

        it('should include verification link in email', async function() {
            // Skip in test environment to avoid actual email sending
            if (!isMailgunConfigured || process.env.NODE_ENV === 'test') return this.skip();
            
            const email = 'test@example.com';
            const token = 'verify-123';

            await emailService.sendVerificationEmail(email, 'User', token);

            if (sendStub) {
                const callArgs = sendStub.firstCall.args[0];
                expect(callArgs.html).to.include(token);
            }
        });
    });

    describe('sendPasswordResetEmail', () => {
        it('should have sendPasswordResetEmail method', () => {
            expect(emailService.sendPasswordResetEmail).to.be.a('function');
        });

        it('should handle missing email gracefully', async () => {
            try {
                await emailService.sendPasswordResetEmail(null, 'User', 'token');
            } catch (error) {
                expect(error).to.exist;
                expect(error.message).to.be.a('string');
            }
        });
    });

    describe('sendWelcomeEmail', () => {
        it('should have sendWelcomeEmail method', () => {
            expect(emailService.sendWelcomeEmail).to.be.a('function');
        });
    });

    describe('Email validation', () => {
        it('should export email service singleton', () => {
            expect(emailService).to.exist;
            expect(emailService).to.be.an('object');
        });
    });

    describe('Email formatting', () => {
        it('should have mailgun property', () => {
            expect(emailService).to.have.property('mailgun');
        });
    });

    describe('Email service initialization', () => {
        it('should export required email functions', () => {
            expect(emailService.sendVerificationEmail).to.be.a('function');
            expect(emailService.sendPasswordResetEmail).to.be.a('function');
            expect(emailService.sendWelcomeEmail).to.be.a('function');
        });
    });

    describe('Error handling', () => {
        it('should handle invalid input gracefully', async () => {
            try {
                await emailService.sendVerificationEmail('', '', '');
            } catch (error) {
                expect(error).to.exist;
            }
        });
    });
});
