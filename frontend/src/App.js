import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Layout, Spin } from 'antd';
import { selectIsAuthenticated, selectAuthLoading, getCurrentUser } from './store/slices/authSlice';
import ProtectedRoute from './components/common/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import Dashboard from './components/dashboard/Dashboard';
import Profile from './components/profile/Profile';
import UpdateProfile from './components/profile/UpdateProfile';
import Appointments from './components/appointments/Appointments';
import BookAppointment from './components/appointments/BookAppointment';
import Schedules from './components/schedules/Schedules';
import ManageSchedule from './components/schedules/ManageSchedule';
import CreateUser from './components/users/CreateUser';
import Reports from './components/reports/Reports';
import Feedback from './components/feedback/Feedback';

const { Content } = Layout;

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectAuthLoading);

  useEffect(() => {
    // Get current user data if token exists
    if (isAuthenticated) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        } 
      />
      <Route 
        path="/register" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
        } 
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Protected Routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Content className="app-content">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  
                  {/* Profile Routes */}
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/edit" element={<UpdateProfile />} />
                  
                  {/* Appointment Routes */}
                  <Route path="/appointments" element={<Appointments />} />
                  <Route path="/appointments/book" element={<BookAppointment />} />
                  
                  {/* Schedule Routes */}
                  <Route path="/schedules" element={<Schedules />} />
                  <Route path="/schedules/manage" element={<ManageSchedule />} />
                  <Route path="/schedules/manage/:id" element={<ManageSchedule />} />
                  
                  {/* User Management Routes */}
                  <Route path="/users/create" element={<CreateUser />} />
                  
                  {/* Reports Routes */}
                  <Route path="/reports" element={<Reports />} />
                  
                  {/* Feedback Routes */}
                  <Route path="/feedback" element={<Feedback />} />
                  
                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Content>
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
