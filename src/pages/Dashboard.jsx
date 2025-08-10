import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Sidebar from '../components/navigation/Sidebar';
import MyListings from './MyListings';
import Search from './Search';
import OnlineServices from './OnlineServices';
import Trades from './Trades';
import Favorites from './Favorites';
import RegisterService from './RegisterService';
import RegisterProduct from './RegisterProduct';
import Profile from './Profile';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, loading } = useAuth();
  
  const [activeSection, setActiveSection] = useState('dashboard');

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  // FIXED: handleSectionChange now ONLY uses setActiveSection, NO navigation
  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    // NO navigate() calls - content changes within dashboard
  };

  const renderMainContent = () => {
    switch (activeSection) {
      case 'my-listings':
        return <MyListings />;
      case 'search':
        return <Search />;
      case 'online-services':
        return <OnlineServices />;
      case 'trades':
        return <Trades />;
      case 'favorites':
        return <Favorites />;
      case 'register-service':
        return <RegisterService />;
      case 'register-product':
        return <RegisterProduct />;
      case 'profile':
        return <Profile />;
      default:
        return (
          <div className="dashboard-home">
            <h2>Welcome to SwapCycle, {user?.name}!</h2>
            <div className="dashboard-stats">
              <div className="stat-card">
                <h3>Your Activity</h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-number">0</span>
                    <span className="stat-label">Products Listed</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">0</span>
                    <span className="stat-label">Services Listed</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">0</span>
                    <span className="stat-label">Active Trades</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">0</span>
                    <span className="stat-label">Favorites</span>
                  </div>
                </div>
              </div>
              <div className="stat-card">
                <h3>Recent Activity</h3>
                <div className="recent-activity">
                  <p className="no-activity">No recent activity</p>
                  <small>Start by adding your first product or service!</small>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="dashboard">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={handleSectionChange}
        user={user}
      />
      <main className="dashboard-content">
        {renderMainContent()}
      </main>
    </div>
  );
};

export default Dashboard;
