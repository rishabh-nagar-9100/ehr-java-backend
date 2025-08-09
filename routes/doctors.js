const express = require('express');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/doctors
// @desc    Get all doctors
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const doctors = await Doctor.find({ hospitalId: req.hospitalId })
      .populate('userId', 'name email phone avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: doctors
    });

  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/doctors/:id
// @desc    Get single doctor
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      _id: req.params.id,
      hospitalId: req.hospitalId
    }).populate('userId', 'name email phone avatar');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      data: doctor
    });

  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/doctors
// @desc    Create new doctor profile
// @access  Private
router.post('/', [
  auth,
  authorize('hospitalOwner', 'doctor')
], async (req, res) => {
  try {
    const doctorData = {
      ...req.body,
      hospitalId: req.hospitalId,
      userId: req.user._id
    };

    const doctor = new Doctor(doctorData);
    await doctor.save();

    // Update user role to doctor if not already
    await User.findByIdAndUpdate(req.user._id, { role: 'doctor' });

    res.status(201).json({
      success: true,
      message: 'Doctor profile created successfully',
      data: doctor
    });

  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/doctors/:id
// @desc    Update doctor
// @access  Private
router.put('/:id', [
  auth,
  authorize('hospitalOwner', 'doctor')
], async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.hospitalId },
      req.body,
      { new: true, runValidators: true }
    ).populate('userId', 'name email phone avatar');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      message: 'Doctor updated successfully',
      data: doctor
    });

  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/doctors/available
// @desc    Get available doctors
// @access  Private
router.get('/available', auth, async (req, res) => {
  try {
    const availableDoctors = await Doctor.find({
      hospitalId: req.hospitalId,
      status: 'Available'
    }).populate('userId', 'name email phone avatar');

    res.json({
      success: true,
      data: availableDoctors
    });

  } catch (error) {
    console.error('Get available doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
