const express = require('express');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

/**
 * @route   PATCH /api/users/me
 * @desc    Update current user profile
 * @access  Private
 */
router.patch('/me', auth, async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    const user = await User.findById(req.user.id);
    
    // Update allowed fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    
    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

/**
 * @route   POST /api/users
 * @desc    Create new user (Doctor or Patient)
 * @access  Private (Receptionist, Admin)
 */
router.post('/', auth, authorize('RECEPTIONIST', 'ADMIN'), async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      phone, 
      role,
      // Doctor specific fields
      specialty,
      licenseNumber,
      experience,
      consultationFee,
      bio,
      // Patient specific fields
      dateOfBirth,
      gender,
      address,
      emergencyContact,
      bloodType
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and role'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role
    });

    let additionalData = null;

    // Create doctor or patient profile based on role
    if (role === 'DOCTOR') {
      if (!specialty || !licenseNumber) {
        return res.status(400).json({
          success: false,
          message: 'Specialty and license number are required for doctors'
        });
      }

      additionalData = await Doctor.create({
        user: user._id,
        specialty,
        licenseNumber,
        experience: experience || 0,
        consultationFee: consultationFee || 0,
        bio: bio || ''
      });
    } else if (role === 'PATIENT') {
      if (!dateOfBirth || !gender) {
        return res.status(400).json({
          success: false,
          message: 'Date of birth and gender are required for patients'
        });
      }

      additionalData = await Patient.create({
        user: user._id,
        dateOfBirth,
        gender,
        address: address || {},
        emergencyContact: emergencyContact || {},
        bloodType
      });
    }

    res.status(201).json({
      success: true,
      message: `${role} account created successfully`,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        },
        additionalData
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating user account'
    });
  }
});

/**
 * @route   GET /api/users/doctors
 * @desc    Get all doctors
 * @access  Private (Receptionist, Admin)
 */
router.get('/doctors', auth, authorize('RECEPTIONIST', 'ADMIN'), async (req, res) => {
  try {
    const { specialty, isAvailable, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    if (specialty) filter.specialty = specialty;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';

    const doctors = await Doctor.find(filter)
      .populate('user', 'name email phone isActive')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Doctor.countDocuments(filter);

    res.json({
      success: true,
      data: {
        doctors,
        pagination: {
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching doctors'
    });
  }
});

/**
 * @route   GET /api/users/patients
 * @desc    Get all patients
 * @access  Private (Receptionist, Admin)
 */
router.get('/patients', auth, authorize('RECEPTIONIST', 'ADMIN'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    let filter = {};
    if (search) {
      filter['user.name'] = { $regex: search, $options: 'i' };
    }

    const patients = await Patient.find()
      .populate('user', 'name email phone isActive')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    // Filter by search if provided
    let filteredPatients = patients;
    if (search) {
      filteredPatients = patients.filter(patient => 
        patient.user.name.toLowerCase().includes(search.toLowerCase()) ||
        patient.user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = await Patient.countDocuments();

    res.json({
      success: true,
      data: {
        patients: filteredPatients,
        pagination: {
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching patients'
    });
  }
});

/**
 * @route   GET /api/users/specialties
 * @desc    Get all available specialties
 * @access  Private
 */
router.get('/specialties', auth, async (req, res) => {
  try {
    const specialties = [
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
    ];

    res.json({
      success: true,
      data: { specialties }
    });
  } catch (error) {
    console.error('Get specialties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching specialties'
    });
  }
});

module.exports = router;
