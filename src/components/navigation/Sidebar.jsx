import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const menuItems = [
    {
      path: '/dashboard',
      icon: '🏠',
      label: 'Dashboard',
      exact: true
    },
    {
      path: '/search',
      icon: '🔍',
      label: 'Search Items'
    },
    {
      path: '/online-services',
      icon: '💻',
      label: 'Online Services'
    },
    {
      path: '/dashboard/my-listings',
      icon: '📋',
      label: 'My Listings'
    },
    {
      path: '/dashboard/trades',
      icon: '🔄',
      label: 'My Trades'
    },
    {
      path: '/dashboard/favorites',
      icon: '❤️',
      label: 'Favorites'
    }
  ];

  const quickActions = [
    {
      path: '/dashboard/register-product',
      icon: '📦',
      label: 'Add Product',
      className: 'quick-action-product'
    },
    {
      path: '/dashboard/register-service',
      icon: '🛠️',
      label: 'Add Service',
      className: 'quick-action-service'
    }
  ];

  return (
    <div className="sidebar">
      {/* User Profile Section */}
      <div className="sidebar-header">
        <div className="user-profile">
          <div className="user-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-info">
            <h3 className="user-name">{user?.name || 'User'}</h3>
            <p className="user-email">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link 
                to={item.path}
                className={`nav-link ${
                  item.exact 
                    ? location.pathname === item.path ? 'active' : ''
                    : isActive(item.path) ? 'active' : ''
                }`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Quick Actions */}
      <div className="sidebar-section">
        <h4 className="section-title">Quick Actions</h4>
        <div className="quick-actions">
          {quickActions.map((action) => (
            <Link 
              key={action.path}
              to={action.path}
              className={`quick-action-btn ${action.className}`}
            >
              <span className="action-icon">{action.icon}</span>
              <span className="action-label">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* User Settings */}
      <div className="sidebar-section">
        <h4 className="section-title">Account</h4>
        <ul className="nav-list">
          <li className="nav-item">
            <Link 
              to="/dashboard/profile"
              className={`nav-link ${isActive('/dashboard/profile') ? 'active' : ''}`}
            >
              <span className="nav-icon">👤</span>
              <span className="nav-label">Profile</span>
            </Link>
          </li>
          <li className="nav-item">
            <button 
              onClick={handleLogout}
              className="nav-link logout-btn"
            >
              <span className="nav-icon">🚪</span>
              <span className="nav-label">Logout</span>
            </button>
          </li>
        </ul>
      </div>

      {/* Stats Summary */}
      <div className="sidebar-footer">
        <div className="user-stats">
          <div className="stat-item">
            <span className="stat-value">-</span>
            <span className="stat-label">Products</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">-</span>
            <span className="stat-label">Services</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">-</span>
            <span className="stat-label">Trades</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
