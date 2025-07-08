import React, { useState, useEffect } from 'react';
import TradeCard from '../components/cards/TradeCard';

const Trades = () => {
  const [activeTab, setActiveTab] = useState('received');
  const [trades, setTrades] = useState({
    received: [],
    sent: [],
    completed: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTrades();
  }, []);

  const loadTrades = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Implement trade service calls when trade backend is ready
      // For now, using mock data
      const mockTrades = {
        received: [
          // Mock received trades
        ],
        sent: [
          // Mock sent trades
        ],
        completed: [
          // Mock completed trades
        ]
      };
      
      setTrades(mockTrades);
    } catch (error) {
      console.error('Error loading trades:', error);
      setError('Failed to load trades. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTabCounts = () => {
    return {
      received: trades.received.length,
      sent: trades.sent.length,
      completed: trades.completed.length
    };
  };

  const getCurrentTrades = () => {
    return trades[activeTab] || [];
  };

  const tabs = [
    {
      id: 'received',
      label: 'Received',
      icon: '📥',
      description: 'Trade proposals you received from other users'
    },
    {
      id: 'sent',
      label: 'Sent',
      icon: '📤',
      description: 'Trade proposals you sent to other users'
    },
    {
      id: 'completed',
      label: 'Completed',
      icon: '✅',
      description: 'Successfully completed trades'
    }
  ];

  const counts = getTabCounts();
  const currentTrades = getCurrentTrades();

  if (loading) {
    return (
      <div className="trades-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your trades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="trades-page">
      <div className="page-header">
        <h1>My Trades</h1>
        <p>Manage your trade proposals and track completed exchanges</p>
        <div className="header-stats">
          <span className="stat">
            <strong>{counts.received}</strong> Received
          </span>
          <span className="stat">
            <strong>{counts.sent}</strong> Sent
          </span>
          <span className="stat">
            <strong>{counts.completed}</strong> Completed
          </span>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadTrades} className="btn btn-secondary">
            Try Again
          </button>
        </div>
      )}

      <div className="trades-container">
        {/* Tab Navigation */}
        <div className="trades-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`trade-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
              <span className="tab-count">({counts[tab.id]})</span>
            </button>
          ))}
        </div>

        {/* Tab Description */}
        <div className="tab-description">
          <p>{tabs.find(tab => tab.id === activeTab)?.description}</p>
        </div>

        {/* Trades Content */}
        <div className="trades-content">
          {currentTrades.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                {activeTab === 'received' && '📥'}
                {activeTab === 'sent' && '📤'}
                {activeTab === 'completed' && '✅'}
              </div>
              <h3>No {activeTab} trades</h3>
              <p>
                {activeTab === 'received' && 'You haven\'t received any trade proposals yet.'}
                {activeTab === 'sent' && 'You haven\'t sent any trade proposals yet.'}
                {activeTab === 'completed' && 'You haven\'t completed any trades yet.'}
              </p>
              <div className="empty-actions">
                <button 
                  onClick={() => window.location.href = '/search'}
                  className="btn btn-primary"
                >
                  Start Trading
                </button>
                <button 
                  onClick={() => window.location.href = '/dashboard/my-listings'}
                  className="btn btn-secondary"
                >
                  Add Your Items
                </button>
              </div>
            </div>
          ) : (
            <div className="trades-grid">
              {currentTrades.map(trade => (
                <TradeCard 
                  key={trade.id} 
                  trade={trade}
                  userType={activeTab === 'received' ? 'receiver' : 'proposer'}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Help Section */}
      <div className="trades-help">
        <div className="help-card">
          <h3>How Trading Works</h3>
          <div className="help-steps">
            <div className="help-step">
              <span className="step-number">1</span>
              <div className="step-content">
                <h4>Browse & Find</h4>
                <p>Search for products or services you want</p>
              </div>
            </div>
            <div className="help-step">
              <span className="step-number">2</span>
              <div className="step-content">
                <h4>Propose Trade</h4>
                <p>Offer one of your items in exchange</p>
              </div>
            </div>
            <div className="help-step">
              <span className="step-number">3</span>
              <div className="step-content">
                <h4>Negotiate</h4>
                <p>Chat and agree on trade details</p>
              </div>
            </div>
            <div className="help-step">
              <span className="step-number">4</span>
              <div className="step-content">
                <h4>Complete</h4>
                <p>Meet up or arrange delivery to exchange items</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trades;
