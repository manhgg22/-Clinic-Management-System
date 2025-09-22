const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Appointment',
    required: [true, 'Feedback must be linked to an appointment']
  },
  patient: {
    type: mongoose.Schema.ObjectId,
    ref: 'Patient',
    required: [true, 'Feedback must have a patient']
  },
  doctor: {
    type: mongoose.Schema.ObjectId,
    ref: 'Doctor',
    required: [true, 'Feedback must have a doctor']
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  comment: {
    type: String,
    required: [true, 'Please provide a comment'],
    maxlength: [500, 'Comment cannot be more than 500 characters'],
    trim: true
  },
  categories: {
    doctorProfessionalism: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5']
    },
    waitTime: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5']
    },
    facilityCleaniness: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5']
    },
    staffFriendliness: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5']
    },
    overallExperience: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5']
    }
  },
  wouldRecommend: {
    type: Boolean,
    required: [true, 'Please specify if you would recommend']
  },
  anonymous: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  adminResponse: {
    message: String,
    respondedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  helpfulVotes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
FeedbackSchema.index({ doctor: 1, rating: -1 });
FeedbackSchema.index({ patient: 1, createdAt: -1 });
FeedbackSchema.index({ appointment: 1 }, { unique: true }); // One feedback per appointment
FeedbackSchema.index({ status: 1 });

// Populate related data
FeedbackSchema.pre(/^find/, function(next) {
  this.populate([
    {
      path: 'patient',
      select: 'user',
      populate: {
        path: 'user',
        select: 'name'
      }
    },
    {
      path: 'doctor',
      select: 'user specialty',
      populate: {
        path: 'user',
        select: 'name'
      }
    },
    {
      path: 'appointment',
      select: 'appointmentDate appointmentTime reason'
    },
    {
      path: 'adminResponse.respondedBy',
      select: 'name role'
    }
  ]);
  next();
});

// Calculate average rating for categories
FeedbackSchema.virtual('averageCategoryRating').get(function() {
  const categories = this.categories;
  if (!categories) return null;
  
  const ratings = Object.values(categories).filter(rating => rating != null);
  if (ratings.length === 0) return null;
  
  const sum = ratings.reduce((total, rating) => total + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10; // Round to 1 decimal place
});

// Static method to calculate doctor's average rating
FeedbackSchema.statics.calcAverageRating = async function(doctorId) {
  const stats = await this.aggregate([
    {
      $match: { 
        doctor: doctorId,
        status: 'APPROVED'
      }
    },
    {
      $group: {
        _id: '$doctor',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  try {
    if (stats.length > 0) {
      await mongoose.model('Doctor').findByIdAndUpdate(doctorId, {
        rating: Math.round(stats[0].averageRating * 10) / 10,
        totalReviews: stats[0].totalReviews
      });
    } else {
      await mongoose.model('Doctor').findByIdAndUpdate(doctorId, {
        rating: 5,
        totalReviews: 0
      });
    }
  } catch (error) {
    console.error('Error updating doctor rating:', error);
  }
};

// Update doctor rating after saving feedback
FeedbackSchema.post('save', function() {
  this.constructor.calcAverageRating(this.doctor);
});

// Update doctor rating after removing feedback
FeedbackSchema.post('remove', function() {
  this.constructor.calcAverageRating(this.doctor);
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
