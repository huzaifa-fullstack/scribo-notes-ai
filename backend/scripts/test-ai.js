/**
 * AI Routes Test Script
 * 
 * This script tests all AI endpoints to ensure they work correctly
 * Run this after starting the backend server
 * 
 * Usage: node scripts/test-ai.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// You'll need to replace this with a valid JWT token from your app
// Get it by logging in and copying the token from localStorage
const AUTH_TOKEN = 'your-jwt-token-here';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`,
    },
});

// Test data
const testText = 'This is a sample note about artificial intelligence. AI is transforming how we work and live. Machine learning algorithms can analyze data and make predictions. Natural language processing helps computers understand human language.';

const shortText = 'Reminder to buy groceries tomorrow';

async function testGrammarCorrection() {
    console.log('\n🔧 Testing Grammar Correction...');
    try {
        const response = await apiClient.post('/ai/correct-grammar', {
            text: 'i has many idea for the project and we needs to implement them quickly',
        });
        console.log('✅ Success:', response.data);
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

async function testSummarization() {
    console.log('\n📝 Testing Summarization...');
    try {
        const response = await apiClient.post('/ai/summarize', {
            text: testText,
            maxLength: 50,
        });
        console.log('✅ Success:', response.data);
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

async function testContentGeneration() {
    console.log('\n🤖 Testing Content Generation...');
    try {
        const response = await apiClient.post('/ai/generate-content', {
            context: 'Write about the benefits of cloud computing for small businesses',
            style: 'professional',
            length: 'medium',
            tone: 'neutral',
        });
        console.log('✅ Success:', response.data);
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

async function testTagSuggestions() {
    console.log('\n🏷️  Testing Tag Suggestions...');
    try {
        const response = await apiClient.post('/ai/suggest-tags', {
            text: testText,
            maxTags: 5,
        });
        console.log('✅ Success:', response.data);
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

async function testContentEnhancement() {
    console.log('\n✨ Testing Content Enhancement...');
    try {
        const response = await apiClient.post('/ai/enhance-content', {
            text: shortText,
            style: 'professional',
        });
        console.log('✅ Success:', response.data);
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

async function testToneAdjustment() {
    console.log('\n🎭 Testing Tone Adjustment...');
    try {
        const response = await apiClient.post('/ai/adjust-tone', {
            text: 'Hey, we need to finish this ASAP!',
            tone: 'professional',
        });
        console.log('✅ Success:', response.data);
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

async function testAutoSuggestions() {
    console.log('\n💡 Testing Auto Suggestions...');
    try {
        const response = await apiClient.post('/ai/auto-suggestions', {
            text: testText,
        });
        console.log('✅ Success:', response.data);
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

async function testBatchProcessing() {
    console.log('\n🔄 Testing Batch Processing...');
    try {
        const response = await apiClient.post('/ai/batch', {
            text: testText,
            actions: ['grammar', 'summarize', 'tags'],
        });
        console.log('✅ Success:', response.data);
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

async function runAllTests() {
    console.log('🚀 Starting AI Endpoint Tests...');
    console.log('='.repeat(50));

    if (AUTH_TOKEN === 'your-jwt-token-here') {
        console.log('\n⚠️  WARNING: Please update AUTH_TOKEN in this script');
        console.log('   1. Start the backend server');
        console.log('   2. Login to the app');
        console.log('   3. Copy JWT token from localStorage');
        console.log('   4. Update AUTH_TOKEN variable in this script\n');
        return;
    }

    await testGrammarCorrection();
    await testSummarization();
    await testContentGeneration();
    await testTagSuggestions();
    await testContentEnhancement();
    await testToneAdjustment();
    await testAutoSuggestions();
    await testBatchProcessing();

    console.log('\n' + '='.repeat(50));
    console.log('🏁 All tests completed!');
}

// Run tests
runAllTests();
