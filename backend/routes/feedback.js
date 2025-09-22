const express = require('express');
const Feedback = require('../models/Feedback');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/feedback
 * @desc    Get all feedback with filtering
 * @access  Private (Receptionist, Admin)
 */
router.get('/', auth, authorize('RECEPTIONIST', 'ADMIN'), async (req, res) => {
  try {
    const {
      doctorId,
      patientId,
      rating,
      status = 'APPROVED',
      isPublic,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let filter = {};

    // Filter by doctor
    if (doctorId) filter.doctor = doctorId;

    // Filter by patient
    if (patientId) filter.patient = patientId;

    // Filter by rating
    if (rating) {
      if (rating.includes('-')) {
        const [minRating, maxRating] = rating.split('-').map(Number);
        filter.rating = { $gte: minRating, $lte: maxRating };
      } else {
        filter.rating = parseInt(rating);
      }
    }

    // Filter by status
    if (status) filter.status = status;

    // Filter by public visibility
    if (isPublic !== undefined) filter.isPublic = isPublic === 'true';

    // Build sort object
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const feedback = await Feedback.find(filter)
      .populate([
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
      ])
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortOptions);

    const total = await Feedback.countDocuments(filter);

    // Calculate average rating
    const ratingStats = await Feedback.aggregate([
      { $match: { ...filter, status: 'APPROVED' } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    // Calculate rating distribution
    let ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (ratingStats.length > 0 && ratingStats[0].ratingDistribution) {
      ratingStats[0].ratingDistribution.forEach(rating => {
        ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
      });
    }

    res.json({
      success: true,
      data: {
        feedback,
        statistics: {
          averageRating: ratingStats.length > 0 
            ? Math.round(ratingStats[0].averageRating * 10) / 10 
            : 0,
          totalReviews: ratingStats.length > 0 ? ratingStats[0].totalReviews : 0,
          ratingDistribution
        },
        pagination: {
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching feedback'
    });
  }
});

/**
 * @route   GET /api/feedback/:id
 * @desc    Get single feedback
 * @access  Private (Receptionist, Admin)
 */
router.get('/:id', auth, authorize('RECEPTIONIST', 'ADMIN'), async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate([
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
          path: 'appointment',
          select: 'appointmentDate appointmentTime reason status'
        },
        {
          path: 'adminResponse.respondedBy',
          select: 'name role'
        }
      ]);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.json({
      success: true,
      data: { feedback }
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching feedback'
    });
  }
});

/**
 * @route   PATCH /api/feedback/:id/status
 * @desc    Update feedback status (approve/reject)
 * @access  Private (Receptionist, Admin)
 */
router.patch('/:id/status', auth, authorize('RECEPTIONIST', 'ADMIN'), async (req, res) => {
  try {
    const { status, adminMessage } = req.body;

    if (!status || !['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (APPROVED, REJECTED, PENDING)'
      });
    }

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    feedback.status = status;

    // Add admin response if provided
    if (adminMessage) {
      feedback.adminResponse = {
        message: adminMessage,
        respondedBy: req.user.id,
        respondedAt: new Date()
      };
    }

    await feedback.save();

    const updatedFeedback = await Feedback.findById(feedback._id)
      .populate([
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
          path: 'adminResponse.respondedBy',
          select: 'name role'
        }
      ]);

    res.json({
      success: true,
      message: 'Feedback status updated successfully',
      data: { feedback: updatedFeedback }
    });
  } catch (error) {
    console.error('Update feedback status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating feedback status'
    });
  }
});

/**
 * @route   PATCH /api/feedback/:id/visibility
 * @desc    Update feedback visibility (public/private)
 * @access  Private (Receptionist, Admin)
 */
router.patch('/:id/visibility', auth, authorize('RECEPTIONIST', 'ADMIN'), async (req, res) => {
  try {
    const { isPublic } = req.body;

    if (typeof isPublic !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isPublic must be a boolean value'
      });
    }

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    feedback.isPublic = isPublic;
    await feedback.save();

    res.json({
      success: true,
      message: 'Feedback visibility updated successfully',
      data: { 
        feedbackId: feedback._id,
        isPublic: feedback.isPublic 
      }
    });
  } catch (error) {
    console.error('Update feedback visibility error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating feedback visibility'
    });
  }
});

/**
 * @route   GET /api/feedback/doctor/:doctorId/stats
 * @desc    Get feedback statistics for a specific doctor
 * @access  Private (Receptionist, Admin)
 */
router.get('/doctor/:doctorId/stats', auth, authorize('RECEPTIONIST', 'ADMIN'), async (req, res) => {
  try {
    const { doctorId } = req.params;

    const stats = await Feedback.aggregate([
      {
        $match: { 
          doctor: mongoose.Types.ObjectId(doctorId),
          status: 'APPROVED'
        }
      },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          averageDoctorProfessionalism: { $avg: '$categories.doctorProfessionalism' },
          averageWaitTime: { $avg: '$categories.waitTime' },
          averageFacilityCleaniness: { $avg: '$categories.facilityCleaniness' },
          averageStaffFriendliness: { $avg: '$categories.staffFriendliness' },
          averageOverallExperience: { $avg: '$categories.overallExperience' },
          recommendationCount: {
            $sum: { $cond: ['$wouldRecommend', 1, 0] }
          },
          ratingBreakdown: {
            $push: '$rating'
          }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.json({
        success: true,
        data: {
          totalReviews: 0,
          averageRating: 0,
          recommendationRate: 0,
          categoryAverages: {},
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        }
      });
    }

    const stat = stats[0];

    // Calculate rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    stat.ratingBreakdown.forEach(rating => {
      ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
    });

    // Get recent feedback
    const recentFeedback = await Feedback.find({
      doctor: doctorId,
      status: 'APPROVED',
      isPublic: true
    })
    .populate([
      {
        path: 'patient',
        select: 'user',
        populate: {
          path: 'user',
          select: 'name'
        }
      },
      {
        path: 'appointment',
        select: 'appointmentDate'
      }
    ])
    .sort({ createdAt: -1 })
    .limit(5);

    res.json({
      success: true,
      data: {
        totalReviews: stat.totalReviews,
        averageRating: Math.round(stat.averageRating * 10) / 10,
        recommendationRate: stat.totalReviews > 0 
          ? Math.round((stat.recommendationCount / stat.totalReviews) * 100)
          : 0,
        categoryAverages: {
          doctorProfessionalism: stat.averageDoctorProfessionalism 
            ? Math.round(stat.averageDoctorProfessionalism * 10) / 10 
            : null,
          waitTime: stat.averageWaitTime 
            ? Math.round(stat.averageWaitTime * 10) / 10 
            : null,
          facilityCleaniness: stat.averageFacilityCleaniness 
            ? Math.round(stat.averageFacilityCleaniness * 10) / 10 
            : null,
          staffFriendliness: stat.averageStaffFriendliness 
            ? Math.round(stat.averageStaffFriendliness * 10) / 10 
            : null,
          overallExperience: stat.averageOverallExperience 
            ? Math.round(stat.averageOverallExperience * 10) / 10 
            : null
        },
        ratingDistribution,
        recentFeedback: recentFeedback.map(fb => ({
          id: fb._id,
          rating: fb.rating,
          comment: fb.comment,
          patientName: fb.anonymous ? 'Anonymous' : fb.patient?.user?.name || 'Unknown',
          appointmentDate: fb.appointment?.appointmentDate,
          createdAt: fb.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Get doctor feedback stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching doctor feedback statistics'
    });
  }
});

/**
 * @route   DELETE /api/feedback/:id
 * @desc    Delete feedback (soft delete by marking as rejected)
 * @access  Private (Admin only)
 */
router.delete('/:id', auth, authorize('ADMIN'), async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Soft delete by marking as rejected and hiding
    feedback.status = 'REJECTED';
    feedback.isPublic = false;
    feedback.adminResponse = {
      message: 'Feedback removed by administrator',
      respondedBy: req.user.id,
      respondedAt: new Date()
    };

    await feedback.save();

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting feedback'
    });
  }
});

module.exports = router;
