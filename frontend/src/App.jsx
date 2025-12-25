import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import ProfileForm from './components/ProfileForm';
import Dashboard from './components/Dashboard';
import MonthlyDashboard from './components/MonthlyDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import WaterTracker from './pages/WaterTracker';
import WeightTracker from './pages/WeightTracker';
import ActivityTracker from './pages/ActivityTracker';
import SleepTracker from './pages/SleepTracker';
import ProfilePage from './pages/ProfilePage';
import LandingPage from './pages/LandingPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { getDashboardSummary } from './api';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Component to handle internal routing checks
const AuthenticatedApp = () => {
  const [hasProfile, setHasProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    checkProfile();
  }, []);

  const checkProfile = async () => {
    try {
      await getDashboardSummary();
      setHasProfile(true);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setHasProfile(false);
      } else {
        setHasProfile(false);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-teal-600">Loading...</div>;

  if (!hasProfile) {
    return (
      <Layout>
        <div className="py-10">
          <ProfileForm onProfileUpdated={() => setHasProfile(true)} />
        </div>
      </Layout>
    );
  }

  // Routing logic for authenticated users with existing profile
  if (location.pathname === '/water') {
    return (
      <Layout>
        <WaterTracker />
      </Layout>
    );
  }

  if (location.pathname === '/weight') {
    return (
      <Layout>
        <WeightTracker />
      </Layout>
    );
  }

  if (location.pathname === '/activity') {
    return (
      <Layout>
        <ActivityTracker />
      </Layout>
    );
  }

  if (location.pathname === '/monthly-report') {
    return (
      <Layout>
        <MonthlyDashboard />
      </Layout>
    );
  }

  if (location.pathname === '/sleep') {
    return (
      <Layout>
        <SleepTracker />
      </Layout>
    );
  }

  if (location.pathname === '/profile') {
    return (
      <Layout>
        <ProfilePage />
      </Layout>
    );
  }

  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <AuthenticatedApp />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
