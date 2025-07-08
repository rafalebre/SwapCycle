import React, { useState, useEffect } from 'react';
import ProductCard from '../components/cards/ProductCard';
import ServiceCard from '../components/cards/ServiceCard';

const Favorites = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [favorites, setFavorites] = useState({
    products: [],
    services: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Implement favorites service calls when favorites backend is ready
      // For now, using mock data
      const mockFavorites = {
        products: [
          // Mock favorite products
        ],
        services: [
          // Mock favorite services
        ]
      };
      
      setFavorites(mockFavorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
      setError('Failed to load favorites. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (itemId, itemType) => {
    try {
      // TODO: Implement remove favorite functionality
      console.log(`Remove favorite: ${itemType} ${itemId}`);
      
      // For now, just remove from local state
      setFavorites(prev => ({
        ...prev,
        [itemType]: prev[itemType].filter(item => item.id !== itemId)
      }));
      
      alert('Removed from favorites');
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Error removing from favorites. Please try again.');
    }
  };

  const getTabCounts = () => {
    return {
      all: favorites.products.length + favorites.services.length,
      products: favorites.products.length,
      services: favorites.services.length
    };
  };

  const getCurrentItems = () => {
    switch (activeTab) {
      case 'products':
        return favorites.products;
      case 'services':
        return favorites.services;
      case 'all':
      default:
        return [...favorites.products, ...favorites.services];
    }
  };

  const tabs = [
    { id: 'all', label: 'All Favorites', icon: '❤️' },
    { id: 'products', label: 'Products', icon: '📦' },
    { id: 'services', label: 'Services', icon: '🛠️' }
  ];

  const counts = getTabCounts();
  const currentItems = getCurrentItems();

  if (loading) {
    return (
      <div className="favorites-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <div className="page-header">
        <h1>My Favorites</h1>
        <p>Items you've saved for later</p>
        <div className="header-stats">
          <span className="stat">
            <strong>{counts.all}</strong> Total Favorites
          </span>
          <span className="stat">
            <strong>{counts.products}</strong> Products
          </span>
          <span className="stat">
            <strong>{counts.services}</strong> Services
          </span>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadFavorites} className="btn btn-secondary">
            Try Again
          </button>
        </div>
      )}

      <div className="favorites-container">
        {/* Tab Navigation */}
        <div className="favorites-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`favorite-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
              <span className="tab-count">({counts[tab.id]})</span>
            </button>
          ))}
        </div>

        {/* Favorites Content */}
        <div className="favorites-content">
          {currentItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">❤️</div>
              <h3>No favorites yet</h3>
              <p>
                {activeTab === 'all' && 'You haven\'t favorited any items yet. Start browsing to find items you like!'}
                {activeTab === 'products' && 'You haven\'t favorited any products yet.'}
                {activeTab === 'services' && 'You haven\'t favorited any services yet.'}
              </p>
              <div className="empty-actions">
                <button 
                  onClick={() => window.location.href = '/search'}
                  className="btn btn-primary"
                >
                  Browse Products & Services
                </button>
                <button 
                  onClick={() => window.location.href = '/online-services'}
                  className="btn btn-secondary"
                >
                  Browse Online Services
                </button>
              </div>
            </div>
          ) : (
            <div className="favorites-grid">
              {currentItems.map(item => {
                // Determine if item is product or service based on properties
                const isProduct = item.hasOwnProperty('condition') || item.hasOwnProperty('quantity');
                
                return (
                  <div key={`${isProduct ? 'product' : 'service'}-${item.id}`} className="favorite-item">
                    {isProduct ? (
                      <ProductCard product={item} />
                    ) : (
                      <ServiceCard service={item} />
                    )}
                    <div className="favorite-actions">
                      <button 
                        onClick={() => handleRemoveFavorite(item.id, isProduct ? 'products' : 'services')}
                        className="btn btn-danger btn-sm remove-favorite"
                        title="Remove from favorites"
                      >
                        �� Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Favorites Tips */}
      <div className="favorites-tips">
        <div className="tips-card">
          <h3>💡 Pro Tips</h3>
          <ul className="tips-list">
            <li>
              <strong>Save for later:</strong> Click the heart icon on any item to add it to your favorites
            </li>
            <li>
              <strong>Get notified:</strong> We'll let you know if the price changes or if similar items become available
            </li>
            <li>
              <strong>Quick access:</strong> Use favorites to quickly find items you want to trade for
            </li>
            <li>
              <strong>Compare options:</strong> Save multiple similar items to compare before making a trade proposal
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Favorites;
