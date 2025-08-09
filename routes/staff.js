const express = require('express');
const Staff = require('../models/Staff');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/staff
// @desc    Get all staff
// @access  Private (hospitalOwner, staff)
router.get('/', [
  auth,
  authorize('hospitalOwner', 'staff')
], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { hospitalId: req.hospitalId };

    // Filter by department
    if (req.query.department) {
      query.department = req.query.department;
    }

    // Filter by role
    if (req.query.role) {
      query.role = req.query.role;
    }

    // Search by name or employee ID
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { employeeId: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex }
      ];
    }

    const staff = await Staff.find(query)
      .populate('userId', 'email role createdAt')
      .sort({ firstName: 1, lastName: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Staff.countDocuments(query);

    res.json({
      success: true,
      data: staff,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/staff
// @desc    Create new staff member
// @access  Private (hospitalOwner only)
router.post('/', [
  auth,
  authorize('hospitalOwner')
], async (req, res) => {
  try {
    const { userData, staffData } = req.body;

    // Create user account first
    const userAccountData = {
      ...userData,
      role: 'staff',
      hospitalId: req.hospitalId
    };

    const user = new User(userAccountData);
    await user.save();

    // Create staff profile
    const staffProfileData = {
      ...staffData,
      userId: user._id,
      hospitalId: req.hospitalId
    };

    const staff = new Staff(staffProfileData);
    await staff.save();

    // Populate the created staff member
    await staff.populate('userId', 'email role createdAt');

    res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      data: staff
    });

  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/staff/:id
// @desc    Update staff member
// @access  Private (hospitalOwner only)
router.put('/:id', [
  auth,
  authorize('hospitalOwner')
], async (req, res) => {
  try {
    const staff = await Staff.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.hospitalId },
      req.body,
      { new: true, runValidators: true }
    ).populate('userId', 'email role createdAt');

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      message: 'Staff member updated successfully',
      data: staff
    });

  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/staff/:id
// @desc    Deactivate staff member
// @access  Private (hospitalOwner only)
router.delete('/:id', [
  auth,
  authorize('hospitalOwner')
], async (req, res) => {
  try {
    const staff = await Staff.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.hospitalId },
      { status: 'inactive' },
      { new: true }
    );

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      message: 'Staff member deactivated successfully',
      data: staff
    });

  } catch (error) {
    console.error('Deactivate staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/staff/departments
// @desc    Get staff by departments
// @access  Private
router.get('/departments', auth, async (req, res) => {
  try {
    const departments = await Staff.aggregate([
      { $match: { hospitalId: req.hospitalId, status: 'active' } },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          staff: {
            $push: {
              _id: '$_id',
              firstName: '$firstName',
              lastName: '$lastName',
              role: '$role',
              employeeId: '$employeeId'
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: departments
    });

  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
