#!/usr/bin/env node

/**
 * Quick MongoDB Atlas Connection Test
 * Run this before starting the server to verify your connection
 */

require('dotenv').config();
const mongoose = require('mongoose');

console.log('\n🔍 Testing MongoDB Atlas Connection...\n');
console.log('='.repeat(50));

// Check if MONGODB_URI is set
if (!process.env.MONGODB_URI) {
    console.error('❌ ERROR: MONGODB_URI is not set in .env file');
    process.exit(1);
}

// Check if password placeholder is still there
if (process.env.MONGODB_URI.includes('<db_password>')) {
    console.error('❌ ERROR: Please replace <db_password> in your .env file with your actual MongoDB Atlas password');
    console.log('\n📝 Current MONGODB_URI:', process.env.MONGODB_URI);
    console.log('\n💡 Example:');
    console.log('   mongodb+srv://scribo_admin:YourRealPassword@scribo-notes.a57maut.mongodb.net/scribo-notes-db?retryWrites=true&w=majority');
    process.exit(1);
}

// Mask password in logs for security
const maskedUri = process.env.MONGODB_URI.replace(
    /:([^:@]{3,})@/,
    ':****@'
);
console.log('🔗 Connection String:', maskedUri);
console.log('='.repeat(50));

// Connection options
const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
    maxPoolSize: 10,
    minPoolSize: 2,
    retryWrites: true,
    w: 'majority'
};

console.log('\n⏳ Attempting to connect...\n');

mongoose.connect(process.env.MONGODB_URI, options)
    .then((conn) => {
        console.log('✅ SUCCESS! Connected to MongoDB Atlas');
        console.log('='.repeat(50));
        console.log(`📊 Cluster Host: ${conn.connection.host}`);
        console.log(`📁 Database Name: ${conn.connection.name}`);
        console.log(`🔌 Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Unknown'}`);
        console.log('='.repeat(50));

        // Test database operations
        console.log('\n🧪 Testing database operations...');

        return conn.connection.db.admin().ping();
    })
    .then(() => {
        console.log('✅ Database ping successful');

        // List collections
        return mongoose.connection.db.listCollections().toArray();
    })
    .then((collections) => {
        console.log('\n📚 Existing Collections:');
        if (collections.length === 0) {
            console.log('   (No collections yet - database is empty)');
        } else {
            collections.forEach(coll => {
                console.log(`   - ${coll.name}`);
            });
        }

        console.log('\n' + '='.repeat(50));
        console.log('🎉 All tests passed!');
        console.log('='.repeat(50));
        console.log('\n✅ Your MongoDB Atlas connection is working correctly!');
        console.log('💡 You can now start your server with: npm run dev\n');

        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ CONNECTION FAILED');
        console.log('='.repeat(50));
        console.error('Error:', error.message);
        console.log('='.repeat(50));

        // Provide helpful error messages
        console.log('\n🔧 Troubleshooting Tips:\n');

        if (error.message.includes('authentication') || error.message.includes('auth')) {
            console.log('🔐 Authentication Error:');
            console.log('   1. Check if your username and password are correct');
            console.log('   2. Verify the database user exists in MongoDB Atlas');
            console.log('   3. Ensure the user has "readWrite" permissions');
            console.log('   4. Password may contain special characters that need URL encoding');
        }
        else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
            console.log('🌐 DNS Resolution Error:');
            console.log('   1. Check your internet connection');
            console.log('   2. Verify the cluster hostname in connection string');
            console.log('   3. Try using Google DNS (8.8.8.8)');
        }
        else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
            console.log('⏱️  Connection Timeout Error:');
            console.log('   1. Check your internet connection');
            console.log('   2. Verify Network Access settings in MongoDB Atlas');
            console.log('   3. Add your IP address to the whitelist');
            console.log('   4. Or allow access from anywhere (0.0.0.0/0) for testing');
        }
        else if (error.message.includes('network')) {
            console.log('🌐 Network Error:');
            console.log('   1. Check if MongoDB Atlas cluster is running');
            console.log('   2. Verify your IP is whitelisted in Network Access');
            console.log('   3. Check firewall settings');
        }
        else {
            console.log('❓ Unknown Error:');
            console.log('   1. Double-check your connection string in .env');
            console.log('   2. Verify MongoDB Atlas cluster is active');
            console.log('   3. Check MongoDB Atlas status page');
        }

        console.log('\n📖 Need help? Check MONGODB_ATLAS_SETUP.md\n');

        process.exit(1);
    });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err.message);
    process.exit(1);
});
