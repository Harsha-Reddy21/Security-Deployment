import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Load all users
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to load users: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Change user role
  const changeRole = async (userId, newRole) => {
    try {
      await userService.updateUserRole(userId, newRole);
      // Refresh user list
      loadUsers();
    } catch (err) {
      setError('Failed to update role: ' + (err.response?.data?.detail || err.message));
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      await userService.deleteUser(userId);
      // Refresh user list
      loadUsers();
    } catch (err) {
      setError('Failed to delete user: ' + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="admin-container">
      <h2>Admin Dashboard</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
        <div className="user-list">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <button
                      onClick={() => changeRole(user.id, user.role === 'admin' ? 'user' : 'admin')}
                      className="btn btn-sm btn-primary"
                    >
                      {user.role === 'admin' ? 'Make User' : 'Make Admin'}
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="btn btn-sm btn-danger"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 