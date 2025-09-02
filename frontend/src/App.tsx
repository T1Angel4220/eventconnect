import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/login-Web/PrivateRoute';

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
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

