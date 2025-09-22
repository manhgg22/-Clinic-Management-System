const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.ObjectId,
    ref: 'Doctor',
    required: [true, 'Schedule must belong to a doctor']
  },
  date: {
    type: Date,
    required: [true, 'Please specify the date']
  },
  startTime: {
    type: String,
    required: [true, 'Please specify start time'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use HH:MM format']
  },
  endTime: {
    type: String,
    required: [true, 'Please specify end time'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use HH:MM format']
  },
  slotDuration: {
    type: Number,
    default: 30, // minutes
    min: [15, 'Minimum slot duration is 15 minutes'],
    max: [120, 'Maximum slot duration is 120 minutes']
  },
  maxPatients: {
    type: Number,
    default: 1,
    min: [1, 'At least 1 patient per slot'],
    max: [10, 'Maximum 10 patients per slot']
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringType: {
    type: String,
    enum: ['DAILY', 'WEEKLY', 'MONTHLY'],
    required: function() {
      return this.isRecurring;
    }
  },
  recurringEndDate: {
    type: Date,
    required: function() {
      return this.isRecurring;
    }
  },
  dayOfWeek: {
    type: String,
    enum: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'CANCELLED', 'COMPLETED'],
    default: 'ACTIVE'
  },
  notes: {
    type: String,
    maxlength: [200, 'Notes cannot be more than 200 characters']
  },
  location: {
    type: String,
    default: 'Main Clinic'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient queries
ScheduleSchema.index({ doctor: 1, date: 1 });
ScheduleSchema.index({ date: 1, startTime: 1 });

// Validate that end time is after start time
ScheduleSchema.pre('save', function(next) {
  const start = this.startTime.split(':').map(Number);
  const end = this.endTime.split(':').map(Number);
  
  const startMinutes = start[0] * 60 + start[1];
  const endMinutes = end[0] * 60 + end[1];
  
  if (endMinutes <= startMinutes) {
    next(new Error('End time must be after start time'));
  }
  
  // Set day of week based on date
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  this.dayOfWeek = days[this.date.getDay()];
  
  next();
});

// Populate doctor information
ScheduleSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'doctor',
    select: 'user specialty consultationFee',
    populate: {
      path: 'user',
      select: 'name email phone'
    }
  });
  next();
});

// Virtual for total available slots
ScheduleSchema.virtual('totalSlots').get(function() {
  const start = this.startTime.split(':').map(Number);
  const end = this.endTime.split(':').map(Number);
  
  const startMinutes = start[0] * 60 + start[1];
  const endMinutes = end[0] * 60 + end[1];
  const totalMinutes = endMinutes - startMinutes;
  
  return Math.floor(totalMinutes / this.slotDuration);
});

// Virtual for appointments count
ScheduleSchema.virtual('appointmentsCount', {
  ref: 'Appointment',
  localField: '_id',
  foreignField: 'schedule',
  count: true
});

module.exports = mongoose.model('Schedule', ScheduleSchema);
