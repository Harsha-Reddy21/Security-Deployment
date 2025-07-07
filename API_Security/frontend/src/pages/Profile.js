import React, { useState, useEffect } from 'react';
import { userApi } from '../services/api';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await userApi.getCurrentUser();
        setUserData(data);
        setEmail(data.email);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

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
      setIsSaving(true);
      await userApi.updateUser({ email });
      setSuccess('Profile updated successfully');
      
      // Update local user data
      setUserData({
        ...userData,
        email
      });
    } catch (error) {
      console.error('Update profile error:', error);
      
      if (error.response && error.response.data) {
        setError(error.response.data.detail || 'Failed to update profile');
      } else {
        setError('Failed to update profile');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="card">
      <h2>User Profile</h2>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={userData?.username || ''}
            disabled
          />
          <small>Username cannot be changed</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSaving}
          />
        </div>
        
        <div className="form-group">
          <button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Update Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile; 