// Dashboard sidebar navigation
import React from 'react';

const Sidebar = ({ activeSection, onSectionChange }) => {
  const sections = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'register-product', label: 'Register Product' },
    { id: 'register-service', label: 'Register Service' },
    { id: 'search', label: 'Search' },
    { id: 'online-services', label: 'Online Services' },
    { id: 'my-listings', label: 'My Listings' },
    { id: 'trades', label: 'Trades' },
    { id: 'favorites', label: 'Favorites' }
  ];

  return (
    <aside className="sidebar">
      <div className="user-profile">
        <h3>Welcome User</h3>
      </div>
      <nav className="sidebar-nav">
        {sections.map(section => (
          <button
            key={section.id}
            className={`nav-button ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => onSectionChange(section.id)}
          >
            {section.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="btn logout-btn">Logout</button>
      </div>
    </aside>
  );
};

export default Sidebar;
