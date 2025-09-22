# Clinic Management System - Receptionist Module

A comprehensive clinic management application built with React.js frontend and Node.js/Express backend, specifically designed for receptionist operations.

## 🏥 Features

### Authentication & Profile Management
- ✅ **JWT Authentication** - Secure login with token-based authentication
- ✅ **Password Reset** - Email-based password recovery system
- ✅ **Profile Management** - View and update personal information
- ✅ **Role-based Access** - Receptionist-specific access control

### Appointment Management
- ✅ **Book Appointments** - Multi-step appointment booking process
- ✅ **View Appointments** - Comprehensive appointment listing with filters
- ✅ **Cancel Appointments** - Appointment cancellation with confirmation
- ✅ **Real-time Availability** - Check doctor availability and time slots
- 📋 **Status Tracking** - Track appointment status (Scheduled, Confirmed, Completed, etc.)

### Doctor Schedule Management
- 📋 **View Schedules** - Display doctor schedules with filtering options
- 📋 **Manage Schedules** - Add, edit, and delete doctor schedules
- 📋 **Recurring Schedules** - Support for recurring appointment slots
- 📋 **Specialty Filtering** - Filter schedules by medical specialty

### User Management
- 📋 **Create Accounts** - Create new doctor and patient accounts
- ✅ **User Listing** - View doctors and patients with search functionality
- 📋 **Profile Management** - Manage user profiles and medical information

### Reporting & Analytics
- ✅ **Dashboard Overview** - Key metrics and statistics
- ✅ **Appointment Analytics** - Daily/monthly appointment trends
- ✅ **Revenue Reports** - Financial reporting and analytics
- 📋 **Custom Reports** - Generate detailed operational reports

### Feedback Management
- 📋 **View Feedback** - Display patient feedback and ratings
- 📋 **Manage Reviews** - Approve, reject, or respond to feedback
- 📋 **Doctor Ratings** - Track doctor performance metrics

**Legend:** ✅ Implemented | 📋 Placeholder (Ready for implementation)

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **React Router v6** - Client-side routing
- **Redux Toolkit** - State management
- **Ant Design 5** - UI component library
- **Axios** - HTTP client with interceptors
- **Recharts** - Data visualization
- **Moment.js** - Date manipulation

### Backend
- **Node.js** - Runtime environment
- **Express 4** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Nodemailer** - Email service
- **Joi** - Input validation

## 📁 Project Structure

```
clinic-management-receptionist/
├── backend/
│   ├── middleware/
│   │   ├── auth.js              # Authentication middleware
│   │   └── errorHandler.js      # Global error handling
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Doctor.js            # Doctor schema
│   │   ├── Patient.js           # Patient schema
│   │   ├── Schedule.js          # Schedule schema
│   │   ├── Appointment.js       # Appointment schema
│   │   └── Feedback.js          # Feedback schema
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── users.js             # User management routes
│   │   ├── schedules.js         # Schedule management routes
│   │   ├── appointments.js      # Appointment routes
│   │   ├── reports.js           # Reporting routes
│   │   └── feedback.js          # Feedback routes
│   ├── utils/
│   │   └── sendEmail.js         # Email utility
│   ├── package.json
│   ├── server.js                # Main server file
│   └── env.example              # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/             # Authentication components
│   │   │   ├── dashboard/        # Dashboard components
│   │   │   ├── profile/          # Profile management
│   │   │   ├── appointments/     # Appointment management
│   │   │   ├── schedules/        # Schedule management
│   │   │   ├── users/            # User management
│   │   │   ├── reports/          # Reports and analytics
│   │   │   ├── feedback/         # Feedback management
│   │   │   ├── layout/           # Layout components
│   │   │   └── common/           # Shared components
│   │   ├── store/
│   │   │   ├── slices/           # Redux slices
│   │   │   └── store.js          # Redux store configuration
│   │   ├── services/
│   │   │   └── api.js            # API service with interceptors
│   │   ├── App.js                # Main App component
│   │   ├── index.js              # Entry point
│   │   └── index.css             # Global styles
│   └── package.json
├── package.json                  # Root package.json
└── README.md                     # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd clinic-management-receptionist
   ```

2. **Install dependencies for all packages**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   # Backend environment
   cd backend
   cp env.example .env
   ```
   
   Edit `backend/.env` with your configuration:
   ```env
   # Database
   MONGO_URI=mongodb://localhost:27017/clinic_management
   
   # JWT
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key_here
   JWT_EXPIRE=1d
   JWT_REFRESH_EXPIRE=7d
   
   # Server
   PORT=5000
   NODE_ENV=development
   
   # Email (SMTP)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   
   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using MongoDB Compass/Atlas
   # Make sure your MONGO_URI points to the correct database
   ```

5. **Start the development servers**
   ```bash
   # From root directory - starts both frontend and backend
   npm run dev
   
   # Or start individually:
   # Backend (runs on http://localhost:5000)
   cd backend && npm run dev
   
   # Frontend (runs on http://localhost:3000)
   cd frontend && npm start
   ```

### Production Deployment

1. **Build the frontend**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## 🔐 Default Credentials

For development and testing:

```
Email: receptionist@clinic.com
Password: password123
Role: RECEPTIONIST
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password/:token` | Reset password |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/refresh-token` | Refresh access token |
| POST | `/api/auth/logout` | User logout |

### User Management Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get user profile |
| PATCH | `/api/users/me` | Update user profile |
| POST | `/api/users` | Create new user |
| GET | `/api/users/doctors` | Get all doctors |
| GET | `/api/users/patients` | Get all patients |
| GET | `/api/users/specialties` | Get available specialties |

### Schedule Management Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/schedules` | Get all schedules |
| GET | `/api/schedules/:id` | Get single schedule |
| POST | `/api/schedules` | Create new schedule |
| PATCH | `/api/schedules/:id` | Update schedule |
| DELETE | `/api/schedules/:id` | Delete schedule |
| GET | `/api/schedules/available/:doctorId` | Get available slots |

### Appointment Management Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments` | Get all appointments |
| GET | `/api/appointments/:id` | Get single appointment |
| POST | `/api/appointments` | Book new appointment |
| PATCH | `/api/appointments/:id/status` | Update appointment status |
| DELETE | `/api/appointments/:id` | Cancel appointment |
| GET | `/api/appointments/stats/overview` | Get appointment statistics |

### Reports Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/overview` | Get operational overview |
| GET | `/api/reports/appointments` | Get appointment reports |
| GET | `/api/reports/doctors` | Get doctor performance reports |

### Feedback Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/feedback` | Get all feedback |
| GET | `/api/feedback/:id` | Get single feedback |
| PATCH | `/api/feedback/:id/status` | Update feedback status |
| PATCH | `/api/feedback/:id/visibility` | Update feedback visibility |
| GET | `/api/feedback/doctor/:doctorId/stats` | Get doctor feedback stats |
| DELETE | `/api/feedback/:id` | Delete feedback |

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/clinic_management

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_EXPIRE=1d
JWT_REFRESH_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Email Configuration (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Database Setup

The application will automatically create the necessary collections when you start using it. However, you may want to create an initial admin user:

```javascript
// Connect to MongoDB and run this script
db.users.insertOne({
  name: "Receptionist User",
  email: "receptionist@clinic.com",
  password: "$2a$10$...", // bcrypt hash of "password123"
  role: "RECEPTIONIST",
  phone: "+1234567890",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

## 🧪 Testing

### Running Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

### API Testing with Postman

1. Import the Postman collection (if provided)
2. Set up environment variables:
   - `baseUrl`: `http://localhost:5000/api`
   - `token`: Your JWT token after login

## 🚀 Deployment

### Using PM2 (Recommended for production)

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start backend/server.js --name "clinic-api"

# Save PM2 configuration
pm2 save
pm2 startup
```

### Using Docker

```dockerfile
# Dockerfile example
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

### Environment-specific Configurations

#### Development
- Hot reloading enabled
- Detailed error messages
- MongoDB local instance

#### Production
- Optimized builds
- Error logging
- MongoDB Atlas or production database
- HTTPS enabled
- Rate limiting
- Security headers

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Password Hashing** using bcrypt
- **Input Validation** with Joi
- **CORS Configuration** for cross-origin requests
- **Rate Limiting** (can be added)
- **Helmet** for security headers (can be added)
- **Role-based Access Control**

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   ```
   Solution: Ensure MongoDB is running and MONGO_URI is correct
   ```

2. **Port Already in Use**
   ```bash
   # Kill process using port 5000
   lsof -ti:5000 | xargs kill -9
   ```

3. **CORS Issues**
   ```
   Solution: Check FRONTEND_URL in backend .env file
   ```

4. **JWT Token Expired**
   ```
   Solution: Implement automatic token refresh or re-login
   ```

### Debug Mode

Enable debug mode for detailed logging:

```bash
# Backend
DEBUG=app:* npm run dev

# Frontend
REACT_APP_DEBUG=true npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style Guidelines

- Use ESLint and Prettier for code formatting
- Follow React Hooks best practices
- Write meaningful commit messages
- Add comments for complex logic
- Create unit tests for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:

- Create an issue on GitHub
- Email: support@clinicmanagement.com
- Documentation: [Wiki](wiki-url)

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Basic authentication and authorization
- ✅ Appointment booking and management
- ✅ User profile management
- ✅ Dashboard with basic analytics

### Phase 2 (Next)
- 📋 Complete schedule management
- 📋 Advanced reporting features
- 📋 Email notifications
- 📋 Patient medical records
- 📋 Prescription management

### Phase 3 (Future)
- 📋 Mobile app support
- 📋 Telemedicine integration
- 📋 Payment processing
- 📋 Advanced analytics and AI insights
- 📋 Multi-language support

## 🙏 Acknowledgments

- Ant Design team for the excellent UI components
- MongoDB team for the robust database
- React team for the amazing framework
- All contributors and testers

---

**Built with ❤️ by Senior Full-Stack Developer**

For more information, visit our [documentation](docs-url) or check out the [live demo](demo-url).
#   - C l i n i c - M a n a g e m e n t - S y s t e m  
 