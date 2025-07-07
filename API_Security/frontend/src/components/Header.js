import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const Header = ({ isAuthenticated, onLogout }) => {
  return (
    <header className="header">
      <div className="logo">
        <Link to="/">Secure API</Link>
      </div>
      <nav className="nav">
        {isAuthenticated ? (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/profile">Profile</NavLink>
            <button onClick={onLogout}>Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header; 