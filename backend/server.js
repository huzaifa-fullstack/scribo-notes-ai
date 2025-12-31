// IMPORTANT: Import instrument.js at the very top of your file (Sentry requirement)
// This also loads dotenv, so environment variables are available immediately
require('./instrument.js');

// Import Sentry after instrument.js
const Sentry = require('@sentry/node');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('./src/config/passport');

const connectDB = require('./src/config/database');
const logger = require('./src/config/logger');
const errorHandler = require('./src/middleware/errorHandler');
const { scheduleRecycleBinCleanup } = require('./src/utils/recycleBinCleanup');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Start recycle bin cleanup scheduler
scheduleRecycleBinCleanup();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));

// Initialize Passport
app.use(passport.initialize());

// Trust proxy - required for rate limiting behind reverse proxy (Render, etc.)
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    logger.info({
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    }, 'Incoming request');
    next();
});

// Health check route
app.get('/api/health', (req, res) => {
    logger.info('Health check endpoint accessed');
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        message: 'Notes App Backend is running successfully'
    });
});

// API Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/notes', require('./src/routes/notes'));
app.use('/api/export', require('./src/routes/export'));
app.use('/api/profile', require('./src/routes/profile'));
app.use('/api/ai', require('./src/routes/ai'));

// Sentry debug route (for testing - remove in production if not needed)
app.get("/debug-sentry", function mainHandler(req, res) {
    throw new Error("My first Sentry error!");
});

// 404 handler for undefined API routes
app.use('/api', (req, res, next) => {
    // Only handle if no other route matched
    logger.warn(`404 - API route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        success: false,
        error: 'API route not found'
    });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    const path = require('node:path');
    app.use(express.static('public'));

    // Express 5 requires named wildcard parameter
    app.get('/{*splat}', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
}

// The Sentry error handler must be registered before any other error middleware and after all controllers
Sentry.setupExpressErrorHandler(app);

// Optional fallthrough error handler with Sentry ID
app.use(function onError(err, req, res, next) {
    // The error id is attached to `res.sentry` to be returned
    // and optionally displayed to the user for support.
    res.statusCode = 500;
    res.json({
        success: false,
        error: 'Internal server error',
        sentryId: res.sentry
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
}

// Export app for testing
module.exports = app;