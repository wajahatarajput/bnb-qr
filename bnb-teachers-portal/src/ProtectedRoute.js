import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./providers";
import { Dashboard } from "./components";

// Custom ProtectedRoute component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, cookies } = useAuth();

    if (!isAuthenticated && !cookies.get('authToken'))
        return <Navigate to="/" replace />

    return (
        <>
            <Dashboard>
                {children}
            </Dashboard>
        </>
    )
};

export default ProtectedRoute;
