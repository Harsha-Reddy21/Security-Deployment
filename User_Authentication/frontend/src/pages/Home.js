import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { currentUser } = useAuth();

  return (
    <div className="home-container">
      <div className="hero">
        <h1>Secure Authentication System</h1>
        <p>A secure user authentication system with JWT tokens and role-based access control.</p>
        
        {currentUser ? (
          <div className="cta-buttons">
            <Link to="/profile" className="btn btn-primary">Go to Profile</Link>
          </div>
        ) : (
          <div className="cta-buttons">
            <Link to="/login" className="btn btn-primary">Login</Link>
            <Link to="/register" className="btn btn-secondary">Register</Link>
          </div>
        )}
      </div>
      
      <div className="features">
        <div className="feature-card">
          <h3>Secure Authentication</h3>
          <p>Password hashing with bcrypt and JWT tokens for secure authentication.</p>
        </div>
        
        <div className="feature-card">
          <h3>Role-Based Access</h3>
          <p>Different access levels for regular users and administrators.</p>
        </div>
        
        <div className="feature-card">
          <h3>User Management</h3>
          <p>Administrators can manage users, change roles, and delete accounts.</p>
        </div>
      </div>
    </div>
  );
};

export default Home; 