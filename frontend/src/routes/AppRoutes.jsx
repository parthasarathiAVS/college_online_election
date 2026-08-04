import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Public Pages
import LandingPage from '../pages/LandingPage';
import CollegeRegister from '../pages/CollegeRegister';
import CollegeLogin from '../pages/CollegeLogin';
import SuperAdminLogin from '../pages/SuperAdminLogin';

// Super Admin
import SuperAdminDashboard from '../pages/SuperAdminDashboard';

// Dashboard Pages
import DashboardOverview from '../pages/DashboardOverview';
import StudentManagement from '../pages/StudentManagement';
import CandidateManagement from '../pages/CandidateManagement';
import DepartmentManagement from '../pages/DepartmentManagement';
import PositionManagement from '../pages/PositionManagement';
import ElectionManagement from '../pages/ElectionManagement';
import BoothControl from '../pages/BoothControl';
import ResultsPage from '../pages/ResultsPage';
import ReportsPage from '../pages/ReportsPage';
import SettingsPage from '../pages/SettingsPage';

// EVM Kiosk Page
import EVMScreen from '../pages/EVMScreen';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="register" element={<CollegeRegister />} />
        <Route path="login" element={<CollegeLogin />} />
        <Route path="superadmin/login" element={<SuperAdminLogin />} />
      </Route>

      {/* Super Admin Dashboard */}
      <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />

      {/* College Dashboard Routes */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardOverview />} />
        <Route path="students" element={<StudentManagement />} />
        <Route path="candidates" element={<CandidateManagement />} />
        <Route path="departments" element={<DepartmentManagement />} />
        <Route path="positions" element={<PositionManagement />} />
        <Route path="elections" element={<ElectionManagement />} />
        <Route path="booth" element={<BoothControl />} />
        <Route path="results" element={<ResultsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* EVM Kiosk Fullscreen Mode */}
      <Route path="/evm-kiosk" element={<EVMScreen />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
