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

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  // Determine active section from URL
  const getActiveSectionFromPath = () => {
    const path = location.pathname;
    if (path.includes('my-listings')) return 'my-listings';
    if (path.includes('search')) return 'search';
    if (path.includes('online-services')) return 'online-services';
    if (path.includes('trades')) return 'trades';
    if (path.includes('favorites')) return 'favorites';
    if (path.includes('register-service')) return 'register-service';
    if (path.includes('register-product')) return 'register-product';
    return 'dashboard';
  };

  const [activeSection, setActiveSection] = useState(getActiveSectionFromPath());

  React.useEffect(() => {
    setActiveSection(getActiveSectionFromPath());
  }, [location.pathname]);

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    
    // Update URL based on section
    switch (sectionId) {
      case 'register-product':
        navigate('/dashboard/register-product');
        break;
      case 'register-service':
        navigate('/register-service');
        break;
      case 'search':
        navigate('/dashboard/search');
        break;
      case 'online-services':
        navigate('/dashboard/online-services');
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
        return (
          <div className="coming-soon">
            <h2>Register Product</h2>
            <p>Product registration coming in Action 6!</p>
          </div>
        );
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
                    onClick={() => handleSectionChange('register-service')}
                  >
                    Register New Service
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleSectionChange('search')}
                  >
                    Search Items
                  </button>
                </div>
              </div>
              <div className="stat-card">
                <h3>Your Activity</h3>
                <p>Services: Loading...</p>
                <p>Products: Coming soon...</p>
                <p>Active Trades: Coming soon...</p>
              </div>
            </div>
          </div>
        );
    }
  };

  if (!isAuthenticated) {
    navigate('/login');
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
