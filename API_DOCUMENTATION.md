# Clinic Management System - API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information (development only)"
}
```

## Authentication Endpoints

### POST /auth/login
User login

**Request Body:**
```json
{
  "email": "receptionist@clinic.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "User Name",
      "email": "user@email.com",
      "role": "RECEPTIONIST"
    },
    "token": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

### POST /auth/register
User registration

**Request Body:**
```json
{
  "name": "Full Name",
  "email": "user@email.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "PATIENT"
}
```

### POST /auth/forgot-password
Request password reset

**Request Body:**
```json
{
  "email": "user@email.com"
}
```

### POST /auth/reset-password/:token
Reset password with token

**Request Body:**
```json
{
  "password": "newpassword123"
}
```

### GET /auth/me
Get current user profile (Protected)

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "User Name",
      "email": "user@email.com",
      "phone": "+1234567890",
      "role": "RECEPTIONIST",
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

## User Management Endpoints

### GET /users/me
Get current user profile (Protected)

### PATCH /users/me
Update current user profile (Protected)

**Request Body:**
```json
{
  "name": "Updated Name",
  "phone": "+1234567890"
}
```

### POST /users
Create new user (Protected - Receptionist/Admin)

**Request Body:**
```json
{
  "name": "Doctor Name",
  "email": "doctor@clinic.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "DOCTOR",
  "specialty": "CARDIOLOGY",
  "licenseNumber": "MD001",
  "experience": 10,
  "consultationFee": 150
}
```

### GET /users/doctors
Get all doctors (Protected)

**Query Parameters:**
- `specialty` - Filter by specialty
- `isAvailable` - Filter by availability
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "doctors": [
      {
        "_id": "doctor_id",
        "user": {
          "name": "Dr. John Smith",
          "email": "john.smith@clinic.com",
          "phone": "+1234567890"
        },
        "specialty": "CARDIOLOGY",
        "licenseNumber": "MD001",
        "experience": 10,
        "consultationFee": 150,
        "rating": 4.8,
        "totalReviews": 45
      }
    ],
    "pagination": {
      "page": 1,
      "pages": 1,
      "total": 1,
      "limit": 10
    }
  }
}
```

### GET /users/patients
Get all patients (Protected)

### GET /users/specialties
Get available medical specialties (Protected)

**Response:**
```json
{
  "success": true,
  "data": {
    "specialties": [
      "CARDIOLOGY",
      "DERMATOLOGY",
      "NEUROLOGY",
      "ORTHOPEDICS",
      "PEDIATRICS",
      "PSYCHIATRY"
    ]
  }
}
```

## Schedule Management Endpoints

### GET /schedules
Get all schedules (Protected)

**Query Parameters:**
- `doctorId` - Filter by doctor ID
- `specialty` - Filter by specialty
- `date` - Filter by specific date (YYYY-MM-DD)
- `startDate` - Filter from date
- `endDate` - Filter to date
- `status` - Filter by status (default: ACTIVE)
- `page` - Page number
- `limit` - Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "schedules": [
      {
        "_id": "schedule_id",
        "doctor": {
          "user": {
            "name": "Dr. John Smith"
          },
          "specialty": "CARDIOLOGY"
        },
        "date": "2023-12-01T00:00:00.000Z",
        "startTime": "09:00",
        "endTime": "17:00",
        "slotDuration": 30,
        "maxPatients": 1,
        "location": "Main Clinic"
      }
    ]
  }
}
```

### POST /schedules
Create new schedule (Protected)

**Request Body:**
```json
{
  "doctorId": "doctor_id",
  "date": "2023-12-01",
  "startTime": "09:00",
  "endTime": "17:00",
  "slotDuration": 30,
  "maxPatients": 1,
  "location": "Main Clinic",
  "notes": "Regular clinic hours"
}
```

### GET /schedules/available/:doctorId
Get available time slots for a doctor

**Query Parameters:**
- `date` - Required. Date to check availability (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "availableSlots": [
      {
        "time": "09:00",
        "scheduleId": "schedule_id",
        "availableSpots": 1,
        "maxPatients": 1
      },
      {
        "time": "09:30",
        "scheduleId": "schedule_id",
        "availableSpots": 1,
        "maxPatients": 1
      }
    ]
  }
}
```

## Appointment Management Endpoints

### GET /appointments
Get all appointments (Protected)

**Query Parameters:**
- `patientId` - Filter by patient
- `doctorId` - Filter by doctor
- `status` - Filter by status
- `date` - Filter by specific date
- `startDate` - Filter from date
- `endDate` - Filter to date
- `page` - Page number
- `limit` - Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "_id": "appointment_id",
        "patient": {
          "user": {
            "name": "John Doe",
            "email": "john.doe@email.com"
          }
        },
        "doctor": {
          "user": {
            "name": "Dr. John Smith"
          },
          "specialty": "CARDIOLOGY"
        },
        "appointmentDate": "2023-12-01T00:00:00.000Z",
        "appointmentTime": "09:00",
        "status": "SCHEDULED",
        "priority": "NORMAL",
        "reason": "Regular checkup",
        "consultationFee": 150
      }
    ]
  }
}
```

### POST /appointments
Book new appointment (Protected)

**Request Body:**
```json
{
  "patientId": "patient_id",
  "doctorId": "doctor_id",
  "scheduleId": "schedule_id",
  "appointmentDate": "2023-12-01",
  "appointmentTime": "09:00",
  "reason": "Regular checkup",
  "priority": "NORMAL",
  "appointmentType": "CONSULTATION",
  "notes": "Patient has been experiencing chest pain"
}
```

### PATCH /appointments/:id/status
Update appointment status (Protected)

**Request Body:**
```json
{
  "status": "CONFIRMED",
  "notes": "Patient confirmed via phone"
}
```

### DELETE /appointments/:id
Cancel appointment (Protected)

**Request Body:**
```json
{
  "reason": "Patient requested cancellation"
}
```

## Reports Endpoints

### GET /reports/overview
Get operational reports overview (Protected)

**Query Parameters:**
- `startDate` - Report start date (YYYY-MM-DD)
- `endDate` - Report end date (YYYY-MM-DD)
- `period` - Report period (month, week, day)

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalPatients": 150,
      "totalDoctors": 12,
      "totalAppointments": 1250,
      "totalRevenue": 187500,
      "completionRate": 85,
      "cancellationRate": 8
    },
    "charts": {
      "dailyTrends": [
        {
          "date": "2023-11-01",
          "total": 25,
          "completed": 22,
          "cancelled": 2
        }
      ],
      "monthlyRevenue": [
        {
          "month": "2023-11",
          "revenue": 45000,
          "appointments": 300
        }
      ],
      "specialtyStats": [
        {
          "specialty": "CARDIOLOGY",
          "appointments": 150,
          "revenue": 22500
        }
      ]
    }
  }
}
```

## Feedback Endpoints

### GET /feedback
Get all feedback (Protected)

**Query Parameters:**
- `doctorId` - Filter by doctor
- `rating` - Filter by rating (1-5 or range like "4-5")
- `status` - Filter by status (APPROVED, REJECTED, PENDING)
- `page` - Page number
- `limit` - Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "feedback": [
      {
        "_id": "feedback_id",
        "patient": {
          "user": {
            "name": "John Doe"
          }
        },
        "doctor": {
          "user": {
            "name": "Dr. John Smith"
          },
          "specialty": "CARDIOLOGY"
        },
        "rating": 5,
        "comment": "Excellent service and care!",
        "wouldRecommend": true,
        "status": "APPROVED",
        "isPublic": true,
        "createdAt": "2023-11-01T00:00:00.000Z"
      }
    ],
    "statistics": {
      "averageRating": 4.7,
      "totalReviews": 125,
      "ratingDistribution": {
        "1": 2,
        "2": 5,
        "3": 18,
        "4": 45,
        "5": 55
      }
    }
  }
}
```

### PATCH /feedback/:id/status
Update feedback status (Protected)

**Request Body:**
```json
{
  "status": "APPROVED",
  "adminMessage": "Thank you for your feedback"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 500 | Internal Server Error |

## Rate Limiting

API requests are limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

**Response Format:**
```json
{
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "pages": 5,
      "total": 50,
      "limit": 10
    }
  }
}
```

## Filtering and Sorting

Many endpoints support filtering and sorting:

**Common Query Parameters:**
- `search` - Text search
- `sortBy` - Field to sort by
- `sortOrder` - Sort order (asc, desc)
- `status` - Filter by status
- `startDate` - Filter from date
- `endDate` - Filter to date

## WebSocket Events (Future)

For real-time updates:

```javascript
// Connect to WebSocket
const socket = io('http://localhost:5000');

// Listen for appointment updates
socket.on('appointment:updated', (data) => {
  console.log('Appointment updated:', data);
});

// Listen for new appointments
socket.on('appointment:created', (data) => {
  console.log('New appointment:', data);
});
```

## SDK Usage Example

```javascript
import axios from 'axios';

// Create API client
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login
const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', response.data.data.token);
  return response.data;
};

// Get appointments
const getAppointments = async (params = {}) => {
  const response = await api.get('/appointments', { params });
  return response.data;
};

// Book appointment
const bookAppointment = async (appointmentData) => {
  const response = await api.post('/appointments', appointmentData);
  return response.data;
};
```

## Testing

Use the provided Postman collection or test with curl:

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"receptionist@clinic.com","password":"password123"}'

# Get appointments (with token)
curl -X GET http://localhost:5000/api/appointments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
