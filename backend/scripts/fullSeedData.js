const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Schedule = require('../models/Schedule');
const Appointment = require('../models/Appointment');
const Feedback = require('../models/Feedback');

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

// Helper function to generate random date
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper function to generate random time
const randomTime = () => {
  const hours = Math.floor(Math.random() * 12) + 8; // 8AM to 7PM
  const minutes = Math.random() < 0.5 ? 0 : 30;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Seed comprehensive data
const seedFullData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await Schedule.deleteMany({});
    await Appointment.deleteMany({});
    await Feedback.deleteMany({});

    console.log('🧹 Cleared existing data');

    // Create Admin and Staff Users
    const adminUsers = [
      {
        name: 'Admin User',
        email: 'admin@clinic.com',
        password: await bcrypt.hash('admin123', 10),
        phone: '+84901234567',
        role: 'ADMIN',
        isActive: true,
      },
      {
        name: 'Receptionist Nguyen Thi Mai',
        email: 'receptionist@clinic.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+84901234568',
        role: 'RECEPTIONIST',
        isActive: true,
      },
      {
        name: 'Receptionist Le Van Nam',
        email: 'receptionist2@clinic.com',
        password: await bcrypt.hash('password123', 10),
        phone: '+84901234569',
        role: 'RECEPTIONIST',
        isActive: true,
      }
    ];

    // Create Doctor Users
    const doctorUsers = [
      {
        name: 'Dr. Nguyen Van Duc',
        email: 'nguyen.duc@clinic.com',
        password: await bcrypt.hash('doctor123', 10),
        phone: '+84901234570',
        role: 'DOCTOR',
        isActive: true,
      },
      {
        name: 'Dr. Tran Thi Lan',
        email: 'tran.lan@clinic.com',
        password: await bcrypt.hash('doctor123', 10),
        phone: '+84901234571',
        role: 'DOCTOR',
        isActive: true,
      },
      {
        name: 'Dr. Le Minh Hoang',
        email: 'le.hoang@clinic.com',
        password: await bcrypt.hash('doctor123', 10),
        phone: '+84901234572',
        role: 'DOCTOR',
        isActive: true,
      },
      {
        name: 'Dr. Pham Thi Hoa',
        email: 'pham.hoa@clinic.com',
        password: await bcrypt.hash('doctor123', 10),
        phone: '+84901234573',
        role: 'DOCTOR',
        isActive: true,
      },
      {
        name: 'Dr. Vo Van Thanh',
        email: 'vo.thanh@clinic.com',
        password: await bcrypt.hash('doctor123', 10),
        phone: '+84901234574',
        role: 'DOCTOR',
        isActive: true,
      },
      {
        name: 'Dr. Dang Thi My',
        email: 'dang.my@clinic.com',
        password: await bcrypt.hash('doctor123', 10),
        phone: '+84901234575',
        role: 'DOCTOR',
        isActive: true,
      },
      {
        name: 'Dr. Bui Van Kien',
        email: 'bui.kien@clinic.com',
        password: await bcrypt.hash('doctor123', 10),
        phone: '+84901234576',
        role: 'DOCTOR',
        isActive: true,
      },
      {
        name: 'Dr. Hoang Thi Linh',
        email: 'hoang.linh@clinic.com',
        password: await bcrypt.hash('doctor123', 10),
        phone: '+84901234577',
        role: 'DOCTOR',
        isActive: true,
      }
    ];

    // Create Patient Users
    const patientUsers = [
      {
        name: 'Nguyen Van An',
        email: 'nguyen.an@email.com',
        password: await bcrypt.hash('patient123', 10),
        phone: '+84901234580',
        role: 'PATIENT',
        isActive: true,
      },
      {
        name: 'Tran Thi Binh',
        email: 'tran.binh@email.com',
        password: await bcrypt.hash('patient123', 10),
        phone: '+84901234581',
        role: 'PATIENT',
        isActive: true,
      },
      {
        name: 'Le Van Cuong',
        email: 'le.cuong@email.com',
        password: await bcrypt.hash('patient123', 10),
        phone: '+84901234582',
        role: 'PATIENT',
        isActive: true,
      },
      {
        name: 'Pham Thi Dung',
        email: 'pham.dung@email.com',
        password: await bcrypt.hash('patient123', 10),
        phone: '+84901234583',
        role: 'PATIENT',
        isActive: true,
      },
      {
        name: 'Vo Van Em',
        email: 'vo.em@email.com',
        password: await bcrypt.hash('patient123', 10),
        phone: '+84901234584',
        role: 'PATIENT',
        isActive: true,
      },
      {
        name: 'Dang Thi Fen',
        email: 'dang.fen@email.com',
        password: await bcrypt.hash('patient123', 10),
        phone: '+84901234585',
        role: 'PATIENT',
        isActive: true,
      },
      {
        name: 'Bui Van Gia',
        email: 'bui.gia@email.com',
        password: await bcrypt.hash('patient123', 10),
        phone: '+84901234586',
        role: 'PATIENT',
        isActive: true,
      },
      {
        name: 'Hoang Thi Ha',
        email: 'hoang.ha@email.com',
        password: await bcrypt.hash('patient123', 10),
        phone: '+84901234587',
        role: 'PATIENT',
        isActive: true,
      },
      {
        name: 'Ngo Van Ich',
        email: 'ngo.ich@email.com',
        password: await bcrypt.hash('patient123', 10),
        phone: '+84901234588',
        role: 'PATIENT',
        isActive: true,
      },
      {
        name: 'Ly Thi Kim',
        email: 'ly.kim@email.com',
        password: await bcrypt.hash('patient123', 10),
        phone: '+84901234589',
        role: 'PATIENT',
        isActive: true,
      },
      {
        name: 'Do Van Long',
        email: 'do.long@email.com',
        password: await bcrypt.hash('patient123', 10),
        phone: '+84901234590',
        role: 'PATIENT',
        isActive: true,
      },
      {
        name: 'Cao Thi Mai',
        email: 'cao.mai@email.com',
        password: await bcrypt.hash('patient123', 10),
        phone: '+84901234591',
        role: 'PATIENT',
        isActive: true,
      }
    ];

    // Combine all users
    const allUsers = [...adminUsers, ...doctorUsers, ...patientUsers];
    const createdUsers = await User.insertMany(allUsers);
    console.log('👥 Created users:', createdUsers.length);

    // Filter users by role
    const createdDoctorUsers = createdUsers.filter(user => user.role === 'DOCTOR');
    const createdPatientUsers = createdUsers.filter(user => user.role === 'PATIENT');

    // Create Doctors with detailed information
    const specialties = ['CARDIOLOGY', 'DERMATOLOGY', 'NEUROLOGY', 'ORTHOPEDICS', 'PEDIATRICS', 'PSYCHIATRY', 'RADIOLOGY', 'SURGERY'];
    const doctors = createdDoctorUsers.map((user, index) => ({
      user: user._id,
      specialty: specialties[index % specialties.length],
      licenseNumber: `MD${(index + 1).toString().padStart(3, '0')}`,
      experience: Math.floor(Math.random() * 20) + 5,
      consultationFee: Math.floor(Math.random() * 200) + 100,
      bio: `Bác sĩ chuyên khoa ${specialties[index % specialties.length].toLowerCase()} với nhiều năm kinh nghiệm trong việc điều trị và chăm sóc bệnh nhân.`,
      rating: (Math.random() * 1.5 + 3.5).toFixed(1),
      totalReviews: Math.floor(Math.random() * 100) + 10,
      isAvailable: true
    }));

    const createdDoctors = await Doctor.insertMany(doctors);
    console.log('👨‍⚕️ Created doctors:', createdDoctors.length);

    // Create Patients with detailed information
    const genders = ['MALE', 'FEMALE'];
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const cities = ['Ho Chi Minh City', 'Ha Noi', 'Da Nang', 'Can Tho', 'Hai Phong'];

    const patients = createdPatientUsers.map((user, index) => ({
      user: user._id,
      dateOfBirth: randomDate(new Date(1970, 0, 1), new Date(2005, 11, 31)),
      gender: genders[index % 2],
      bloodType: bloodTypes[index % bloodTypes.length],
      address: {
        street: `${Math.floor(Math.random() * 999) + 1} Nguyen Van Cu Street`,
        city: cities[index % cities.length],
        state: 'Vietnam',
        zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
        country: 'Vietnam',
      },
      emergencyContact: {
        name: `Emergency Contact ${index + 1}`,
        phone: `+8490123${(4600 + index).toString()}`,
        relationship: index % 2 === 0 ? 'Vợ/Chồng' : 'Cha/Mẹ',
      },
      medicalHistory: [
        {
          condition: index % 3 === 0 ? 'Thoát vị đĩa đệm' : index % 3 === 1 ? 'Tiểu đường' : 'Hen suyễn',
          diagnosedDate: randomDate(new Date(2020, 0, 1), new Date()),
          status: 'ACTIVE',
          notes: 'Đang theo dõi định kỳ'
        }
      ],
      allergies: index % 4 === 0 ? [
        {
          allergen: 'Penicillin',
          severity: 'MODERATE',
          reaction: 'Phát ban da'
        }
      ] : []
    }));

    const createdPatients = await Patient.insertMany(patients);
    console.log('👤 Created patients:', createdPatients.length);

    // Create Schedules for doctors
    const schedules = [];
    const today = new Date();
    
    for (let doctor of createdDoctors) {
      // Create schedules for next 30 days
      for (let i = 0; i < 30; i++) {
        const scheduleDate = new Date(today);
        scheduleDate.setDate(today.getDate() + i);
        
        // Skip weekends for some doctors
        if (scheduleDate.getDay() === 0 || scheduleDate.getDay() === 6) {
          if (Math.random() > 0.3) continue; // 70% chance to skip weekends
        }

        schedules.push({
          doctor: doctor._id,
          date: scheduleDate,
          startTime: '08:00',
          endTime: '17:00',
          slotDuration: 30,
          maxPatients: 1,
          location: Math.random() > 0.5 ? 'Phòng khám chính' : 'Phòng khám chi nhánh',
          status: 'ACTIVE',
          notes: 'Giờ làm việc bình thường'
        });
      }
    }

    const createdSchedules = await Schedule.insertMany(schedules);
    console.log('📅 Created schedules:', createdSchedules.length);

    // Create Appointments
    const appointments = [];
    const appointmentStatuses = ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
    const priorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
    const appointmentTypes = ['CONSULTATION', 'FOLLOW_UP', 'ROUTINE_CHECKUP', 'EMERGENCY'];
    const reasons = [
      'Khám tổng quát',
      'Tái khám',
      'Khám đau ngực',
      'Khám da liễu',
      'Theo dõi huyết áp',
      'Quản lý tiểu đường',
      'Khám đau đầu',
      'Khám khớp xương',
      'Khám sức khỏe hàng năm',
      'Đánh giá thuốc'
    ];

    // Create appointments for the past and future
    for (let i = 0; i < 200; i++) {
      const schedule = createdSchedules[Math.floor(Math.random() * createdSchedules.length)];
      const patient = createdPatients[Math.floor(Math.random() * createdPatients.length)];
      const appointmentDate = schedule.date;
      
      // Generate appointment time within schedule hours
      const startHour = 8;
      const endHour = 17;
      const hour = Math.floor(Math.random() * (endHour - startHour)) + startHour;
      const minute = Math.random() < 0.5 ? 0 : 30;
      const appointmentTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

      appointments.push({
        patient: patient._id,
        doctor: schedule.doctor,
        schedule: schedule._id,
        appointmentDate,
        appointmentTime,
        duration: 30,
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        status: appointmentStatuses[Math.floor(Math.random() * appointmentStatuses.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        appointmentType: appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)],
        symptoms: ['Mệt mỏi', 'Đau đầu', 'Buồn nôn'].slice(0, Math.floor(Math.random() * 3) + 1),
        notes: 'Bệnh nhân ổn định, khuyến nghị tái khám',
        consultationFee: Math.floor(Math.random() * 200) + 100,
        paymentStatus: Math.random() > 0.3 ? 'PAID' : 'PENDING',
        createdBy: createdUsers.find(u => u.role === 'RECEPTIONIST')._id,
        createdAt: randomDate(new Date(2024, 0, 1), new Date())
      });
    }

    const createdAppointments = await Appointment.insertMany(appointments);
    console.log('📋 Created appointments:', createdAppointments.length);

    // Create Feedback for completed appointments
    const completedAppointments = createdAppointments.filter(apt => apt.status === 'COMPLETED');
    const feedbacks = [];

    const comments = [
      'Bác sĩ rất tận tâm và chuyên nghiệp',
      'Dịch vụ tốt, nhân viên thân thiện',
      'Thời gian chờ hơi lâu nhưng bác sĩ khám rất kỹ',
      'Phòng khám sạch sẽ, trang thiết bị hiện đại',
      'Bác sĩ giải thích rất rõ ràng về tình trạng bệnh',
      'Giá cả hợp lý, chất lượng dịch vụ tốt',
      'Sẽ giới thiệu cho bạn bè và người thân',
      'Cần cải thiện thời gian chờ đợi',
      'Nhân viên lễ tân rất nhiệt tình hỗ trợ',
      'Tổng thể rất hài lòng với dịch vụ'
    ];

    for (let i = 0; i < Math.min(completedAppointments.length, 80); i++) {
      const appointment = completedAppointments[i];
      
      feedbacks.push({
        appointment: appointment._id,
        patient: appointment.patient,
        doctor: appointment.doctor,
        rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars mostly
        comment: comments[Math.floor(Math.random() * comments.length)],
        categories: {
          doctorProfessionalism: Math.floor(Math.random() * 2) + 4,
          waitTime: Math.floor(Math.random() * 3) + 3,
          facilityCleaniness: Math.floor(Math.random() * 2) + 4,
          staffFriendliness: Math.floor(Math.random() * 2) + 4,
          overallExperience: Math.floor(Math.random() * 2) + 4
        },
        wouldRecommend: Math.random() > 0.2, // 80% would recommend
        anonymous: Math.random() > 0.7, // 30% anonymous
        status: 'APPROVED',
        isPublic: true,
        helpfulVotes: Math.floor(Math.random() * 20),
        createdAt: randomDate(appointment.appointmentDate, new Date())
      });
    }

    const createdFeedbacks = await Feedback.insertMany(feedbacks);
    console.log('⭐ Created feedbacks:', createdFeedbacks.length);

    console.log('\n🎉 Full seed data created successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${createdUsers.length}`);
    console.log(`👨‍⚕️ Doctors: ${createdDoctors.length}`);
    console.log(`👤 Patients: ${createdPatients.length}`);
    console.log(`📅 Schedules: ${createdSchedules.length}`);
    console.log(`📋 Appointments: ${createdAppointments.length}`);
    console.log(`⭐ Feedbacks: ${createdFeedbacks.length}`);

    console.log('\n🔐 Login Credentials:');
    console.log('Admin: admin@clinic.com / admin123');
    console.log('Receptionist: receptionist@clinic.com / password123');
    console.log('Receptionist 2: receptionist2@clinic.com / password123');
    console.log('Doctor: nguyen.duc@clinic.com / doctor123');
    console.log('Patient: nguyen.an@email.com / patient123');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seed script
const runFullSeed = async () => {
  await connectDB();
  await seedFullData();
};

runFullSeed();
