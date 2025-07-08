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
  
  const getActiveSectionFromPath = () => {
    const path = location.pathname;
    if (path.includes('my-listings')) return 'my-listings';
    if (path.includes('search')) return 'search';
    if (path.includes('online-services')) return 'online-services';
    if (path.includes('trades')) return 'trades';
    if (path.includes('favorites')) return 'favorites';
    if (path.includes('register-service')) return 'register-service';
    if (path.includes('register-product')) return 'register-product';
    if (path.includes('profile')) return 'profile';
    return 'dashboard';
  };

  const [activeSection, setActiveSection] = useState(getActiveSectionFromPath());

  React.useEffect(() => {
    setActiveSection(getActiveSectionFromPath());
  }, [location.pathname]);

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    
    switch (sectionId) {
      case 'register-product':
        navigate('/dashboard/register-product');
        break;
      case 'register-service':
        navigate('/dashboard/register-service');
        break;
      case 'search':
        navigate('/search');
        break;
      case 'online-services':
        navigate('/online-services');
        break;
      case 'my-listings':
        navigate('/dashboard/my-listings');
        break;
      case 'trades':
        navigate('/dashboard/trades');
        break;
      case 'favorites':
        navigate('/dashboard/favorites');
        break;
      case 'profile':
        navigate('/dashboard/profile');
        break;
      default:
        navigate('/dashboard');
    }
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
                <h3>Quick Actions</h3>
                <div className="action-buttons">
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleSectionChange('register-product')}
                  >
                    📦 Register New Product
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleSectionChange('register-service')}
                  >
                    🛠️ Register New Service
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleSectionChange('search')}
                  >
                    🔍 Search Items
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleSectionChange('my-listings')}
                  >
                    📋 View My Listings
                  </button>
                </div>
              </div>
              <div className="stat-card">
                <h3>Your Activity</h3>
                <div className="activity-stats">
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
