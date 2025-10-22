const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./src/routes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.text({ type: 'text/plain', limit: '10mb' }));

// Routes - CHANGED THIS LINE
app.use('/api', routes);

// File upload & validation error handling
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large (max 5MB)' });
  }

  if (err.message === 'Only PDFs are allowed') {
    return res.status(400).json({ error: 'Invalid file type' });
  }

  next(err);
});

// Centralized error handling
app.use((err, req, res, next) => {
  console.error("An error occurred:", err);

  const msg = err.message || 'An unexpected error occurred';

  if (msg.includes('API key')) {
    return res.status(401).json({ error: 'Invalid API key', message: msg });
  }

  if (msg.includes('quota') || msg.includes('rate limit')) {
    return res.status(429).json({ error: 'Rate limit exceeded', message: msg });
  }

  res.status(500).json({ error: 'Internal server error', message: msg });
});

module.exports = app;