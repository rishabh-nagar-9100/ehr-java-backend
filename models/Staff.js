const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    enum: [
      'Administration',
      'Nursing',
      'Laboratory',
      'Pharmacy',
      'Radiology',
      'Reception',
      'Billing',
      'IT Support',
      'Maintenance',
      'Security',
      'Human Resources',
      'Other'
    ]
  },
  role: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  joiningDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  salary: {
    type: Number,
    required: true
  },
  workSchedule: {
    shift: {
      type: String,
      enum: ['Day', 'Night', 'Rotating'],
      default: 'Day'
    },
    workingDays: [String],
    workingHours: {
      start: String,
      end: String
    }
  },
  qualifications: [String],
  certifications: [String],
  status: {
    type: String,
    enum: ['active', 'inactive', 'on-leave'],
    default: 'active'
  },
  hospitalId: {
    type: String,
    required: true
  },
  notes: String
}, {
  timestamps: true
});

// Index for efficient queries
staffSchema.index({ hospitalId: 1, employeeId: 1 });
staffSchema.index({ hospitalId: 1, department: 1 });
staffSchema.index({ firstName: 1, lastName: 1 });

module.exports = mongoose.model('Staff', staffSchema);
