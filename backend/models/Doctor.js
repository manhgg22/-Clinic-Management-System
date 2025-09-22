const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  specialty: {
    type: String,
    required: [true, 'Please add a specialty'],
    enum: [
      'CARDIOLOGY',
      'DERMATOLOGY', 
      'NEUROLOGY',
      'ORTHOPEDICS',
      'PEDIATRICS',
      'PSYCHIATRY',
      'RADIOLOGY',
      'SURGERY',
      'INTERNAL_MEDICINE',
      'FAMILY_MEDICINE',
      'EMERGENCY_MEDICINE',
      'ANESTHESIOLOGY'
    ]
  },
  licenseNumber: {
    type: String,
    required: [true, 'Please add a license number'],
    unique: true,
    trim: true
  },
  experience: {
    type: Number,
    min: [0, 'Experience cannot be negative'],
    max: [50, 'Experience cannot exceed 50 years']
  },
  education: [{
    degree: String,
    institution: String,
    year: Number
  }],
  consultationFee: {
    type: Number,
    min: [0, 'Consultation fee cannot be negative'],
    default: 0
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5'],
    default: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Populate user data when querying doctor
DoctorSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name email phone isActive'
  });
  next();
});

// Virtual for schedules
DoctorSchema.virtual('schedules', {
  ref: 'Schedule',
  localField: '_id',
  foreignField: 'doctor',
  justOne: false
});

// Virtual for appointments
DoctorSchema.virtual('appointments', {
  ref: 'Appointment',
  localField: '_id',
  foreignField: 'doctor',
  justOne: false
});

module.exports = mongoose.model('Doctor', DoctorSchema);
