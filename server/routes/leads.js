const express = require('express');
const { body, validationResult } = require('express-validator');
const Lead = require('../models/Lead');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      source, 
      assignedTo, 
      team,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { isActive: true };

    if (status) filter.status = status;
    if (source) filter.source = source;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (team) filter.team = team;

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const leads = await Lead.find(filter)
      .populate('assignedTo', 'name email')
      .populate('team', 'name')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Lead.countDocuments(filter);

    res.json({
      status: 'success',
      data: {
        leads,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

router.post('/', [
  auth,
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required')
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

    const leadData = {
      ...req.body,
      assignedTo: req.body.assignedTo || req.user._id
    };

    const lead = new Lead(leadData);
    await lead.save();

    await lead.populate('assignedTo', 'name email');
    await lead.populate('team', 'name');

    res.status(201).json({
      status: 'success',
      message: 'Lead created successfully',
      data: { lead }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

module.exports = router;
