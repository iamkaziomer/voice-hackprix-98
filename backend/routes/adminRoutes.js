import express from 'express';
import mongoose from 'mongoose';
import Issue from '../models/issue.js';
import User from '../models/user.js';
import Admin from '../models/admin.js';
import AdminAction from '../models/adminAction.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Get admin details
    const admin = await Admin.findById(req.userId);
    if (!admin || !admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Admin account not found or inactive'
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying admin access'
    });
  }
};

// Get admin dashboard analytics
router.get('/dashboard', auth, requireAdmin, async (req, res) => {
  try {
    const admin = req.admin;
    
    // Build query based on admin's region (if not superadmin)
    const regionFilter = admin.role === 'superadmin' ? {} : { colony: admin.region };

    const [
      totalIssues,
      openIssues,
      inProgressIssues,
      resolvedIssues,
      totalUsers,
      recentIssues,
      topCategories
    ] = await Promise.all([
      Issue.countDocuments(regionFilter),
      Issue.countDocuments({ ...regionFilter, status: 'open' }),
      Issue.countDocuments({ ...regionFilter, status: 'in-progress' }),
      Issue.countDocuments({ ...regionFilter, status: 'resolved' }),
      User.countDocuments(),
      Issue.find(regionFilter)
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('reporter', 'name email'),
      Issue.aggregate([
        { $match: regionFilter },
        { $group: { _id: '$concernAuthority', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    res.json({
      success: true,
      analytics: {
        totalIssues,
        openIssues,
        inProgressIssues,
        resolvedIssues,
        totalUsers,
        recentIssues,
        topCategories
      }
    });

  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard analytics'
    });
  }
});

// Get all issues for admin
router.get('/issues', auth, requireAdmin, async (req, res) => {
  try {
    const admin = req.admin;
    const { 
      page = 1, 
      limit = 20, 
      status, 
      category, 
      sort = 'createdAt',
      order = 'desc',
      search 
    } = req.query;

    // Build query
    let query = {};
    
    // Region filter (if not superadmin)
    if (admin.role !== 'superadmin') {
      query.colony = admin.region;
    }

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Category filter
    if (category && category !== 'all') {
      query.concernAuthority = category;
    }

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { colony: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const [issues, totalCount] = await Promise.all([
      Issue.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('reporter', 'name email phone')
        .populate('comments.user', 'name'),
      Issue.countDocuments(query)
    ]);

    res.json({
      success: true,
      issues,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: skip + issues.length < totalCount,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Admin get issues error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching issues'
    });
  }
});

// Update issue status
router.patch('/issues/:id/status', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;
    const admin = req.admin;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid issue ID'
      });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Check if admin can manage this issue (region check)
    if (admin.role !== 'superadmin' && issue.colony !== admin.region) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage issues in your region'
      });
    }

    const oldStatus = issue.status;
    issue.status = status;
    issue.updatedAt = new Date();

    // Add admin comment if provided
    if (comment) {
      issue.comments.push({
        user: admin._id,
        text: `[ADMIN UPDATE] ${comment}`,
        createdAt: new Date()
      });
    }

    await issue.save();

    // Log admin action
    await AdminAction.create({
      admin: admin._id,
      issue: issue._id,
      actionType: 'status_change',
      oldStatus,
      newStatus: status,
      comment
    });

    res.json({
      success: true,
      message: 'Issue status updated successfully',
      issue
    });

  } catch (error) {
    console.error('Update issue status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating issue status'
    });
  }
});

// Delete issue
router.delete('/issues/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const admin = req.admin;

    if (!admin.permissions.canDeleteIssues) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete issues'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid issue ID'
      });
    }

    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Check region permission
    if (admin.role !== 'superadmin' && issue.colony !== admin.region) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete issues in your region'
      });
    }

    await Issue.findByIdAndDelete(id);

    // Log admin action
    await AdminAction.create({
      admin: admin._id,
      issue: issue._id,
      actionType: 'issue_deleted',
      comment: reason || 'Issue deleted by admin'
    });

    res.json({
      success: true,
      message: 'Issue deleted successfully'
    });

  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting issue'
    });
  }
});

export default router;
