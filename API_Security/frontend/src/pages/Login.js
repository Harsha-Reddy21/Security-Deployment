import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../services/api';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!username.trim() || !password) {
      setError('Username and password are required');
      return;
    }
    
    try {
      setIsLoading(true);
      const data = await authApi.login(username, password);
      
      // Create a simple user object from the token
      const user = { username };
      
      // Call the login handler from parent component
      onLogin(user, data.access_token, data.refresh_token);
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.response && error.response.status === 429) {
        setError('Too many login attempts. Please try again later.');
      } else if (error.response && error.response.data) {
        setError(error.response.data.detail || 'Invalid username or password');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Login</h2>
      {error && <div className="error">{error}</div>}
      
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
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </div>
        
        <div>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
        <div>
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </form>
    </div>
  );
};

export default Login; 