/**
 * Database Initialization Script
 * This script helps verify MongoDB Atlas connection and create initial indexes
 */

require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('./src/config/logger');

// Import models to register schemas
const User = require('./src/models/User');
const Note = require('./src/models/Note');

async function initializeDatabase() {
    try {
        console.log('🚀 Starting Database Initialization...\n');

        // Check environment variables
        if (!process.env.MONGODB_URI) {
            throw new Error('❌ MONGODB_URI is not defined in .env file');
        }

        console.log('📝 Configuration:');
        console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`   Database URI: ${process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);
        console.log('');

        // Connect to MongoDB Atlas
        console.log('🔌 Connecting to MongoDB Atlas...');
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            family: 4
        };

        const conn = await mongoose.connect(process.env.MONGODB_URI, options);
        console.log(`✅ Connected to: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}\n`);

        // Get database statistics
        console.log('📈 Database Statistics:');
        const stats = await mongoose.connection.db.stats();
        console.log(`   Collections: ${stats.collections}`);
        console.log(`   Data Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Indexes: ${stats.indexes}`);
        console.log('');

        // Create indexes
        console.log('🔍 Creating Indexes...');

        // User indexes
        await User.createIndexes();
        console.log('   ✓ User indexes created');

        // Note indexes
        await Note.createIndexes();
        console.log('   ✓ Note indexes created');
        console.log('');

        // List all collections
        console.log('📁 Existing Collections:');
        const collections = await mongoose.connection.db.listCollections().toArray();
        if (collections.length === 0) {
            console.log('   (No collections yet - will be created when you add data)');
        } else {
            for (const collection of collections) {
                const count = await mongoose.connection.db.collection(collection.name).countDocuments();
                console.log(`   - ${collection.name}: ${count} documents`);
            }
        }
        console.log('');

        // Verify indexes
        console.log('🔐 Verifying Indexes:');
        const userIndexes = await User.collection.getIndexes();
        const noteIndexes = await Note.collection.getIndexes();

        console.log('   User Collection Indexes:');
        Object.keys(userIndexes).forEach(index => {
            console.log(`   - ${index}`);
        });

        console.log('   Note Collection Indexes:');
        Object.keys(noteIndexes).forEach(index => {
            console.log(`   - ${index}`);
        });
        console.log('');

        // Test write operation
        console.log('✍️  Testing Database Operations...');
        const testResult = await mongoose.connection.db.admin().ping();
        if (testResult.ok === 1) {
            console.log('   ✓ Database is ready for read/write operations');
        }
        console.log('');

        console.log('✅ Database Initialization Complete!\n');
        console.log('🎉 Your MongoDB Atlas database is ready to use!');
        console.log('💡 You can now start the server with: npm run dev\n');

    } catch (error) {
        console.error('❌ Database Initialization Failed!\n');
        console.error('Error:', error.message);
        console.error('');

        // Provide helpful error messages
        if (error.message.includes('authentication')) {
            console.error('🔐 Authentication Error:');
            console.error('   - Check your username and password in MONGODB_URI');
            console.error('   - Ensure the database user exists in MongoDB Atlas');
            console.error('   - Verify the password is correctly URL-encoded');
        } else if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
            console.error('🌐 Network Error:');
            console.error('   - Check your internet connection');
            console.error('   - Verify IP address is whitelisted in MongoDB Atlas');
            console.error('   - Ensure the cluster is fully deployed (wait 3-5 minutes after creation)');
        } else if (error.message.includes('MONGODB_URI')) {
            console.error('📝 Configuration Error:');
            console.error('   - Create a .env file in the backend folder');
            console.error('   - Copy .env.example to .env');
            console.error('   - Add your MongoDB Atlas connection string');
        }

        console.error('\n📖 See MONGODB_ATLAS_SETUP.md for detailed setup instructions\n');
        process.exit(1);
    } finally {
        // Close connection
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

// Run initialization
initializeDatabase();
