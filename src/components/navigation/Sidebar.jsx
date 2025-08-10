import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = ({ activeSection, onSectionChange, user }) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  // Dashboard internal sections (ALL as buttons, not links)
  const dashboardSections = [
    {
      id: 'dashboard',
      icon: '🏠',
      label: 'Dashboard'
    },
    {
      id: 'register-product',
      icon: '📦',
      label: 'Register Product'
    },
    {
      id: 'register-service',
      icon: '🛠️',
      label: 'Register Service'
    },
    {
      id: 'search',
      icon: '🔍',
      label: 'Search Items'
    },
    {
      id: 'online-services',
      icon: '💻',
      label: 'Online Services'
    },
    {
      id: 'my-listings',
      icon: '📋',
      label: 'My Listings'
    },
    {
      id: 'trades',
      icon: '🔄',
      label: 'My Trades'
    },
    {
      id: 'favorites',
      icon: '❤️',
      label: 'Favorites'
    },
    {
      id: 'profile',
      icon: '👤',
      label: 'Profile'
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

      {/* Navigation Menu - Dashboard Internal Sections */}
      <nav className="sidebar-nav">
        <h4 className="section-title">Navigation</h4>
        <ul className="nav-list">
          {dashboardSections.map((section) => (
            <li key={section.id} className="nav-item">
              <button 
                onClick={() => onSectionChange(section.id)}
                className={`nav-link ${activeSection === section.id ? 'active' : ''}`}
              >
                <span className="nav-icon">{section.icon}</span>
                <span className="nav-label">{section.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Section */}
      <div className="sidebar-section">
        <h4 className="section-title">Account</h4>
        <ul className="nav-list">
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
