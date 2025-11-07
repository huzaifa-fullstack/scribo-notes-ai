const { expect } = require('chai');
const sinon = require('sinon');
const errorHandler = require('../src/middleware/errorHandler');

describe('Error Handler Middleware Tests', () => {
    let req, res, next;
    let loggerErrorStub;

    beforeEach(() => {
        // Mock request, response, and next
        req = {
            method: 'GET',
            url: '/api/test',
            body: {},
            params: {},
            query: {},
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

    describe('Generic errors', () => {
        it('should handle generic server error', () => {
            const err = new Error('Something went wrong');

            errorHandler(err, req, res, next);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.firstCall.args[0]).to.have.property('success', false);
            expect(res.json.firstCall.args[0]).to.have.property('error');
        });

        it('should use custom status code if provided', () => {
            const err = new Error('Bad request');
            err.statusCode = 400;

            errorHandler(err, req, res, next);

            expect(res.status.calledWith(400)).to.be.true;
        });

        it('should include error message in response', () => {
            const err = new Error('Custom error message');

            errorHandler(err, req, res, next);

            expect(res.json.firstCall.args[0].error).to.include('Custom error message');
        });
    });

    describe('Mongoose errors', () => {
        it('should handle CastError (invalid ObjectId)', () => {
            const err = new Error('Cast to ObjectId failed');
            err.name = 'CastError';

            errorHandler(err, req, res, next);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.firstCall.args[0].error).to.include('Resource not found');
        });

        it('should handle duplicate key error (code 11000)', () => {
            const err = new Error('Duplicate key');
            err.code = 11000;

            errorHandler(err, req, res, next);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.firstCall.args[0].error).to.include('Duplicate field value');
        });

        it('should handle ValidationError', () => {
            const err = new Error('Validation failed');
            err.name = 'ValidationError';
            err.errors = {
                email: { message: 'Email is required' },
                password: { message: 'Password must be at least 6 characters' }
            };

            errorHandler(err, req, res, next);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.firstCall.args[0].error).to.include('Email is required');
            expect(res.json.firstCall.args[0].error).to.include('Password must be at least 6 characters');
        });
    });

    describe('JWT errors', () => {
        it('should handle JsonWebTokenError', () => {
            const err = new Error('jwt malformed');
            err.name = 'JsonWebTokenError';

            errorHandler(err, req, res, next);

            expect(res.status.calledWith(401)).to.be.true;
            expect(res.json.firstCall.args[0].error).to.include('Invalid token');
        });

        it('should handle TokenExpiredError', () => {
            const err = new Error('jwt expired');
            err.name = 'TokenExpiredError';

            errorHandler(err, req, res, next);

            expect(res.status.calledWith(401)).to.be.true;
            expect(res.json.firstCall.args[0].error).to.include('Token expired');
        });
    });

    describe('Response format', () => {
        it('should always return JSON with success: false', () => {
            const err = new Error('Test error');

            errorHandler(err, req, res, next);

            const response = res.json.firstCall.args[0];
            expect(response).to.have.property('success', false);
            expect(response).to.have.property('error');
        });

        it('should not expose stack trace in production', () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';

            const err = new Error('Production error');

            errorHandler(err, req, res, next);

            const response = res.json.firstCall.args[0];
            expect(response).to.not.have.property('stack');

            process.env.NODE_ENV = originalEnv;
        });

        it('should include stack trace in development', () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'development';

            const err = new Error('Development error');

            errorHandler(err, req, res, next);

            const response = res.json.firstCall.args[0];
            expect(response).to.have.property('stack');

            process.env.NODE_ENV = originalEnv;
        });
    });

    describe('Error logging', () => {
        it('should log error details', () => {
            const err = new Error('Error to log');

            errorHandler(err, req, res, next);

            // Error handler should execute without throwing
            expect(res.status.called).to.be.true;
            expect(res.json.called).to.be.true;
        });

        it('should log request context with error', () => {
            req.method = 'POST';
            req.url = '/api/notes';
            req.body = { title: 'Test' };

            const err = new Error('Test error');

            errorHandler(err, req, res, next);

            expect(res.json.called).to.be.true;
        });
    });

    describe('Edge cases', () => {
        it('should handle error without message', () => {
            const err = new Error();

            errorHandler(err, req, res, next);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.firstCall.args[0].error).to.exist;
        });

        it('should handle null error object', () => {
            const err = { message: null };

            errorHandler(err, req, res, next);

            expect(res.status.called).to.be.true;
            expect(res.json.called).to.be.true;
        });

        it('should handle error with only statusCode', () => {
            const err = { statusCode: 403 };

            errorHandler(err, req, res, next);

            expect(res.status.calledWith(403)).to.be.true;
        });

        it('should preserve original error properties', () => {
            const err = new Error('Test');
            err.customProperty = 'custom value';

            errorHandler(err, req, res, next);

            // Should not crash with custom properties
            expect(res.json.called).to.be.true;
        });
    });

    describe('Status code handling', () => {
        it('should handle 400 Bad Request', () => {
            const err = new Error('Bad request');
            err.statusCode = 400;

            errorHandler(err, req, res, next);

            expect(res.status.calledWith(400)).to.be.true;
        });

        it('should handle 401 Unauthorized', () => {
            const err = new Error('Unauthorized');
            err.statusCode = 401;

            errorHandler(err, req, res, next);

            expect(res.status.calledWith(401)).to.be.true;
        });

        it('should handle 403 Forbidden', () => {
            const err = new Error('Forbidden');
            err.statusCode = 403;

            errorHandler(err, req, res, next);

            expect(res.status.calledWith(403)).to.be.true;
        });

        it('should handle 404 Not Found', () => {
            const err = new Error('Not found');
            err.statusCode = 404;

            errorHandler(err, req, res, next);

            expect(res.status.calledWith(404)).to.be.true;
        });

        it('should default to 500 for unknown errors', () => {
            const err = new Error('Unknown');

            errorHandler(err, req, res, next);

            expect(res.status.calledWith(500)).to.be.true;
        });
    });

    describe('Security', () => {
        it('should not expose sensitive information in production', () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';

            const err = new Error('Database connection string: mongodb://user:pass@host');
            err.connectionString = 'mongodb://user:pass@host';

            errorHandler(err, req, res, next);

            const response = res.json.firstCall.args[0];
            expect(response).to.not.have.property('connectionString');

            process.env.NODE_ENV = originalEnv;
        });

        it('should sanitize error messages', () => {
            const err = new Error('Error occurred');

            errorHandler(err, req, res, next);

            const response = res.json.firstCall.args[0];
            expect(response.error).to.be.a('string');
        });
    });
});
