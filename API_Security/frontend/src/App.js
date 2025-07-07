import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  
  // Check if user is already logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      // In a real app, we would validate the token and fetch user data
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(userData);
    }
  }, []);
  
  const handleLogin = (userData, token, refreshToken) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    navigate('/dashboard');
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };
  
  return (
    <div className="container">
      <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        <Route path="/login" element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
        <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard user={user} /> : <Navigate to="/login" />} />
        <Route path="/profile" element={isAuthenticated ? <Profile user={user} /> : <Navigate to="/login" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App; 