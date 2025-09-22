const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.ObjectId,
    ref: 'Patient',
    required: [true, 'Appointment must have a patient']
  },
  doctor: {
    type: mongoose.Schema.ObjectId,
    ref: 'Doctor',
    required: [true, 'Appointment must have a doctor']
  },
  schedule: {
    type: mongoose.Schema.ObjectId,
    ref: 'Schedule',
    required: [true, 'Appointment must be linked to a schedule']
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Please specify appointment date']
  },
  appointmentTime: {
    type: String,
    required: [true, 'Please specify appointment time'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use HH:MM format']
  },
  duration: {
    type: Number,
    default: 30, // minutes
    min: [15, 'Minimum duration is 15 minutes'],
    max: [120, 'Maximum duration is 120 minutes']
  },
  reason: {
    type: String,
    required: [true, 'Please specify reason for appointment'],
    maxlength: [200, 'Reason cannot be more than 200 characters']
  },
  status: {
    type: String,
    enum: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
    default: 'SCHEDULED'
  },
  priority: {
    type: String,
    enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
    default: 'NORMAL'
  },
  appointmentType: {
    type: String,
    enum: ['CONSULTATION', 'FOLLOW_UP', 'EMERGENCY', 'ROUTINE_CHECKUP'],
    default: 'CONSULTATION'
  },
  symptoms: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  consultationFee: {
    type: Number,
    min: [0, 'Fee cannot be negative']
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'REFUNDED'],
    default: 'PENDING'
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  cancelledBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  cancellationReason: {
    type: String,
    maxlength: [200, 'Cancellation reason cannot be more than 200 characters']
  },
  cancelledAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
AppointmentSchema.index({ patient: 1, appointmentDate: 1 });
AppointmentSchema.index({ doctor: 1, appointmentDate: 1 });
AppointmentSchema.index({ appointmentDate: 1, appointmentTime: 1 });
AppointmentSchema.index({ status: 1 });

// Populate patient and doctor information
AppointmentSchema.pre(/^find/, function(next) {
  this.populate([
    {
      path: 'patient',
      select: 'user dateOfBirth gender',
      populate: {
        path: 'user',
        select: 'name email phone'
      }
    },
    {
      path: 'doctor',
      select: 'user specialty consultationFee',
      populate: {
        path: 'user',
        select: 'name email phone'
      }
    },
    {
      path: 'schedule',
      select: 'date startTime endTime location'
    },
    {
      path: 'createdBy',
      select: 'name email role'
    }
  ]);
  next();
});

// Set consultation fee before saving
AppointmentSchema.pre('save', async function(next) {
  if (!this.consultationFee && this.doctor) {
    const doctor = await mongoose.model('Doctor').findById(this.doctor);
    if (doctor) {
      this.consultationFee = doctor.consultationFee;
    }
  }
  next();
});

// Handle cancellation
AppointmentSchema.methods.cancel = function(cancelledBy, reason) {
  this.status = 'CANCELLED';
  this.cancelledBy = cancelledBy;
  this.cancellationReason = reason;
  this.cancelledAt = new Date();
  return this.save();
};

// Check if appointment can be cancelled
AppointmentSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const appointmentDateTime = new Date(this.appointmentDate);
  const [hours, minutes] = this.appointmentTime.split(':').map(Number);
  appointmentDateTime.setHours(hours, minutes, 0, 0);
  
  // Can cancel if appointment is at least 2 hours away and not already completed/cancelled
  const timeDiff = appointmentDateTime.getTime() - now.getTime();
  const hoursUntilAppointment = timeDiff / (1000 * 60 * 60);
  
  return hoursUntilAppointment >= 2 && 
         !['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(this.status);
};

// Virtual for appointment datetime
AppointmentSchema.virtual('appointmentDateTime').get(function() {
  const date = new Date(this.appointmentDate);
  const [hours, minutes] = this.appointmentTime.split(':').map(Number);
  date.setHours(hours, minutes, 0, 0);
  return date;
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
