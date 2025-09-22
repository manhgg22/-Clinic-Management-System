const express = require('express');
const Schedule = require('../models/Schedule');
const Doctor = require('../models/Doctor');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/schedules
 * @desc    Get all schedules with filtering
 * @access  Private (Receptionist, Admin)
 */
router.get('/', auth, authorize('RECEPTIONIST', 'ADMIN'), async (req, res) => {
  try {
    const { 
      doctorId, 
      specialty, 
      date, 
      startDate, 
      endDate,
      status = 'ACTIVE',
      page = 1, 
      limit = 10 
    } = req.query;

    let filter = { status };

    // Filter by doctor
    if (doctorId) {
      filter.doctor = doctorId;
    }

    // Filter by date range
    if (date) {
      const targetDate = new Date(date);
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);
      filter.date = {
        $gte: targetDate,
        $lt: nextDate
      };
    } else if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    let schedules = await Schedule.find(filter)
      .populate({
        path: 'doctor',
        select: 'user specialty consultationFee',
        populate: {
          path: 'user',
          select: 'name email phone'
        }
      })
      .populate('appointmentsCount')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: 1, startTime: 1 });

    // Filter by specialty if provided
    if (specialty) {
      schedules = schedules.filter(schedule => 
        schedule.doctor && schedule.doctor.specialty === specialty
      );
    }

    const total = await Schedule.countDocuments(filter);

    res.json({
      success: true,
      data: {
        schedules,
        pagination: {
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching schedules'
    });
  }
});

/**
 * @route   GET /api/schedules/:id
 * @desc    Get single schedule
 * @access  Private (Receptionist, Admin)
 */
router.get('/:id', auth, authorize('RECEPTIONIST', 'ADMIN'), async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate({
        path: 'doctor',
        select: 'user specialty consultationFee',
        populate: {
          path: 'user',
          select: 'name email phone'
        }
      })
      .populate('appointmentsCount');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    res.json({
      success: true,
      data: { schedule }
    });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching schedule'
    });
  }
});

/**
 * @route   POST /api/schedules
 * @desc    Create new schedule
 * @access  Private (Receptionist, Admin)
 */
router.post('/', auth, authorize('RECEPTIONIST', 'ADMIN'), async (req, res) => {
  try {
    const {
      doctorId,
      date,
      startTime,
      endTime,
      slotDuration = 30,
      maxPatients = 1,
      isRecurring = false,
      recurringType,
      recurringEndDate,
      location,
      notes
    } = req.body;

    // Validate required fields
    if (!doctorId || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Doctor, date, start time, and end time are required'
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

    // Check for schedule conflicts
    const conflictingSchedule = await Schedule.findOne({
      doctor: doctorId,
      date: new Date(date),
      status: 'ACTIVE',
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    if (conflictingSchedule) {
      return res.status(400).json({
        success: false,
        message: 'Schedule conflicts with existing schedule'
      });
    }

    const scheduleData = {
      doctor: doctorId,
      date: new Date(date),
      startTime,
      endTime,
      slotDuration,
      maxPatients,
      isRecurring,
      location: location || 'Main Clinic',
      notes
    };

    if (isRecurring) {
      if (!recurringType || !recurringEndDate) {
        return res.status(400).json({
          success: false,
          message: 'Recurring type and end date are required for recurring schedules'
        });
      }
      scheduleData.recurringType = recurringType;
      scheduleData.recurringEndDate = new Date(recurringEndDate);
    }

    const schedule = await Schedule.create(scheduleData);

    // Populate the created schedule
    const populatedSchedule = await Schedule.findById(schedule._id)
      .populate({
        path: 'doctor',
        select: 'user specialty consultationFee',
        populate: {
          path: 'user',
          select: 'name email phone'
        }
      });

    res.status(201).json({
      success: true,
      message: 'Schedule created successfully',
      data: { schedule: populatedSchedule }
    });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating schedule'
    });
  }
});

/**
 * @route   PATCH /api/schedules/:id
 * @desc    Update schedule
 * @access  Private (Receptionist, Admin)
 */
router.patch('/:id', auth, authorize('RECEPTIONIST', 'ADMIN'), async (req, res) => {
  try {
    const {
      date,
      startTime,
      endTime,
      slotDuration,
      maxPatients,
      location,
      notes,
      status
    } = req.body;

    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    // Check for conflicts if date/time is being updated
    if (date || startTime || endTime) {
      const checkDate = date ? new Date(date) : schedule.date;
      const checkStartTime = startTime || schedule.startTime;
      const checkEndTime = endTime || schedule.endTime;

      const conflictingSchedule = await Schedule.findOne({
        _id: { $ne: req.params.id },
        doctor: schedule.doctor,
        date: checkDate,
        status: 'ACTIVE',
        $or: [
          {
            startTime: { $lt: checkEndTime },
            endTime: { $gt: checkStartTime }
          }
        ]
      });

      if (conflictingSchedule) {
        return res.status(400).json({
          success: false,
          message: 'Schedule conflicts with existing schedule'
        });
      }
    }

    // Update fields
    if (date) schedule.date = new Date(date);
    if (startTime) schedule.startTime = startTime;
    if (endTime) schedule.endTime = endTime;
    if (slotDuration) schedule.slotDuration = slotDuration;
    if (maxPatients) schedule.maxPatients = maxPatients;
    if (location) schedule.location = location;
    if (notes !== undefined) schedule.notes = notes;
    if (status) schedule.status = status;

    await schedule.save();

    // Populate the updated schedule
    const updatedSchedule = await Schedule.findById(schedule._id)
      .populate({
        path: 'doctor',
        select: 'user specialty consultationFee',
        populate: {
          path: 'user',
          select: 'name email phone'
        }
      });

    res.json({
      success: true,
      message: 'Schedule updated successfully',
      data: { schedule: updatedSchedule }
    });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating schedule'
    });
  }
});

/**
 * @route   DELETE /api/schedules/:id
 * @desc    Delete schedule
 * @access  Private (Receptionist, Admin)
 */
router.delete('/:id', auth, authorize('RECEPTIONIST', 'ADMIN'), async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    // Check if schedule has appointments
    const Appointment = require('../models/Appointment');
    const appointmentCount = await Appointment.countDocuments({
      schedule: req.params.id,
      status: { $in: ['SCHEDULED', 'CONFIRMED'] }
    });

    if (appointmentCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete schedule with active appointments'
      });
    }

    // Soft delete - mark as cancelled
    schedule.status = 'CANCELLED';
    await schedule.save();

    res.json({
      success: true,
      message: 'Schedule deleted successfully'
    });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting schedule'
    });
  }
});

/**
 * @route   GET /api/schedules/available/:doctorId
 * @desc    Get available time slots for a doctor on a specific date
 * @access  Private (Receptionist, Admin)
 */
router.get('/available/:doctorId', auth, authorize('RECEPTIONIST', 'ADMIN'), async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    const targetDate = new Date(date);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    // Get doctor's schedules for the date
    const schedules = await Schedule.find({
      doctor: doctorId,
      date: {
        $gte: targetDate,
        $lt: nextDate
      },
      status: 'ACTIVE'
    });

    if (schedules.length === 0) {
      return res.json({
        success: true,
        data: { availableSlots: [] }
      });
    }

    // Get existing appointments for the date
    const Appointment = require('../models/Appointment');
    const appointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: {
        $gte: targetDate,
        $lt: nextDate
      },
      status: { $in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'] }
    });

    const availableSlots = [];

    schedules.forEach(schedule => {
      const startTime = schedule.startTime;
      const endTime = schedule.endTime;
      const slotDuration = schedule.slotDuration;
      const maxPatients = schedule.maxPatients;

      // Generate time slots
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);

      let currentTime = startHour * 60 + startMin; // Convert to minutes
      const endTimeMinutes = endHour * 60 + endMin;

      while (currentTime < endTimeMinutes) {
        const slotHour = Math.floor(currentTime / 60);
        const slotMin = currentTime % 60;
        const slotTimeString = `${slotHour.toString().padStart(2, '0')}:${slotMin.toString().padStart(2, '0')}`;

        // Check if slot is available
        const appointmentsAtSlot = appointments.filter(apt => apt.appointmentTime === slotTimeString);
        
        if (appointmentsAtSlot.length < maxPatients) {
          availableSlots.push({
            time: slotTimeString,
            scheduleId: schedule._id,
            availableSpots: maxPatients - appointmentsAtSlot.length,
            maxPatients
          });
        }

        currentTime += slotDuration;
      }
    });

    res.json({
      success: true,
      data: { availableSlots }
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching available slots'
    });
  }
});

module.exports = router;
