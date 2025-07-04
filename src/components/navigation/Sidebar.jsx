import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = ({ activeSection, onSectionChange, user }) => {
  const { logout } = useAuth();

  const sections = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'register-product', label: 'Register Product', icon: '📦' },
    { id: 'register-service', label: 'Register Service', icon: '🔧' },
    { id: 'search', label: 'Search', icon: '🔍' },
    { id: 'online-services', label: 'Online Services', icon: '💻' },
    { id: 'my-listings', label: 'My Listings', icon: '📋' },
    { id: 'trades', label: 'Trades', icon: '🔄' },
    { id: 'favorites', label: 'Favorites', icon: '❤️' }
  ];

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>SwapCycle</h2>
      </div>

      <div className="user-profile">
        <div className="user-avatar">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="user-info">
          <h3>{user?.name} {user?.surname}</h3>
          <p>@{user?.username}</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {sections.map(section => (
          <button
            key={section.id}
            className={`nav-button ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => onSectionChange(section.id)}
          >
            <span className="nav-icon">{section.icon}</span>
            <span className="nav-label">{section.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="btn logout-btn" onClick={handleLogout}>
          <span className="nav-icon">🚪</span>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
