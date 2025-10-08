const express = require('express');
const { body, validationResult } = require('express-validator');
const Activity = require('../models/Activity');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/activities
// @desc    Get all activities with filtering
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      type, 
      status, 
      assignedTo, 
      customer,
      team,
      dueDate,
      overdue = false
    } = req.query;

    const filter = { isActive: true };

    if (type) filter.type = type;
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (customer) filter.customer = customer;
    if (team) filter.team = team;

    if (overdue === 'true') {
      filter.dueDate = { $lt: new Date() };
      filter.status = 'pending';
    }

    if (dueDate) {
      filter.dueDate = {
        $gte: new Date(dueDate),
        $lt: new Date(new Date(dueDate).getTime() + 24 * 60 * 60 * 1000)
      };
    }

    const activities = await Activity.find(filter)
      .populate('assignedTo', 'name email')
      .populate('customer', 'name email company')
      .populate('opportunity', 'title value')
      .populate('attendees', 'name email')
      .sort({ dueDate: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Activity.countDocuments(filter);

    res.json({
      status: 'success',
      data: {
        activities,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   POST /api/activities
// @desc    Create new activity
// @access  Private
router.post('/', [
  auth,
  body('type').isIn(['call', 'email', 'meeting', 'task', 'note', 'demo', 'proposal', 'follow_up']).withMessage('Invalid activity type'),
  body('subject').trim().isLength({ min: 1 }).withMessage('Activity subject is required'),
  body('assignedTo').isMongoId().withMessage('Valid assigned user is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const activityData = {
      ...req.body,
      team: req.body.team || req.user.team
    };

    const activity = new Activity(activityData);
    await activity.save();

    await activity.populate('assignedTo', 'name email');
    await activity.populate('customer', 'name email company');
    await activity.populate('opportunity', 'title value');

    res.status(201).json({
      status: 'success',
      message: 'Activity created successfully',
      data: {
        activity
      }
    });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   PUT /api/activities/:id
// @desc    Update activity
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('assignedTo', 'name email')
    .populate('customer', 'name email company')
    .populate('opportunity', 'title value');

    if (!activity) {
      return res.status(404).json({
        status: 'error',
        message: 'Activity not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Activity updated successfully',
      data: {
        activity
      }
    });
  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/activities/:id
// @desc    Delete activity
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!activity) {
      return res.status(404).json({
        status: 'error',
        message: 'Activity not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Activity deleted successfully'
    });
  } catch (error) {
    console.error('Delete activity error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

module.exports = router;
