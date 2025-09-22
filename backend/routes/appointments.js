const express = require('express');
const Appointment = require('../models/Appointment');
const Schedule = require('../models/Schedule');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/appointments
 * @desc    Get all appointments with filtering
 * @access  Private (Receptionist, Admin)
 */
router.get('/', auth, authorize('RECEPTIONIST', 'ADMIN'), async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      status,
      date,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = req.query;

    let filter = {};

    // Filter by patient
    if (patientId) filter.patient = patientId;

    // Filter by doctor
    if (doctorId) filter.doctor = doctorId;

    // Filter by status
    if (status) filter.status = status;

    // Filter by date
    if (date) {
      const targetDate = new Date(date);
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);
      filter.appointmentDate = {
        $gte: targetDate,
        $lt: nextDate
      };
    } else if (startDate && endDate) {
      filter.appointmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const appointments = await Appointment.find(filter)
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
          path: 'schedule',
          select: 'date startTime endTime location'
        },
        {
          path: 'createdBy',
          select: 'name role'
        }
      ])
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ appointmentDate: -1, appointmentTime: 1 });

    const total = await Appointment.countDocuments(filter);

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching appointments'
    });
  }
});

/**
 * @route   GET /api/appointments/:id
 * @desc    Get single appointment
 * @access  Private (Receptionist, Admin)
 */
router.get('/:id', auth, authorize('RECEPTIONIST', 'ADMIN'), async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate([
        {
          path: 'patient',
          select: 'user dateOfBirth gender address emergencyContact',
          populate: {
            path: 'user',
            select: 'name email phone'
          }
        },
        {
          path: 'doctor',
          select: 'user specialty consultationFee experience',
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
          select: 'name role'
        },
        {
          path: 'cancelledBy',
          select: 'name role'
        }
      ]);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      data: { appointment }
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching appointment'
    });
  }
});

/**
 * @route   POST /api/appointments
 * @desc    Book new appointment
 * @access  Private (Receptionist, Admin)
 */
router.post('/', auth, authorize('RECEPTIONIST', 'ADMIN'), async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      scheduleId,
      appointmentDate,
      appointmentTime,
      reason,
      symptoms = [],
      priority = 'NORMAL',
      appointmentType = 'CONSULTATION',
      notes
    } = req.body;

    // Validate required fields
    if (!patientId || !doctorId || !scheduleId || !appointmentDate || !appointmentTime || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Patient, doctor, schedule, date, time, and reason are required'
      });
    }

    // Verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Verify schedule exists and is active
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule || schedule.status !== 'ACTIVE') {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found or not active'
      });
    }

    // Check if appointment date matches schedule date
    const appointmentDateObj = new Date(appointmentDate);
    const scheduleDateObj = new Date(schedule.date);
    
    if (appointmentDateObj.toDateString() !== scheduleDateObj.toDateString()) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date does not match schedule date'
      });
    }

    // Check if appointment time is within schedule time range
    const [scheduleStartHour, scheduleStartMin] = schedule.startTime.split(':').map(Number);
    const [scheduleEndHour, scheduleEndMin] = schedule.endTime.split(':').map(Number);
    const [appointmentHour, appointmentMin] = appointmentTime.split(':').map(Number);

    const scheduleStartMinutes = scheduleStartHour * 60 + scheduleStartMin;
    const scheduleEndMinutes = scheduleEndHour * 60 + scheduleEndMin;
    const appointmentMinutes = appointmentHour * 60 + appointmentMin;

    if (appointmentMinutes < scheduleStartMinutes || appointmentMinutes >= scheduleEndMinutes) {
      return res.status(400).json({
        success: false,
        message: 'Appointment time is outside schedule hours'
      });
    }

    // Check for existing appointments at the same time
    const existingAppointments = await Appointment.countDocuments({
      doctor: doctorId,
      appointmentDate: appointmentDateObj,
      appointmentTime,
      status: { $in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] }
    });

    if (existingAppointments >= schedule.maxPatients) {
      return res.status(400).json({
        success: false,
        message: 'Time slot is fully booked'
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      schedule: scheduleId,
      appointmentDate: appointmentDateObj,
      appointmentTime,
      reason,
      symptoms,
      priority,
      appointmentType,
      notes,
      consultationFee: doctor.consultationFee,
      createdBy: req.user.id
    });

    // Populate the created appointment
    const populatedAppointment = await Appointment.findById(appointment._id)
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
          path: 'schedule',
          select: 'date startTime endTime location'
        }
      ]);

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: { appointment: populatedAppointment }
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while booking appointment'
    });
  }
});

/**
 * @route   PATCH /api/appointments/:id/status
 * @desc    Update appointment status
 * @access  Private (Receptionist, Admin)
 */
router.patch('/:id/status', auth, authorize('RECEPTIONIST', 'ADMIN'), async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    appointment.status = status;
    if (notes) appointment.notes = notes;

    await appointment.save();

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate([
        {
          path: 'patient',
          select: 'user',
          populate: {
            path: 'user',
            select: 'name email phone'
          }
        },
        {
          path: 'doctor',
          select: 'user specialty',
          populate: {
            path: 'user',
            select: 'name email phone'
          }
        }
      ]);

    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      data: { appointment: updatedAppointment }
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating appointment status'
    });
  }
});

/**
 * @route   DELETE /api/appointments/:id
 * @desc    Cancel appointment
 * @access  Private (Receptionist, Admin)
 */
router.delete('/:id', auth, authorize('RECEPTIONIST', 'ADMIN'), async (req, res) => {
  try {
    const { reason } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if appointment can be cancelled
    if (!appointment.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'Appointment cannot be cancelled (less than 2 hours remaining or already completed/cancelled)'
      });
    }

    // Cancel the appointment
    await appointment.cancel(req.user.id, reason || 'Cancelled by receptionist');

    const cancelledAppointment = await Appointment.findById(appointment._id)
      .populate([
        {
          path: 'patient',
          select: 'user',
          populate: {
            path: 'user',
            select: 'name email phone'
          }
        },
        {
          path: 'doctor',
          select: 'user specialty',
          populate: {
            path: 'user',
            select: 'name email phone'
          }
        },
        {
          path: 'cancelledBy',
          select: 'name role'
        }
      ]);

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: { appointment: cancelledAppointment }
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling appointment'
    });
  }
});

/**
 * @route   GET /api/appointments/stats/overview
 * @desc    Get appointment statistics
 * @access  Private (Receptionist, Admin)
 */
router.get('/stats/overview', auth, authorize('RECEPTIONIST', 'ADMIN'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.appointmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get appointment counts by status
    const statusStats = await Appointment.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get daily appointment counts
    const dailyStats = await Appointment.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$appointmentDate' } }
          },
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Get top doctors by appointment count
    const topDoctors = await Appointment.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$doctor',
          appointmentCount: { $sum: 1 }
        }
      },
      { $sort: { appointmentCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'doctors',
          localField: '_id',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'doctor.user',
          foreignField: '_id',
          as: 'user'
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        statusStats,
        dailyStats,
        topDoctors
      }
    });
  } catch (error) {
    console.error('Get appointment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching appointment statistics'
    });
  }
});

module.exports = router;
