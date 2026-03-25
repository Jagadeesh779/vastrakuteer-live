import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, roles }) => {
    let user = null;
    try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            user = JSON.parse(storedUser);
        }
    } catch (error) {
        console.error("Error parsing user data in ProtectedRoute:", error);
        localStorage.removeItem('user');
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (roles && !roles.includes(user.role)) {
        // Redirect based on role or to a default unauthorized page
        // For now, if admin tries to access user page, maybe allow?
        // But if user tries to access admin page, redirect to home.
        return <Navigate to="/home" replace />;
    }

    return children;
};

export default ProtectedRoute;
