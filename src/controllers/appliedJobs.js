// src/controllers/appliedJobs.js
const prisma = require('../utils/prismaClient');

// Get all applied jobs for a user
const getAppliedJobs = async (req, res) => {
  try {
    const userId = req.user.id;

    const appliedJobs = await prisma.appliedJob.findMany({
      where: { userId },
      orderBy: { appliedDate: 'desc' }
    });

    return res.status(200).json({
      success: true,
      appliedJobs
    });
  } catch (error) {
    console.error('Get applied jobs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch applied jobs'
    });
  }
};

// Add a new applied job
const addAppliedJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, company, location, url, appliedDate, appliedText } = req.body;

    if (!title || !url) {
      return res.status(400).json({
        success: false,
        message: 'Title and URL are required'
      });
    }

    // Check if job already exists for this user
    const existing = await prisma.appliedJob.findUnique({
      where: {
        userId_url: {
          userId,
          url
        }
      }
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'Job already tracked',
        appliedJob: existing
      });
    }

    const appliedJob = await prisma.appliedJob.create({
      data: {
        userId,
        title,
        company: company || null,
        location: location || null,
        url,
        appliedDate: appliedDate ? new Date(appliedDate) : new Date(),
        appliedText: appliedText || null,
        status: 'Applied'
      }
    });

    return res.status(201).json({
      success: true,
      appliedJob
    });
  } catch (error) {
    console.error('Add applied job error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add applied job'
    });
  }
};

// Delete an applied job
const deleteAppliedJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Verify the job belongs to the user
    const job = await prisma.appliedJob.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Applied job not found'
      });
    }

    await prisma.appliedJob.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: 'Applied job deleted'
    });
  } catch (error) {
    console.error('Delete applied job error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete applied job'
    });
  }
};

// Update job status
const updateJobStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    // Verify the job belongs to the user
    const job = await prisma.appliedJob.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Applied job not found'
      });
    }

    const updatedJob = await prisma.appliedJob.update({
      where: { id },
      data: { status }
    });

    return res.status(200).json({
      success: true,
      appliedJob: updatedJob
    });
  } catch (error) {
    console.error('Update job status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update job status'
    });
  }
};

module.exports = {
  getAppliedJobs,
  addAppliedJob,
  deleteAppliedJob,
  updateJobStatus
};

