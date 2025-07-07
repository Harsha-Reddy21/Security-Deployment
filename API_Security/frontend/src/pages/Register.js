import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    // Username validation
    if (!username.trim()) {
      setError('Username is required');
      return false;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username must contain only letters, numbers, and underscores');
      return false;
    }
    
    // Email validation
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // Password validation
    if (!password) {
      setError('Password is required');
      return false;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter');
      return false;
    }
    
    if (!/[a-z]/.test(password)) {
      setError('Password must contain at least one lowercase letter');
      return false;
    }
    
    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number');
      return false;
    }
    
    // Confirm password
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsLoading(true);
      await authApi.register(username, email, password);
      setSuccess('Registration successful! You can now log in.');
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.response && error.response.status === 429) {
        setError('Too many registration attempts. Please try again later.');
      } else if (error.response && error.response.data) {
        setError(error.response.data.detail || 'Registration failed');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Register</h2>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group">
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </div>
        
        <div>
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </form>
    </div>
  );
};

export default Register; 