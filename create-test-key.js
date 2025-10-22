// create-test-key.js
const prisma = require('./src/utils/prismaClient');

async function createTestData() {
  try {
    // Create a test user
    const user = await prisma.user.create({
      data: {
        firebaseUid: 'test_uid_' + Date.now(),
        email: `test${Date.now()}@example.com`,
        fullName: 'Test User'
      }
    });

    // Create an API key for the user
    const apiKey = await prisma.apiKey.create({
      data: {
        key: 'test_key_' + Math.random().toString(36).substr(2, 16),
        name: 'Test API Key',
        userId: user.id,
        isActive: true
      }
    });

    console.log('✅ Test user created:', user.email);
    console.log('✅ API Key created:', apiKey.key);
    console.log('\nUse this API key in your headers:');
    console.log('x-api-key:', apiKey.key);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createTestData();