const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hospitalId: {
    type: String,
    required: true
  },
  licenseNumber: String,
  specialization: String,
  department: String,
  experience: Number,
  qualifications: [String],
  consultationFee: Number,
  availableHours: {
    monday: { start: String, end: String },
    tuesday: { start: String, end: String },
    wednesday: { start: String, end: String },
    thursday: { start: String, end: String },
    friday: { start: String, end: String },
    saturday: { start: String, end: String },
    sunday: { start: String, end: String }
  },
  status: {
    type: String,
    enum: ['Available', 'Busy', 'Off Duty'],
    default: 'Available'
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalPatients: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Doctor', doctorSchema);
