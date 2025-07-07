import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    setLoading(false);
  }, []);
  
  // Login function
  const login = async (email, password) => {
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await api.post('/auth/login', formData);
      
      const { access_token } = response.data;
      
      // Set token in axios headers
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      // Get user profile
      const userResponse = await api.get('/auth/me');
      
      // Store user and token in localStorage
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userResponse.data));
      
      setUser(userResponse.data);
      
      toast.success('Login successful!');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.detail || 'Login failed. Please try again.');
      return false;
    }
  };
  
  // Register function
  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      toast.success('Registration successful! Please login.');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.detail || 'Registration failed. Please try again.');
      return false;
    }
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    toast.info('You have been logged out.');
  };
  
  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const response = await api.put('/auth/profile', userData);
      
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(response.data));
      setUser(response.data);
      
      toast.success('Profile updated successfully!');
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.detail || 'Failed to update profile. Please try again.');
      return false;
    }
  };
  
  // Verify phone number
  const verifyPhone = async (phone, code) => {
    try {
      const response = await api.post('/auth/verify-phone', {
        phone,
        verification_code: code
      });
      
      // Update user data with verified phone
      const userResponse = await api.get('/auth/me');
      localStorage.setItem('user', JSON.stringify(userResponse.data));
      setUser(userResponse.data);
      
      toast.success('Phone number verified successfully!');
      return true;
    } catch (error) {
      console.error('Phone verification error:', error);
      toast.error(error.response?.data?.detail || 'Failed to verify phone number. Please try again.');
      return false;
    }
  };
  
  // Check if user is authenticated
  const isAuthenticated = !!user;
  
  // Auth context value
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    verifyPhone,
    isAuthenticated
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 