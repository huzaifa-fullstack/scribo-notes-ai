const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
    // Work directly with err object instead of spreading
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Server Error';

    // Log error
    logger.error({
        err: {
            message: err.message,
            stack: err.stack,
            name: err.name
        },
        req: {
            method: req.method,
            url: req.url,
            body: req.body,
            params: req.params,
            query: req.query,
            ip: req.ip
        }
    }, 'Error occurred');

    // Mongoose bad ObjectId (invalid format like "invalid-id")
    if (err.name === 'CastError') {
        message = 'Resource not found';
        statusCode = 404;
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        message = 'Duplicate field value entered';
        statusCode = 400;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        message = Object.values(err.errors).map(val => val.message).join(', ');
        statusCode = 400;
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        message = 'Invalid token';
        statusCode = 401;
    }

    if (err.name === 'TokenExpiredError') {
        message = 'Token expired';
        statusCode = 401;
    }

    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;