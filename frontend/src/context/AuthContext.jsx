import React, { createContext, useContext, useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_ENDPOINTS } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAdmin, setIsAdmin] = useState(false);

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API_ENDPOINTS.AUTH.LOGIN.replace('/login', '/me')}`);
          if (response.data.success) {
            setUser(response.data.user);
            // Check if user is admin based on token
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            setIsAdmin(tokenPayload.role === 'admin');
          } else {
            // Token is invalid
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (credentials) => {
    try {
      // Handle both object and individual parameters
      const loginData = credentials.emailOrPhone ? credentials : {
        emailOrPhone: credentials.emailOrPhone || credentials.email,
        password: credentials.password
      };

      const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, loginData);

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('token', newToken);
        toast.success('Login successful!');
        return { success: true };
      } else {
        toast.error(response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.SIGNUP, userData);

      if (response.data.success) {
        const { token: newToken, user: newUser } = response.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        toast.success('Account created successfully!');
        return { success: true };
      } else {
        toast.error(response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Signup error:', error);
      const message = error.response?.data?.message || 'Signup failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const googleLogin = async (credentialResponse) => {
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.GOOGLE, {
        idToken: credentialResponse.credential
      });

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        setToken(newToken);
        setUser({
          ...userData,
          // Ensure profile picture is included
          profilePicture: userData.profilePicture || userData.picture
        });
        localStorage.setItem('token', newToken);
        toast.success('Google login successful!');
        return { success: true };
      } else {
        toast.error(response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Google login error:', error);
      const message = error.response?.data?.message || 'Google login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const adminLogin = async (credentials) => {
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.ADMIN_LOGIN, credentials);

      if (response.data.success) {
        const { token: newToken, admin: adminData } = response.data;
        setToken(newToken);
        setUser(adminData);
        setIsAdmin(true);
        localStorage.setItem('token', newToken);
        toast.success('Admin login successful!');
        return { success: true };
      } else {
        toast.error(response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Admin login error:', error);
      const message = error.response?.data?.message || 'Admin login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAdmin(false);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    token,
    loading,
    isAdmin,
    login,
    signup,
    googleLogin,
    adminLogin,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};