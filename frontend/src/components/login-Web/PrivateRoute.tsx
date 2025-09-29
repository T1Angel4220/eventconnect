import React, { type ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
    children: ReactNode;
    allowedRoles?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const firstName = localStorage.getItem('firstName');

        if (!token || !role || !firstName) {
            setIsAuthenticated(false);
        } else if (allowedRoles && !allowedRoles.includes(role)) {
            setIsAuthenticated(false);
        } else {
            setIsAuthenticated(true);
        }
        
        setIsChecking(false);
    }, [allowedRoles]);

    if (isChecking) {
        return (
            <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default PrivateRoute;
