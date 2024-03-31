import React, { createContext, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { toast } from 'react-toastify';
import Cookies from 'universal-cookie';

// Create a context to hold authentication state and related functions
const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);

// AuthProvider component to wrap your application
export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const cookies = new Cookies(null, { path: '/' });

    const navigate = useNavigate();

    // Function to handle login
    const login = async (params) => {
        // Logic to perform login
        await axios.post('http://localhost:5000/api/login', params).then((res) => {
            if (res.data.token) {
                toast.success('Login Successfully')
                setIsAuthenticated(true);
                cookies.set("authToken", res.data.token);
                cookies.set("id", res.data.id);
                navigate("/dashboard");
            } else {
                toast.error('Invalid Credentials')
            }
        })
    };

    // Function to handle logout
    const logout = () => {
        // Logic to perform logout
        setIsAuthenticated(false);
        cookies.remove('authToken');
        navigate("/");
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, cookies }}>
            {children}
        </AuthContext.Provider>
    );
};
