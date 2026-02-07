import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import VerifyOtpPage from './pages/auth/VerifyOtpPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Layouts
import InstructorLayout from './layouts/InstructorLayout';
import LearnerLayout from './layouts/LearnerLayout';

// Instructor Pages
import Dashboard from './pages/instructor/Dashboard';
import Courses from './pages/instructor/Courses';
import Learners from './pages/instructor/Learners';
import Profile from './pages/instructor/Profile';

// Learner Pages
import LearnerDashboard from './pages/learner/Dashboard';
import MyCourses from './pages/learner/MyCourses';
import LearnerProfile from './pages/learner/Profile';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected Routes - Instructor (Public for UI Development) */}
          <Route path="/instructor" element={<InstructorLayout />}>
            <Route index element={<Navigate to="/instructor/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="courses" element={<Courses />} />
            <Route path="learners" element={<Learners />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Protected Routes - Authenticated Example (kept for reference) */}
          <Route element={<PrivateRoute allowedRoles={['instructor']} />}>
            {/* Real protected routes would go here */}
          </Route>

          {/* Protected Routes - Learner (Public for UI Development) */}
          <Route path="/learner" element={<LearnerLayout />}>
            <Route index element={<Navigate to="/learner/dashboard" replace />} />
            <Route path="dashboard" element={<LearnerDashboard />} />
            <Route path="my-courses" element={<MyCourses />} />
            <Route path="profile" element={<LearnerProfile />} />
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/learner/dashboard" replace />} />
          </Route>

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
