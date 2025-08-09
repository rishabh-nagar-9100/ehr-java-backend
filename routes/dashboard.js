const express = require('express');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Staff = require('../models/Staff');
const Appointment = require('../models/Appointment');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const hospitalId = req.hospitalId;

    // Get counts for different entities
    const [
      totalPatients,
      totalDoctors,
      totalStaff,
      todayAppointments,
      upcomingAppointments,
      completedAppointments
    ] = await Promise.all([
      Patient.countDocuments({ hospitalId }),
      Doctor.countDocuments({ hospitalId }),
      Staff.countDocuments({ hospitalId, status: 'active' }),
      Appointment.countDocuments({
        hospitalId,
        appointmentDate: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }),
      Appointment.countDocuments({
        hospitalId,
        appointmentDate: { $gt: new Date() },
        status: { $in: ['Scheduled', 'Confirmed'] }
      }),
      Appointment.countDocuments({
        hospitalId,
        status: 'Completed'
      })
    ]);

    res.json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        totalStaff,
        todayAppointments,
        upcomingAppointments,
        completedAppointments
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/dashboard/recent-patients
// @desc    Get recently registered patients
// @access  Private
router.get('/recent-patients', auth, async (req, res) => {
  try {
    const recentPatients = await Patient.find({ hospitalId: req.hospitalId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName email phone createdAt');

    res.json({
      success: true,
      data: recentPatients
    });

  } catch (error) {
    console.error('Get recent patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/dashboard/today-appointments
// @desc    Get today's appointments
// @access  Private
router.get('/today-appointments', auth, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const todayAppointments = await Appointment.find({
      hospitalId: req.hospitalId,
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    })
    .populate('patientId', 'firstName lastName')
    .populate('doctorId', 'specialization')
    .sort({ appointmentTime: 1 })
    .limit(10);

    res.json({
      success: true,
      data: todayAppointments
    });

  } catch (error) {
    console.error('Get today appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/dashboard/appointment-trends
// @desc    Get appointment trends for the last 7 days
// @access  Private
router.get('/appointment-trends', auth, async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const appointmentTrends = await Appointment.aggregate([
      {
        $match: {
          hospitalId: req.hospitalId,
          appointmentDate: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: appointmentTrends
    });

  } catch (error) {
    console.error('Get appointment trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/dashboard/department-stats
// @desc    Get statistics by department
// @access  Private
router.get('/department-stats', [
  auth,
  authorize('hospitalOwner', 'staff')
], async (req, res) => {
  try {
    const departmentStats = await Staff.aggregate([
      {
        $match: {
          hospitalId: req.hospitalId,
          status: 'active'
        }
      },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: departmentStats
    });

  } catch (error) {
    console.error('Get department stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/dashboard/doctor-workload
// @desc    Get doctor workload statistics
// @access  Private
router.get('/doctor-workload', [
  auth,
  authorize('hospitalOwner', 'staff')
], async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const doctorWorkload = await Appointment.aggregate([
      {
        $match: {
          hospitalId: req.hospitalId,
          appointmentDate: { $gte: thirtyDaysAgo },
          status: { $in: ['Completed', 'Confirmed', 'Scheduled'] }
        }
      },
      {
        $group: {
          _id: '$doctorId',
          appointmentCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'doctors',
          localField: '_id',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      {
        $unwind: '$doctor'
      },
      {
        $project: {
          doctorName: {
            $concat: ['$doctor.firstName', ' ', '$doctor.lastName']
          },
          specialization: '$doctor.specialization',
          appointmentCount: 1
        }
      },
      { $sort: { appointmentCount: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: doctorWorkload
    });

  } catch (error) {
    console.error('Get doctor workload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
