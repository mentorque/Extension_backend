// backend/src/routes.js
const express = require('express');
const router = express.Router();

// Import middleware
const { authenticateApiKey } = require('./middleware/auth');
const { handleFileUpload } = require('./middleware/fileUpload'); // FIXED: handleFileUpload instead of uploadMiddleware

// Import controllers
const authController = require('./controllers/auth');
const chatController = require('./controllers/chat');
const coverletterController = require('./controllers/coverletter');
const experienceController = require('./controllers/experience');
const hrLookupController = require('./controllers/hrLookup');
const keywordsController = require('./controllers/keywords');
const uploadResumeController = require('./controllers/uploadResume');
const appliedJobsController = require('./controllers/appliedJobs');

// Public routes (no auth required)
// Health check
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

router.post('/auth/validate', authenticateApiKey, authController.validateApiKey);

// Protected routes (require API key)
router.use(authenticateApiKey); // Apply auth middleware to all routes below

// Chat routes
router.post('/chat', chatController.chatWithContext);

// Cover letter routes
router.post('/coverletter', coverletterController.generateCoverLetter);

// Experience routes
router.post('/experience', experienceController.generateExperience);

// HR Lookup routes
router.post('/hr-lookup', hrLookupController.hrLookup);

// Keywords routes
router.post('/keywords', keywordsController.generateKeywords);

// Resume upload routes - FIXED: handleFileUpload instead of uploadMiddleware
router.post('/upload-resume', handleFileUpload, uploadResumeController.uploadResume);

// Applied jobs routes
router.get('/applied-jobs', appliedJobsController.getAppliedJobs);
router.post('/applied-jobs', appliedJobsController.addAppliedJob);
router.delete('/applied-jobs/:id', appliedJobsController.deleteAppliedJob);
router.patch('/applied-jobs/:id/status', appliedJobsController.updateJobStatus);

module.exports = router;