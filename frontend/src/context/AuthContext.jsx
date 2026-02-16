import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            try {
                const decoded = jwtDecode(storedToken);
                // Check if token is expired
                const currentTime = Date.now() / 1000;
                if (decoded.exp < currentTime) {
                    logout();
                } else {
                    setToken(storedToken);
                    // If the token contains user info, set it. Otherwise you might need to fetch profile.
                    // Assuming token has role and possibly name/email. 
                    // Adjustable based on backend JWT payload.
                    setUser({
                        role: decoded.role,
                        sub: decoded.sub, // username or email
                        ...decoded
                    });
                }
            } catch (error) {
                console.error("Invalid token:", error);
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { username: email, password });
            const { access_token } = response.data;
            console.log('Login Response:', response.data); // DEBUG
            console.log('Access Token:', access_token); // DEBUG

            if (!access_token) {
                console.error('No access token received!');
                return { success: false, error: 'No access token received' };
            }

            const decoded = jwtDecode(access_token);
            localStorage.setItem('token', access_token);
            setToken(access_token);
            setUser({ role: decoded.role, sub: decoded.sub, ...decoded });
            return { success: true, role: decoded.role };
        } catch (error) {
            console.error("Login failed", error);
            return { success: false, error: error.response?.data?.detail || "Login failed" };
        }
    };

    const register = async (userData) => {
        try {
            await api.post('/auth/register', userData);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.detail || "Registration failed" };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const forgotPassword = async (email) => {
        try {
            await api.post('/auth/forgot-password', { email });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.detail || "Request failed" };
        }
    };

    const verifyOtp = async (email, otp) => {
        try {
            await api.post('/auth/verify-otp', { email, otp });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.detail || "Verification failed" };
        }
    };

    const resetPassword = async (token, newPassword) => {
        try {
            await api.post('/auth/reset-password', { token, new_password: newPassword });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.detail || "Reset failed" };
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            login,
            logout,
            register,
            forgotPassword,
            verifyOtp,
            resetPassword
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
