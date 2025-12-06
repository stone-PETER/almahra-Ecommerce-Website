import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../common/Button/Button.jsx';
import adminService from '../../../services/adminService.js';
import './UserManagement.css';

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await adminService.getAllUsers();
        setUsers(response.users || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching users:', err);
        // Only show error for server errors, not empty data
        if (err.response && err.response.status >= 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(null);
        }
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const roles = [
    { id: 'all', name: 'All Roles' },
    { id: 'customer', name: 'Customers' },
    { id: 'admin', name: 'Admins' }
  ];

  const filteredUsers = users.filter(user => {
    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
    const matchesSearch = userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role?.toLowerCase() === selectedRole.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const getStatusClass = (status) => {
    return status === 'active' ? 'status--success' : 'status--danger';
  };

  const getRoleClass = (role) => {
    return role === 'admin' ? 'role--admin' : 'role--customer';
  };

  const handleDeleteUser = async (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    // Prevent deleting yourself
    if (currentUser && currentUser.id === userId) {
      alert('You cannot delete your own account while logged in.');
      return;
    }
    
    // Warn about deleting admin users
    if (user.role === 'ADMIN' || user.role === 'admin') {
      if (!window.confirm(`⚠️ WARNING: You are about to delete an ADMIN user (${user.email}). This will remove all their admin privileges. Are you absolutely sure?`)) {
        return;
      }
    }
    
    // Final confirmation for any user deletion
    if (!window.confirm(`Delete user "${user.fullName || user.email}"? This action cannot be undone and will remove all their data.`)) {
      return;
    }
    
    try {
      // For now just log, as delete endpoint may not exist
      console.log('Delete user:', userId);
      alert('User deletion endpoint is not yet implemented in the backend. This feature will be available soon.');
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user: ' + (err.message || 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div className="user-management">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-management">
        <div className="error-state">
          <h2>Error Loading Users</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="user-management__header">
        <h1 className="user-management__title">User Management</h1>
        <div className="user-stats">
          <div className="user-stat">
            <span className="user-stat__value">{users.filter(u => u.status === 'active').length}</span>
            <span className="user-stat__label">Active Users</span>
          </div>
          <div className="user-stat">
            <span className="user-stat__value">{users.filter(u => u.role === 'customer').length}</span>
            <span className="user-stat__label">Customers</span>
          </div>
          <div className="user-stat">
            <span className="user-stat__value">{users.filter(u => u.role === 'admin').length}</span>
            <span className="user-stat__label">Admins</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="user-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="role-select"
        >
          {roles.map(role => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>

      {/* Users Grid */}
      <div className="users-grid">
        {filteredUsers.length > 0 ? (
          filteredUsers.map(user => (
          <div key={user.id} className="user-card">
            <div className="user-card__header">
              <div className="user-avatar">
                {user.firstName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="user-card__badges">
                <span className={`role-badge ${getRoleClass(user.role)}`}>
                  {user.role}
                </span>
              </div>
            </div>

            <div className="user-card__content">
              <h3 className="user-card__name">{user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email}</h3>
              <p className="user-card__email">{user.email}</p>
              <p className="user-card__join-date">
                Joined: {new Date(user.createdAt || Date.now()).toLocaleDateString()}
              </p>

              {user.role === 'CUSTOMER' && (
                <div className="user-card__stats">
                  <div className="user-stat-item">
                    <span className="stat-value">{user.totalOrders || 0}</span>
                    <span className="stat-label">Orders</span>
                  </div>
                  <div className="user-stat-item">
                    <span className="stat-value">₹{user.totalSpent?.toLocaleString() || 0}</span>
                    <span className="stat-label">Spent</span>
                  </div>
                </div>
              )}
            </div>

            <div className="user-card__actions">
              <Button 
                variant="secondary"
                size="small"
                onClick={() => handleDeleteUser(user.id)}
                className="btn--danger"
                disabled={currentUser && currentUser.id === user.id}
              >
                {currentUser && currentUser.id === user.id ? 'You' : 'Delete'}
              </Button>
            </div>
          </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-state__icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3 className="empty-state__title">No users found</h3>
            <p className="empty-state__message">
              {users.length === 0 
                ? "No users have registered yet. Users will appear here once they sign up." 
                : "Try adjusting your search terms or filters to find what you're looking for."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
