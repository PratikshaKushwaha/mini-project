import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { user, loading } = useSelector((state) => state.auth);

    if (loading) {
        return <div className="text-center py-20 text-muted-taupe">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && user.role !== 'admin') {
        return <Navigate to="/" replace />; // Redirect non-admins trying to access admin routes
    }

    return children;
};

export default ProtectedRoute;
