const { expect } = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const { protect, optionalAuth } = require('../src/middleware/auth');
const User = require('../src/models/User');

describe('Authentication Middleware Tests', () => {
    let req, res, next;
    let findByIdStub;

    beforeEach(() => {
        // Mock request, response, and next function
        req = {
            headers: {},
            ip: '127.0.0.1'
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub().returnsThis()
        };
        next = sinon.stub();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('protect middleware', () => {
        describe('Token validation', () => {
            it('should fail if no token is provided', async () => {
                await protect(req, res, next);

                expect(res.status.calledWith(401)).to.be.true;
                expect(res.json.calledOnce).to.be.true;
                expect(res.json.firstCall.args[0].error).to.include('No token');
                expect(next.called).to.be.false;
            });

            it('should fail if token format is invalid', async () => {
                req.headers.authorization = 'InvalidFormat token123';

                await protect(req, res, next);

                expect(res.status.calledWith(401)).to.be.true;
                expect(next.called).to.be.false;
            });

            it('should fail if token is expired', async () => {
                const expiredToken = jwt.sign(
                    { id: '123456789012345678901234' },
                    process.env.JWT_SECRET || 'test-secret',
                    { expiresIn: '0s' } // Immediately expired
                );

                req.headers.authorization = `Bearer ${expiredToken}`;

                // Wait a moment to ensure token is expired
                await new Promise(resolve => setTimeout(resolve, 10));

                await protect(req, res, next);

                expect(res.status.calledWith(401)).to.be.true;
                expect(res.json.firstCall.args[0].error).to.include('Invalid token');
            });

            it('should fail if token is malformed', async () => {
                req.headers.authorization = 'Bearer malformed.token.here';

                await protect(req, res, next);

                expect(res.status.calledWith(401)).to.be.true;
                expect(res.json.firstCall.args[0].error).to.include('Invalid token');
            });
        });

        describe('User validation', () => {
            beforeEach(() => {
                findByIdStub = sinon.stub(User, 'findById');
            });

            it('should fail if user does not exist', async () => {
                const token = jwt.sign(
                    { id: '123456789012345678901234' },
                    process.env.JWT_SECRET || 'test-secret',
                    { expiresIn: '1h' }
                );

                req.headers.authorization = `Bearer ${token}`;
                findByIdStub.resolves(null);

                await protect(req, res, next);

                expect(res.status.calledWith(401)).to.be.true;
                expect(res.json.firstCall.args[0].error).to.include('User not found');
                expect(next.called).to.be.false;
            });

            it('should succeed with valid token and existing user', async () => {
                const mockUser = {
                    _id: '123456789012345678901234',
                    email: 'test@example.com',
                    name: 'Test User'
                };

                const token = jwt.sign(
                    { id: mockUser._id },
                    process.env.JWT_SECRET || 'test-secret',
                    { expiresIn: '1h' }
                );

                req.headers.authorization = `Bearer ${token}`;
                findByIdStub.resolves(mockUser);

                await protect(req, res, next);

                expect(req.user).to.deep.equal(mockUser);
                expect(next.calledOnce).to.be.true;
                expect(res.status.called).to.be.false;
            });
        });

        describe('Authorization header parsing', () => {
            it('should extract token from Bearer authorization header', async () => {
                const mockUser = { _id: '123456789012345678901234', email: 'test@test.com' };
                const token = jwt.sign({ id: mockUser._id }, process.env.JWT_SECRET || 'test-secret');

                req.headers.authorization = `Bearer ${token}`;
                findByIdStub = sinon.stub(User, 'findById').resolves(mockUser);

                await protect(req, res, next);

                expect(req.user).to.exist;
                expect(next.calledOnce).to.be.true;
            });

            it('should handle authorization header with extra spaces', async () => {
                req.headers.authorization = 'Bearer  token-with-spaces';

                await protect(req, res, next);

                expect(res.status.calledWith(401)).to.be.true;
            });
        });

        describe('Error handling', () => {
            it('should handle database errors gracefully', async () => {
                const token = jwt.sign(
                    { id: '123456789012345678901234' },
                    process.env.JWT_SECRET || 'test-secret'
                );

                req.headers.authorization = `Bearer ${token}`;
                findByIdStub = sinon.stub(User, 'findById').rejects(new Error('Database error'));

                await protect(req, res, next);

                // Should return error status (either 401 or 500 depending on implementation)
                expect(res.status.called).to.be.true;
                expect(res.json.called).to.be.true;
                expect(next.called).to.be.false;
            });

            it('should handle unexpected errors', async () => {
                req.headers.authorization = 'Bearer';

                await protect(req, res, next);

                expect(res.status.called).to.be.true;
                expect(next.called).to.be.false;
            });
        });
    });

    describe('optionalAuth middleware', () => {
        it('should continue without user if no token provided', async () => {
            await optionalAuth(req, res, next);

            expect(req.user).to.be.undefined;
            expect(next.calledOnce).to.be.true;
            expect(res.status.called).to.be.false;
        });

        it('should set user if valid token is provided', async () => {
            const mockUser = {
                _id: '123456789012345678901234',
                email: 'test@example.com'
            };

            const token = jwt.sign({ id: mockUser._id }, process.env.JWT_SECRET || 'test-secret');

            req.headers.authorization = `Bearer ${token}`;
            findByIdStub = sinon.stub(User, 'findById').resolves(mockUser);

            await optionalAuth(req, res, next);

            expect(req.user).to.deep.equal(mockUser);
            expect(next.calledOnce).to.be.true;
        });

        it('should continue without user if token is invalid', async () => {
            req.headers.authorization = 'Bearer invalid.token.here';

            await optionalAuth(req, res, next);

            expect(req.user).to.be.undefined;
            expect(next.calledOnce).to.be.true;
            expect(res.status.called).to.be.false;
        });

        it('should continue without user if token is expired', async () => {
            const expiredToken = jwt.sign(
                { id: '123456789012345678901234' },
                process.env.JWT_SECRET || 'test-secret',
                { expiresIn: '0s' }
            );

            req.headers.authorization = `Bearer ${expiredToken}`;

            await new Promise(resolve => setTimeout(resolve, 10));

            await optionalAuth(req, res, next);

            expect(req.user).to.be.undefined;
            expect(next.calledOnce).to.be.true;
        });

        it('should handle database errors gracefully', async () => {
            const token = jwt.sign(
                { id: '123456789012345678901234' },
                process.env.JWT_SECRET || 'test-secret'
            );

            req.headers.authorization = `Bearer ${token}`;
            findByIdStub = sinon.stub(User, 'findById').rejects(new Error('Database error'));

            await optionalAuth(req, res, next);

            expect(next.calledOnce).to.be.true;
            expect(res.status.called).to.be.false;
        });

        it('should not fail the request on any error', async () => {
            req.headers.authorization = 'Bearer malformed';

            await optionalAuth(req, res, next);

            expect(next.calledOnce).to.be.true;
        });
    });

    describe('Security tests', () => {
        it('should not expose sensitive information in error messages', async () => {
            req.headers.authorization = 'Bearer invalid.token';

            await protect(req, res, next);

            const errorMessage = res.json.firstCall.args[0].error.toLowerCase();
            expect(errorMessage).to.not.include('jwt');
            expect(errorMessage).to.not.include('secret');
        });

        it('should validate JWT signature', async () => {
            // Token signed with wrong secret
            const fakeToken = jwt.sign(
                { id: '123456789012345678901234' },
                'wrong-secret'
            );

            req.headers.authorization = `Bearer ${fakeToken}`;

            await protect(req, res, next);

            expect(res.status.calledWith(401)).to.be.true;
            expect(next.called).to.be.false;
        });
    });
});
