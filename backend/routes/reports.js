const express = require('express');
const moment = require('moment');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Schedule = require('../models/Schedule');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/reports/overview
 * @desc    Get operational reports overview
 * @access  Private (Receptionist, Admin)
 */
router.get('/overview', auth, authorize('RECEPTIONIST', 'ADMIN'), async (req, res) => {
  try {
    const { startDate, endDate, period = 'month' } = req.query;

    // Set default date range if not provided
    let start, end;
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      // Default to current month
      start = moment().startOf('month').toDate();
      end = moment().endOf('month').toDate();
    }

    // Total patients count
    const totalPatients = await Patient.countDocuments();

    // Total doctors count
    const totalDoctors = await Doctor.countDocuments();

    // Appointments statistics
    const appointmentStats = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          totalAppointments: { $sum: 1 },
          completedAppointments: {
            $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] }
          },
          cancelledAppointments: {
            $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] }
          },
          scheduledAppointments: {
            $sum: { $cond: [{ $eq: ['$status', 'SCHEDULED'] }, 1, 0] }
          },
          totalRevenue: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'PAID'] }, '$consultationFee', 0] }
          }
        }
      }
    ]);

    // Daily appointment trends
    const dailyTrends = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: { $gte: start, $lte: end }
        }
      },
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

    // Specialty-wise appointment distribution
    const specialtyStats = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: { $gte: start, $lte: end }
        }
      },
      {
        $lookup: {
          from: 'doctors',
          localField: 'doctor',
          foreignField: '_id',
          as: 'doctorInfo'
        }
      },
      { $unwind: '$doctorInfo' },
      {
        $group: {
          _id: '$doctorInfo.specialty',
          appointmentCount: { $sum: 1 },
          revenue: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'PAID'] }, '$consultationFee', 0] }
          }
        }
      },
      { $sort: { appointmentCount: -1 } }
    ]);

    // Top performing doctors
    const topDoctors = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: { $gte: start, $lte: end },
          status: 'COMPLETED'
        }
      },
      {
        $group: {
          _id: '$doctor',
          appointmentCount: { $sum: 1 },
          revenue: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'PAID'] }, '$consultationFee', 0] }
          }
        }
      },
      { $sort: { appointmentCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'doctors',
          localField: '_id',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      { $unwind: '$doctor' },
      {
        $lookup: {
          from: 'users',
          localField: 'doctor.user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          doctorName: '$user.name',
          specialty: '$doctor.specialty',
          appointmentCount: 1,
          revenue: 1
        }
      }
    ]);

    // Monthly revenue trend
    const monthlyRevenue = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: { $gte: moment(start).subtract(11, 'months').toDate(), $lte: end },
          paymentStatus: 'PAID'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$appointmentDate' },
            month: { $month: '$appointmentDate' }
          },
          revenue: { $sum: '$consultationFee' },
          appointmentCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Patient demographics
    const patientDemographics = await Patient.aggregate([
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 }
        }
      }
    ]);

    // Age group distribution
    const ageGroups = await Patient.aggregate([
      {
        $addFields: {
          age: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), '$dateOfBirth'] },
                365.25 * 24 * 60 * 60 * 1000
              ]
            }
          }
        }
      },
      {
        $bucket: {
          groupBy: '$age',
          boundaries: [0, 18, 30, 50, 65, 100],
          default: 'Unknown',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    // Appointment status distribution
    const statusDistribution = appointmentStats[0] ? {
      completed: appointmentStats[0].completedAppointments || 0,
      cancelled: appointmentStats[0].cancelledAppointments || 0,
      scheduled: appointmentStats[0].scheduledAppointments || 0,
      total: appointmentStats[0].totalAppointments || 0
    } : { completed: 0, cancelled: 0, scheduled: 0, total: 0 };

    res.json({
      success: true,
      data: {
        summary: {
          totalPatients,
          totalDoctors,
          totalAppointments: appointmentStats[0]?.totalAppointments || 0,
          totalRevenue: appointmentStats[0]?.totalRevenue || 0,
          completionRate: appointmentStats[0]?.totalAppointments > 0 
            ? Math.round((appointmentStats[0].completedAppointments / appointmentStats[0].totalAppointments) * 100)
            : 0,
          cancellationRate: appointmentStats[0]?.totalAppointments > 0
            ? Math.round((appointmentStats[0].cancelledAppointments / appointmentStats[0].totalAppointments) * 100)
            : 0
        },
        charts: {
          dailyTrends: dailyTrends.map(item => ({
            date: item._id.date,
            total: item.total,
            completed: item.completed,
            cancelled: item.cancelled
          })),
          specialtyStats: specialtyStats.map(item => ({
            specialty: item._id,
            appointments: item.appointmentCount,
            revenue: item.revenue
          })),
          monthlyRevenue: monthlyRevenue.map(item => ({
            month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
            revenue: item.revenue,
            appointments: item.appointmentCount
          })),
          statusDistribution,
          patientDemographics: patientDemographics.map(item => ({
            gender: item._id,
            count: item.count
          })),
          ageGroups: ageGroups.map(item => ({
            ageRange: item._id === 'Unknown' ? 'Unknown' : 
              item._id === 0 ? '0-17' :
              item._id === 18 ? '18-29' :
              item._id === 30 ? '30-49' :
              item._id === 50 ? '50-64' : '65+',
            count: item.count
          }))
        },
        topDoctors,
        period: {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        }
      }
    });
  } catch (error) {
    console.error('Get reports overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating reports'
    });
  }
});

/**
 * @route   GET /api/reports/appointments
 * @desc    Get detailed appointment report
 * @access  Private (Receptionist, Admin)
 */
router.get('/appointments', auth, authorize('RECEPTIONIST', 'ADMIN'), async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      doctorId, 
      specialty, 
      status,
      page = 1,
      limit = 50
    } = req.query;

    let filter = {};

    // Date filter
    if (startDate && endDate) {
      filter.appointmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Doctor filter
    if (doctorId) {
      filter.doctor = doctorId;
    }

    // Status filter
    if (status) {
      filter.status = status;
    }

    let appointments = await Appointment.find(filter)
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
        }
      ])
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ appointmentDate: -1, appointmentTime: 1 });

    // Filter by specialty if provided
    if (specialty) {
      appointments = appointments.filter(apt => 
        apt.doctor && apt.doctor.specialty === specialty
      );
    }

    const total = await Appointment.countDocuments(filter);

    // Calculate summary statistics
    const summary = {
      totalAppointments: appointments.length,
      totalRevenue: appointments
        .filter(apt => apt.paymentStatus === 'PAID')
        .reduce((sum, apt) => sum + (apt.consultationFee || 0), 0),
      statusBreakdown: appointments.reduce((acc, apt) => {
        acc[apt.status] = (acc[apt.status] || 0) + 1;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: {
        appointments,
        summary,
        pagination: {
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get appointment report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating appointment report'
    });
  }
});

/**
 * @route   GET /api/reports/doctors
 * @desc    Get doctor performance report
 * @access  Private (Receptionist, Admin)
 */
router.get('/doctors', auth, authorize('RECEPTIONIST', 'ADMIN'), async (req, res) => {
  try {
    const { startDate, endDate, specialty } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.appointmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const doctorPerformance = await Appointment.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$doctor',
          totalAppointments: { $sum: 1 },
          completedAppointments: {
            $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] }
          },
          cancelledAppointments: {
            $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] }
          },
          noShowAppointments: {
            $sum: { $cond: [{ $eq: ['$status', 'NO_SHOW'] }, 1, 0] }
          },
          totalRevenue: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'PAID'] }, '$consultationFee', 0] }
          },
          averageFee: { $avg: '$consultationFee' }
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
      { $unwind: '$doctor' },
      {
        $lookup: {
          from: 'users',
          localField: 'doctor.user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          doctorName: '$user.name',
          specialty: '$doctor.specialty',
          totalAppointments: 1,
          completedAppointments: 1,
          cancelledAppointments: 1,
          noShowAppointments: 1,
          totalRevenue: 1,
          averageFee: { $round: ['$averageFee', 2] },
          completionRate: {
            $round: [
              { $multiply: [
                { $divide: ['$completedAppointments', '$totalAppointments'] },
                100
              ]}, 2
            ]
          },
          cancellationRate: {
            $round: [
              { $multiply: [
                { $divide: ['$cancelledAppointments', '$totalAppointments'] },
                100
              ]}, 2
            ]
          }
        }
      },
      { $sort: { totalAppointments: -1 } }
    ]);

    // Filter by specialty if provided
    let filteredPerformance = doctorPerformance;
    if (specialty) {
      filteredPerformance = doctorPerformance.filter(doc => doc.specialty === specialty);
    }

    res.json({
      success: true,
      data: {
        doctorPerformance: filteredPerformance,
        summary: {
          totalDoctors: filteredPerformance.length,
          totalRevenue: filteredPerformance.reduce((sum, doc) => sum + doc.totalRevenue, 0),
          totalAppointments: filteredPerformance.reduce((sum, doc) => sum + doc.totalAppointments, 0),
          averageCompletionRate: filteredPerformance.length > 0 
            ? Math.round(filteredPerformance.reduce((sum, doc) => sum + doc.completionRate, 0) / filteredPerformance.length)
            : 0
        }
      }
    });
  } catch (error) {
    console.error('Get doctor report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating doctor report'
    });
  }
});

module.exports = router;
