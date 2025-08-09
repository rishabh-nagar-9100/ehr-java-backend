# MediSync Backend API

A comprehensive Electronic Health Records (EHR) backend system built with Node.js, Express, and MongoDB.

## Features

- 🔐 **Authentication & Authorization**: JWT-based authentication with role-based access control
- 👥 **User Management**: Support for multiple user roles (Patient, Doctor, Hospital Owner, Staff)
- 🏥 **Patient Management**: Complete patient records with medical history
- 👨‍⚕️ **Doctor Management**: Doctor profiles with specializations and availability
- 📅 **Appointment System**: Comprehensive appointment scheduling and management
- 👨‍💼 **Staff Management**: Hospital staff management with department organization
- 📊 **Dashboard Analytics**: Real-time statistics and insights
- 🔒 **Security**: Rate limiting, CORS, helmet security headers
- 📝 **Data Validation**: Input validation and sanitization

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs, helmet, cors, express-rate-limit
- **Validation**: express-validator
- **Development**: nodemon, morgan logger

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Create a `.env` file with the following configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/medisync
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
   JWT_EXPIRE=7d
   
   # CORS Configuration
   CORS_ORIGIN=http://localhost:5173
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

3. **Start MongoDB**
   Make sure MongoDB is running on your system.

4. **Run the application**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Verify Installation**
   Visit `http://localhost:5000/health` to check if the server is running.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Patients
- `GET /api/patients` - Get all patients (with pagination)
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient
- `GET /api/patients/search` - Search patients
- `GET /api/patients/recent` - Get recent patients

### Doctors
- `GET /api/doctors` - Get all doctors
- `POST /api/doctors` - Create doctor profile
- `PUT /api/doctors/:id` - Update doctor
- `GET /api/doctors/available` - Get available doctors

### Staff
- `GET /api/staff` - Get all staff members
- `POST /api/staff` - Create staff member
- `PUT /api/staff/:id` - Update staff member
- `DELETE /api/staff/:id` - Deactivate staff member
- `GET /api/staff/departments` - Get staff by departments

### Appointments
- `GET /api/appointments` - Get appointments (with filtering)
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment
- `GET /api/appointments/upcoming` - Get upcoming appointments
- `GET /api/appointments/doctor/:doctorId` - Get doctor's appointments

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-patients` - Get recent patients
- `GET /api/dashboard/today-appointments` - Get today's appointments
- `GET /api/dashboard/appointment-trends` - Get appointment trends
- `GET /api/dashboard/department-stats` - Get department statistics
- `GET /api/dashboard/doctor-workload` - Get doctor workload

## User Roles

- **Patient**: Can view their own data and appointments
- **Doctor**: Can manage patients and appointments
- **Hospital Owner**: Full access to all hospital data
- **Staff**: Can assist with patient and appointment management

## Frontend Integration

This backend is designed to work with your React frontend:

- CORS configured for `http://localhost:5173` (Vite default)
- JWT tokens for authentication
- RESTful API design
- Consistent response format

## Next Steps

1. **Install dependencies**: `npm install`
2. **Create .env file** with the configuration above
3. **Start MongoDB** on your system
4. **Run the backend**: `npm run dev`
5. **Test the API**: Visit `http://localhost:5000/health`
6. **Connect your React frontend** to this backend

The backend is now ready to support your React EHR frontend! 
