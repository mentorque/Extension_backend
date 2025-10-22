// src/controllers/auth.js
const prisma = require('../utils/prismaClient');

const validateApiKey = async (req, res) => {
  try {
    // req.user is set by authenticateApiKey middleware
    return res.status(200).json({
      success: true,
      message: 'API key is valid',
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.fullName // Changed from 'name' to 'fullName'
      }
    });
  } catch (error) {
    console.error('Validate API key error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to validate API key'
    });
  }
};

module.exports = {
  validateApiKey
};