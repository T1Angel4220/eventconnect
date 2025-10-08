import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterSuccess from './pages/RegisterSuccess';
import ForgotPassword from './pages/ForgotPassword';
import VerifyCode from './pages/VerifyCode';
import ResetPassword from './pages/ResetPassword';
import PasswordResetSuccess from './pages/PasswordResetSuccess';
import Dashboard from './pages/Dashboard';
import EventsManagement from './pages/EventsManagement';
import RegistrationsManagement from './pages/RegistrationsManagement';
import Configuration from './pages/Configuration';
import AdminPanel from './pages/AdminPanel';
import PrivateRoute from './components/login-Web/PrivateRoute';
import PublicRoute from './components/login-Web/PublicRoute';
import { DashboardProvider } from './contexts/DashboardContext';

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                } />
                <Route path="/login" element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                } />
                <Route path="/register" element={
                    <PublicRoute>
                        <Register />
                    </PublicRoute>
                } />
                <Route path="/register-success" element={
                    <PublicRoute>
                        <RegisterSuccess />
                    </PublicRoute>
                } />
                <Route path="/forgot-password" element={
                    <PublicRoute>
                        <ForgotPassword />
                    </PublicRoute>
                } />
                <Route path="/verify-code" element={
                    <PublicRoute>
                        <VerifyCode />
                    </PublicRoute>
                } />
                <Route path="/reset-password" element={
                    <PublicRoute>
                        <ResetPassword />
                    </PublicRoute>
                } />
                <Route path="/password-reset-success" element={
                    <PublicRoute>
                        <PasswordResetSuccess />
                    </PublicRoute>
                } />
                <Route path="/dashboard" element={
                    <PrivateRoute allowedRoles={['admin', 'organizer', 'participant']}>
                        <DashboardProvider>
                            <Dashboard />
                        </DashboardProvider>
                    </PrivateRoute>
                } />
                <Route path="/events-management" element={
                    <PrivateRoute allowedRoles={['admin', 'organizer']}>
                        <DashboardProvider>
                            <EventsManagement />
                        </DashboardProvider>
                    </PrivateRoute>
                } />
                <Route path="/registrations-management" element={
                    <PrivateRoute allowedRoles={['admin', 'organizer']}>
                        <DashboardProvider>
                            <RegistrationsManagement />
                        </DashboardProvider>
                    </PrivateRoute>
                } />
                <Route path="/configuration" element={
                    <PrivateRoute allowedRoles={['admin', 'organizer']}>
                        <DashboardProvider>
                            <Configuration />
                        </DashboardProvider>
                    </PrivateRoute>
                } />
                <Route path="/admin-panel" element={
                    <PrivateRoute allowedRoles={['admin']}>
                        <AdminPanel />
                    </PrivateRoute>
                } />
                 {/* Ruta catch-all */}
                 <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
};

export default App;

