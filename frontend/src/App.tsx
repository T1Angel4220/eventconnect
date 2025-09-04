import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import VerifyCode from './pages/VerifyCode';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/login-Web/PrivateRoute';
import PublicRoute from './components/login-Web/PublicRoute';

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
                <Route path="/dashboard" element={
                    <PrivateRoute allowedRoles={['admin', 'organizer']}>
                        <Dashboard />
                    </PrivateRoute>
                } />
            </Routes>
        </Router>
    );
};

export default App;

