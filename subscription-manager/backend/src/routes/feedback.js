const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');
const logger = require('../lib/logger');

const prisma = new PrismaClient();

// Validation function for feedback
const validateFeedback = (data) => {
  const errors = [];
  
  // Email validation
  if (!data.email) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }
  
  // Type validation
  if (!data.type) {
    errors.push('Feedback type is required');
  } else if (!['bug', 'feature', 'general'].includes(data.type)) {
    errors.push('Invalid feedback type');
  }
  
  // Message validation
  if (!data.message) {
    errors.push('Message is required');
  } else if (data.message.length < 10) {
    errors.push('Message must be at least 10 characters long');
  } else if (data.message.length > 1000) {
    errors.push('Message must not exceed 1000 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * POST /api/feedback - Submit feedback
 * Can be authenticated (user feedback) or anonymous
 */
router.post('/', async (req, res) => {
  try {
    // Validate input
    const validation = validateFeedback(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        message: validation.errors[0],
        errors: validation.errors
      });
    }

    const { email, type, message } = req.body;

    // Check if user is authenticated (optional)
    let userId = null;
    if (req.headers.authorization) {
      try {
        // Try to authenticate but don't require it
        await new Promise((resolve) => {
          auth(req, res, (err) => {
            if (!err && req.user) {
              userId = req.user.id;
            }
            resolve();
          });
        });
      } catch (err) {
        // Ignore auth errors - allow anonymous feedback
        logger.debug('Anonymous feedback submission');
      }
    }

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        userId,
        email,
        type,
        message,
        status: 'new'
      }
    });

    logger.info('Feedback submitted', {
      feedbackId: feedback.id,
      type: feedback.type,
      userId: feedback.userId || 'anonymous'
    });

    res.status(201).json({
      message: 'Thank you for your feedback!',
      feedback: {
        id: feedback.id,
        type: feedback.type,
        createdAt: feedback.createdAt
      }
    });

  } catch (err) {
    logger.error('Error submitting feedback', err);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to submit feedback'
    });
  }
});

/**
 * GET /api/feedback - Get feedback (admin only)
 * In a real app, you'd add admin authentication
 */
router.get('/', auth, async (req, res) => {
  try {
    // For now, any authenticated user can see feedback
    // In production, add admin role check
    const feedback = await prisma.feedback.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      message: 'Feedback retrieved successfully',
      data: feedback,
      total: feedback.length
    });

  } catch (err) {
    logger.error('Error fetching feedback', err);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch feedback'
    });
  }
});

module.exports = router;