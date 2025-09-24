const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

// Protect routes middleware
const protect = async (req, res, next) => {
    let token;

    try {
        // Check if token is sent in headers
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            // Extract token from "Bearer TOKEN"
            token = req.headers.authorization.split(' ')[1];
        }

        // Check if token exists
        if (!token) {
            logger.warn(`Access denied - no token provided for ${req.ip}`);
            return res.status(401).json({
                success: false,
                error: 'Access denied. No token provided.'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token
            const user = await User.findById(decoded.id);

            if (!user) {
                logger.warn(`Access denied - user not found for token`);
                return res.status(401).json({
                    success: false,
                    error: 'Access denied. User not found.'
                });
            }

            // Add user to request object
            req.user = user;

            logger.info(`Authenticated user: ${user.email}`);
            next();

        } catch (tokenError) {
            logger.warn(`Access denied - invalid token: ${tokenError.message}`);
            return res.status(401).json({
                success: false,
                error: 'Access denied. Invalid token.'
            });
        }

    } catch (error) {
        logger.error('Authentication middleware error:', error);
        return res.status(500).json({
            success: false,
            error: 'Server error during authentication'
        });
    }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    let token;

    try {
        // Check if token is sent in headers
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];

            try {
                // Verify token
                const decoded = jwt.verify(token, process.env.JWT_SECRET);

                // Get user from token
                const user = await User.findById(decoded.id);

                if (user) {
                    req.user = user;
                    logger.info(`Optional auth - user found: ${user.email}`);
                }
            } catch (tokenError) {
                // Token invalid, but we don't fail the request
                logger.info(`Optional auth - invalid token, continuing without user`);
            }
        }

        next();

    } catch (error) {
        logger.error('Optional authentication middleware error:', error);
        next(); // Continue without authentication
    }
};

module.exports = {
    protect,
    optionalAuth
};