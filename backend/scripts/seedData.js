const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/clinic_management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed data
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});

    console.log('🧹 Cleared existing data');

    // Create users
    const users = [
      {
        name: 'Receptionist User',
        email: 'receptionist@clinic.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+1234567890',
        role: 'RECEPTIONIST',
        isActive: true,
      },
      {
        name: 'Admin User',
        email: 'admin@clinic.com',
        password: await bcrypt.hash('admin123', 10),
        phone: '+1234567891',
        role: 'ADMIN',
        isActive: true,
      },
      {
        name: 'Dr. John Smith',
        email: 'john.smith@clinic.com',
        password: await bcrypt.hash('doctor123', 10),
        phone: '+1234567892',
        role: 'DOCTOR',
        isActive: true,
      },
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@clinic.com',
        password: await bcrypt.hash('doctor123', 10),
        phone: '+1234567893',
        role: 'DOCTOR',
        isActive: true,
      },
      {
        name: 'Dr. Michael Brown',
        email: 'michael.brown@clinic.com',
        password: await bcrypt.hash('doctor123', 10),
        phone: '+1234567894',
        role: 'DOCTOR',
        isActive: true,
      },
      {
        name: 'John Doe',
        email: 'john.doe@email.com',
        password: await bcrypt.hash('patient123', 10),
        phone: '+1234567895',
        role: 'PATIENT',
        isActive: true,
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@email.com',
        password: await bcrypt.hash('patient123', 10),
        phone: '+1234567896',
        role: 'PATIENT',
        isActive: true,
      },
      {
        name: 'Robert Wilson',
        email: 'robert.wilson@email.com',
        password: await bcrypt.hash('patient123', 10),
        phone: '+1234567897',
        role: 'PATIENT',
        isActive: true,
      },
    ];

    const createdUsers = await User.insertMany(users);
    console.log('👥 Created users');

    // Create doctors
    const doctorUsers = createdUsers.filter(user => user.role === 'DOCTOR');
    const doctors = [
      {
        user: doctorUsers[0]._id,
        specialty: 'CARDIOLOGY',
        licenseNumber: 'MD001',
        experience: 10,
        consultationFee: 150,
        bio: 'Experienced cardiologist specializing in heart disease prevention and treatment.',
        rating: 4.8,
        totalReviews: 45,
      },
      {
        user: doctorUsers[1]._id,
        specialty: 'DERMATOLOGY',
        licenseNumber: 'MD002',
        experience: 8,
        consultationFee: 120,
        bio: 'Board-certified dermatologist with expertise in skin conditions and cosmetic procedures.',
        rating: 4.9,
        totalReviews: 38,
      },
      {
        user: doctorUsers[2]._id,
        specialty: 'PEDIATRICS',
        licenseNumber: 'MD003',
        experience: 12,
        consultationFee: 100,
        bio: 'Pediatrician dedicated to providing comprehensive care for children and adolescents.',
        rating: 4.7,
        totalReviews: 52,
      },
    ];

    await Doctor.insertMany(doctors);
    console.log('👨‍⚕️ Created doctors');

    // Create patients
    const patientUsers = createdUsers.filter(user => user.role === 'PATIENT');
    const patients = [
      {
        user: patientUsers[0]._id,
        dateOfBirth: new Date('1985-03-15'),
        gender: 'MALE',
        bloodType: 'O+',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
        emergencyContact: {
          name: 'Jane Doe',
          phone: '+1234567890',
          relationship: 'Spouse',
        },
      },
      {
        user: patientUsers[1]._id,
        dateOfBirth: new Date('1990-07-22'),
        gender: 'FEMALE',
        bloodType: 'A+',
        address: {
          street: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001',
          country: 'USA',
        },
        emergencyContact: {
          name: 'John Smith',
          phone: '+1234567891',
          relationship: 'Husband',
        },
      },
      {
        user: patientUsers[2]._id,
        dateOfBirth: new Date('1975-11-08'),
        gender: 'MALE',
        bloodType: 'B+',
        address: {
          street: '789 Pine Rd',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'USA',
        },
        emergencyContact: {
          name: 'Mary Wilson',
          phone: '+1234567892',
          relationship: 'Wife',
        },
      },
    ];

    await Patient.insertMany(patients);
    console.log('👤 Created patients');

    console.log('\n🎉 Seed data created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Receptionist: receptionist@clinic.com / password123');
    console.log('Admin: admin@clinic.com / admin123');
    console.log('Doctor: john.smith@clinic.com / doctor123');
    console.log('Patient: john.doe@email.com / patient123');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seed script
const runSeed = async () => {
  await connectDB();
  await seedData();
};

runSeed();
