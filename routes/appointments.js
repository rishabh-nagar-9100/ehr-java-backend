const express = require('express');
const Appointment = require('../models/Appointment');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/appointments
// @desc    Get appointments
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const query = { hospitalId: req.hospitalId };
    
    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      query.appointmentDate = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'firstName lastName email phone')
      .populate('doctorId', 'specialization department')
      .populate('createdBy', 'name')
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      data: appointments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/appointments
// @desc    Create new appointment
// @access  Private
router.post('/', [
  auth,
  authorize('doctor', 'hospitalOwner', 'staff')
], async (req, res) => {
  try {
    const appointmentData = {
      ...req.body,
      hospitalId: req.hospitalId,
      createdBy: req.user._id
    };

    const appointment = new Appointment(appointmentData);
    await appointment.save();

    // Populate the created appointment
    await appointment.populate([
      { path: 'patientId', select: 'firstName lastName email phone' },
      { path: 'doctorId', select: 'specialization department' },
      { path: 'createdBy', select: 'name' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment
    });

  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/appointments/:id
// @desc    Update appointment
// @access  Private
router.put('/:id', [
  auth,
  authorize('doctor', 'hospitalOwner', 'staff')
], async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.hospitalId },
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'patientId', select: 'firstName lastName email phone' },
      { path: 'doctorId', select: 'specialization department' },
      { path: 'createdBy', select: 'name' }
    ]);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: appointment
    });

  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/appointments/:id
// @desc    Cancel appointment
// @access  Private
router.delete('/:id', [
  auth,
  authorize('doctor', 'hospitalOwner', 'staff')
], async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.hospitalId },
      { status: 'Cancelled' },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });

  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/appointments/upcoming
// @desc    Get upcoming appointments
// @access  Private
router.get('/upcoming', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingAppointments = await Appointment.find({
      hospitalId: req.hospitalId,
      appointmentDate: { $gte: today },
      status: { $in: ['Scheduled', 'Confirmed'] }
    })
    .populate('patientId', 'firstName lastName email phone')
    .populate('doctorId', 'specialization department')
    .sort({ appointmentDate: 1, appointmentTime: 1 })
    .limit(10);

    res.json({
      success: true,
      data: upcomingAppointments
    });

  } catch (error) {
    console.error('Get upcoming appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/appointments/doctor/:doctorId
// @desc    Get appointments for specific doctor
// @access  Private
router.get('/doctor/:doctorId', [
  auth,
  authorize('doctor', 'hospitalOwner', 'staff')
], async (req, res) => {
  try {
    const appointments = await Appointment.find({
      doctorId: req.params.doctorId,
      hospitalId: req.hospitalId
    })
    .populate('patientId', 'firstName lastName email phone')
    .sort({ appointmentDate: 1, appointmentTime: 1 });

    res.json({
      success: true,
      data: appointments
    });

  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
