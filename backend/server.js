require('dotenv').config(); // Load environment variables first

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('./src/config/passport');

const connectDB = require('./src/config/database');
const logger = require('./src/config/logger');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));

// Initialize Passport  // ADD THIS
app.use(passport.initialize());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.'
    }
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
    const path = require('path');
    app.use(express.static('public'));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
}

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