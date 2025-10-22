// src/middleware/auth.js
const prisma = require('../utils/prismaClient');

const authenticateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return res.status(401).json({ success: false, message: 'API key is required' });
    }

    // Query ApiKey model using 'key' field
    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: { 
        key: apiKey 
      },
      include: {
        user: true
      }
    });

    if (!apiKeyRecord) {
      return res.status(401).json({ success: false, message: 'Invalid API key' });
    }

    // Use 'isActive' field (boolean)
    if (!apiKeyRecord.isActive) {
      return res.status(403).json({ success: false, message: 'API key is inactive' });
    }

    // Update lastUsedAt
    await prisma.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: { lastUsedAt: new Date() }
    });

    req.user = apiKeyRecord.user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ success: false, message: 'Authentication failed' });
  }
};

module.exports = { authenticateApiKey };