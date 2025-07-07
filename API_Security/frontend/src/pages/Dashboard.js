import React, { useState, useEffect } from 'react';
import { systemApi } from '../services/api';

const Dashboard = ({ user }) => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const data = await systemApi.healthCheck();
        setHealthStatus(data);
      } catch (error) {
        console.error('Health check error:', error);
        setError('Failed to check API health status');
      } finally {
        setIsLoading(false);
      }
    };

    checkHealth();
  }, []);

  return (
    <div>
      <h2>Welcome, {user.username}!</h2>
      
      <div className="card">
        <h3>API Status</h3>
        {isLoading ? (
          <p>Checking API status...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <div>
            <p>Status: <span className="success">{healthStatus?.status}</span></p>
            <p>Version: {healthStatus?.version}</p>
            <p>Last checked: {new Date().toLocaleString()}</p>
          </div>
        )}
      </div>
      
      <div className="card">
        <h3>Security Features</h3>
        <ul>
          <li>JWT Authentication with refresh tokens</li>
          <li>Rate limiting on sensitive endpoints</li>
          <li>Input validation and sanitization</li>
          <li>CORS configuration</li>
          <li>Security headers</li>
          <li>Custom error handling</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard; 