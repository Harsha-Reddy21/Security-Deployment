import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { currentUser, logout } = useAuth();

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>User Profile</h2>
        
        <div className="profile-info">
          <div className="info-group">
            <label>Username:</label>
            <p>{currentUser.username}</p>
          </div>
          
          <div className="info-group">
            <label>Email:</label>
            <p>{currentUser.email}</p>
          </div>
          
          <div className="info-group">
            <label>Role:</label>
            <p>{currentUser.role}</p>
          </div>
        </div>
        
        <button onClick={logout} className="btn btn-danger">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile; 