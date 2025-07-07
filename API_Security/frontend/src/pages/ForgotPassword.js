import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Basic validation
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      setIsLoading(true);
      await authApi.forgotPassword(email);
      setSuccess('If your email is registered, you will receive a password reset link.');
      setEmail(''); // Clear the form
    } catch (error) {
      console.error('Forgot password error:', error);
      
      if (error.response && error.response.status === 429) {
        setError('Too many password reset attempts. Please try again later.');
      } else {
        // Always show the same message for security reasons
        setSuccess('If your email is registered, you will receive a password reset link.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Forgot Password</h2>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
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
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Reset Password'}
          </button>
        </div>
        
        <div>
          <Link to="/login">Back to Login</Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword; 