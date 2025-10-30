const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  try {
    // Validate MongoDB URI
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // MongoDB Atlas connection options
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 2, // Maintain at least 2 socket connections
      retryWrites: true,
      w: 'majority'
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    logger.info(`📊 Database Name: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('✅ MongoDB reconnected successfully');
    });

    mongoose.connection.on('connected', () => {
      logger.info('🔗 MongoDB connection established');
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        logger.info('🔌 MongoDB connection closed due to app termination');
        process.exit(0);
      } catch (error) {
        logger.error('Error closing MongoDB connection:', error);
        process.exit(1);
      }
    });

    // Handle process termination
    process.on('SIGTERM', async () => {
      try {
        await mongoose.connection.close();
        logger.info('🔌 MongoDB connection closed due to SIGTERM');
        process.exit(0);
      } catch (error) {
        logger.error('Error closing MongoDB connection:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    logger.error('❌ Database connection failed:', error.message);
    logger.error('📝 Please check your MONGODB_URI in .env file');

    // Log helpful debugging information
    if (error.message.includes('authentication')) {
      logger.error('🔐 Authentication failed. Please check username and password');
    } else if (error.message.includes('network')) {
      logger.error('🌐 Network error. Please check your internet connection and MongoDB Atlas network access settings');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      logger.error('🔍 Cannot resolve MongoDB Atlas hostname. Check your connection string');
    }

    process.exit(1);
  }
};

module.exports = connectDB;