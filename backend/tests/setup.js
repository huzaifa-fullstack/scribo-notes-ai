const mongoose = require('mongoose');

// Setup test environment
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/notes-app-test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing';

// Global test hooks
before(async function () {
    this.timeout(10000);

    // Connect to test database if not already connected
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to test database');
    }
});

after(async function () {
    this.timeout(5000);

    // Clean up and close connection
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        console.log('Test database cleaned up and connection closed');
    }
});