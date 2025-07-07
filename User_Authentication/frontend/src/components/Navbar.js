import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { currentUser, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Auth System</Link>
      </div>
      
      <div className="navbar-menu">
        {currentUser ? (
          <>
            <Link to="/profile" className="nav-link">Profile</Link>
            {isAdmin() && <Link to="/admin" className="nav-link">Admin Dashboard</Link>}
            <button onClick={handleLogout} className="nav-link btn-link">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 