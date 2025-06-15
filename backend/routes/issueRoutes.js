import express from 'express';
import mongoose from 'mongoose';
import Issue from '../models/issue.js';
import User from '../models/user.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get analytics data (must be before /:id route)
router.get('/analytics', async (req, res) => {
  try {
    const [totalIssues, resolvedIssues, pendingIssues, totalUsers] = await Promise.all([
      Issue.countDocuments(),
      Issue.countDocuments({ status: 'resolved' }),
      Issue.countDocuments({ status: { $in: ['open', 'in-progress'] } }),
      User.countDocuments()
    ]);

    res.json({
      success: true,
      totalIssues,
      resolvedIssues,
      pendingIssues,
      totalUsers
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics'
    });
  }
});

// Get all issues
router.get('/', async (req, res) => {
  try {
    const { sort, limit, page = 1, pincode } = req.query;
    const pageSize = Number(limit) || 10;
    const skip = (Number(page) - 1) * pageSize;

    // Build filter object
    let filter = {};
    if (pincode) {
      filter.pincode = pincode;
    }

    let query = Issue.find(filter);

    // Add sorting
    if (sort === 'recent') {
      query = query.sort({ updatedAt: -1 });
    } else if (sort === 'supported') {
      query = query.sort({ 'upvotes.count': -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    // Add pagination
    query = query.skip(skip).limit(pageSize);

    const issues = await query
      .populate('reporter', 'name')
      .populate('comments.user', 'name')
      .populate('upvotes.users.userId', 'name')
      .exec();

    // Get total count for pagination
    const totalIssues = await Issue.countDocuments(filter);
    const hasMore = skip + pageSize < totalIssues;

    res.json({
      issues,
      pagination: {
        currentPage: Number(page),
        pageSize,
        totalIssues,
        hasMore,
        totalPages: Math.ceil(totalIssues / pageSize)
      }
    });
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching issues',
      error: error.message
    });
  }
});

// Get unique pincodes for filtering
router.get('/pincodes', async (req, res) => {
  try {
    const pincodes = await Issue.distinct('pincode');
    res.json({
      success: true,
      pincodes: pincodes.sort()
    });
  } catch (error) {
    console.error('Error fetching pincodes:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pincodes',
      error: error.message
    });
  }
});

// Create new issue
router.post('/', auth, async (req, res) => {
  try {
    console.log('Create issue request received');
    console.log('Request body:', req.body);

    const {
      title,
      description,
      concernAuthority,
      colony,
      pincode,
      location,
      images = [],
      tags = [],
      priority = 'low'
    } = req.body;

    // Validate required fields
    if (!title || !description || !concernAuthority || !colony || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Create new issue with proper initialization
    const issue = new Issue({
      title,
      description,
      concernAuthority,
      colony,
      pincode,
      location: location || {
        type: 'Point',
        coordinates: [0, 0]
      },
      images,
      tags,
      priority,
      reporter: req.userId,  // This comes from auth middleware
      status: 'open',
      upvotes: {
        count: 0,
        users: []
      },
      target: 100,
      comments: []
    });

    console.log('Attempting to save issue');
    const savedIssue = await issue.save();
    console.log('Issue saved successfully');

    res.status(201).json({
      success: true,
      issue: savedIssue
    });
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating issue',
      error: error.message
    });
  }
});

// Get single issue
router.get('/:id', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reporter', 'name')
      .populate('comments.user', 'name');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    res.json({
      success: true,
      issue
    });
  } catch (error) {
    console.error('Error fetching issue:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching issue',
      error: error.message
    });
  }
});

// Upvote an issue
router.post('/:issueId/upvote', auth, async (req, res) => {
  try {
    console.log('Upvote request received for issueId:', req.params.issueId);
    console.log('User ID from auth:', req.userId);

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(req.params.issueId)) {
      console.log('Invalid issue ID format');
      return res.status(400).json({
        success: false,
        message: 'Invalid issue ID format'
      });
    }

    // Find the issue and ensure it exists
    const issue = await Issue.findById(req.params.issueId);
    console.log('Found issue:', issue ? 'yes' : 'no');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Convert userId to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(req.userId);

    // Check if user has already upvoted
    const existingUpvote = issue.upvotes.users.find(upvote =>
      upvote.userId.equals(userObjectId)
    );
    console.log('Has user already upvoted:', !!existingUpvote);

    if (existingUpvote) {
      return res.status(400).json({
        success: false,
        message: 'You have already upvoted this issue'
      });
    }

    // Add upvote with timestamp
    issue.upvotes.users.push({
      userId: userObjectId,
      upvotedAt: new Date()
    });
    issue.upvotes.count = issue.upvotes.users.length;
    console.log('Saving issue with new upvote count:', issue.upvotes.count);

    await issue.save();
    console.log('Issue saved successfully');

    return res.json({
      success: true,
      message: 'Upvote added successfully',
      upvoteCount: issue.upvotes.count,
      canUndo: true,
      upvotedAt: new Date()
    });

  } catch (error) {
    console.error('Detailed upvote error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while processing upvote',
      error: error.message
    });
  }
});



// Remove upvote
router.post('/:issueId/remove-upvote', auth, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.issueId);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(req.userId);
    const upvoteIndex = issue.upvotes.users.findIndex(upvote =>
      upvote.userId.equals(userObjectId)
    );

    if (upvoteIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'You have not upvoted this issue'
      });
    }

    // Check if undo is still allowed (within 1 minute)
    const upvoteTime = issue.upvotes.users[upvoteIndex].upvotedAt;
    const currentTime = new Date();
    const timeDifference = (currentTime - upvoteTime) / 1000; // in seconds
    const undoTimeLimit = 60; // 1 minute in seconds

    if (timeDifference > undoTimeLimit) {
      return res.status(400).json({
        success: false,
        message: 'Undo time limit exceeded. You can only undo upvotes within 1 minute.'
      });
    }

    // Remove upvote
    issue.upvotes.users.splice(upvoteIndex, 1);
    issue.upvotes.count = issue.upvotes.users.length;
    await issue.save();

    return res.json({
      success: true,
      message: 'Upvote removed successfully',
      upvoteCount: issue.upvotes.count
    });

  } catch (error) {
    console.error('Error removing upvote:', error);
    return res.status(500).json({
      success: false,
      message: 'Error removing upvote',
      error: error.message
    });
  }
});

export default router;
