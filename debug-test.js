// debug-test.js
const prisma = require('./src/utils/prismaClient');

async function debugApi() {
  try {
    const apiKey = await prisma.apiKey.findFirst({
      where: { isActive: true },
      include: { user: true }
    });

    if (!apiKey) {
      console.log('❌ No active API keys found.');
      return;
    }

    console.log('🔑 Testing with API key:', apiKey.key);
    
    // Test and see the raw response
    const response = await fetch('http://localhost:3000/api/auth/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey.key
      },
      body: JSON.stringify({})
    });

    const rawText = await response.text();
    console.log('📄 Raw response:', rawText.substring(0, 200)); // First 200 chars
    console.log('📊 Status:', response.status);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugApi();