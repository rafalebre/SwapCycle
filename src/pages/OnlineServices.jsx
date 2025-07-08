import React, { useState, useEffect } from 'react';
import ServiceCard from '../components/cards/ServiceCard';
import serviceService from '../services/serviceService';

const OnlineServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
    perPage: 12
  });

  const [filters, setFilters] = useState({
    keyword: '',
    category_id: '',
    min_price: '',
    max_price: '',
    page: 1,
    per_page: 12
  });

  useEffect(() => {
    loadServiceCategories();
  }, []);

  useEffect(() => {
    searchOnlineServices();
  }, [filters]);

  const loadServiceCategories = async () => {
    try {
      const response = await serviceService.getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const searchOnlineServices = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await serviceService.searchOnlineServices(filters);
      
      if (response.success) {
        setServices(response.data);
        setPagination({
          total: response.total,
          page: response.currentPage,
          pages: response.pages,
          perPage: filters.per_page
        });
      } else {
        setError(response.message || 'Error loading online services');
      }
    } catch (error) {
      console.error('Error searching online services:', error);
      setError('Failed to load online services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const resetFilters = () => {
    setFilters({
      keyword: '',
      category_id: '',
      min_price: '',
      max_price: '',
      page: 1,
      per_page: 12
    });
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'name', label: 'Name: A to Z' }
  ];

  return (
    <div className="online-services-page">
      <div className="page-header">
        <h1>Online Services</h1>
        <p>Discover services you can access from anywhere in the world</p>
        <div className="header-stats">
          <span className="stat">
            <strong>{pagination.total}</strong> Services Available
          </span>
          <span className="stat">
            <strong>🌐</strong> Available Worldwide
          </span>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-container">
          {/* Search Input */}
          <div className="filter-group search-group">
            <input
              type="text"
              placeholder="Search online services..."
              value={filters.keyword}
              onChange={(e) => handleFilterChange('keyword', e.target.value)}
              className="search-input"
            />
            <button className="search-button">
              🔍
            </button>
          </div>

          {/* Category Filter */}
          <div className="filter-group">
            <select
              value={filters.category_id}
              onChange={(e) => handleFilterChange('category_id', e.target.value)}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="filter-group price-group">
            <input
              type="number"
              placeholder="Min price"
              value={filters.min_price}
              onChange={(e) => handleFilterChange('min_price', e.target.value)}
              className="price-input"
            />
            <span className="price-separator">to</span>
            <input
              type="number"
              placeholder="Max price"
              value={filters.max_price}
              onChange={(e) => handleFilterChange('max_price', e.target.value)}
              className="price-input"
            />
          </div>

          {/* Sort Options */}
          <div className="filter-group">
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="filter-select"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Button */}
          <button 
            onClick={resetFilters}
            className="btn btn-secondary reset-btn"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="results-section">
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={searchOnlineServices} className="btn btn-secondary">
              Try Again
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Searching online services...</p>
          </div>
        ) : (
          <>
            {/* Results Header */}
            <div className="results-header">
              <div className="results-info">
                <h3>
                  {pagination.total === 0 
                    ? 'No services found' 
                    : `${pagination.total} service${pagination.total !== 1 ? 's' : ''} found`
                  }
                </h3>
                {filters.keyword && (
                  <p>Search results for: "{filters.keyword}"</p>
                )}
              </div>
            </div>

            {/* Services Grid */}
            {services.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💻</div>
                <h3>No online services found</h3>
                <p>
                  {filters.keyword || filters.category_id || filters.min_price || filters.max_price
                    ? 'Try adjusting your search filters to find more services.'
                    : 'Be the first to offer an online service in this category!'
                  }
                </p>
                <div className="empty-actions">
                  <button 
                    onClick={resetFilters}
                    className="btn btn-secondary"
                  >
                    Clear Filters
                  </button>
                  <button 
                    onClick={() => window.location.href = '/dashboard/register-service'}
                    className="btn btn-primary"
                  >
                    Add Your Service
                  </button>
                </div>
              </div>
            ) : (
              <div className="services-grid">
                {services.map(service => (
                  <ServiceCard 
                    key={service.id} 
                    service={service}
                    showActions={true}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="pagination-btn"
                >
                  ← Previous
                </button>
                
                <div className="pagination-info">
                  Page {pagination.page} of {pagination.pages}
                </div>
                
                <button 
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="pagination-btn"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Benefits Section */}
      <div className="benefits-section">
        <div className="benefits-card">
          <h3>🌟 Why Choose Online Services?</h3>
          <div className="benefits-grid">
            <div className="benefit-item">
              <span className="benefit-icon">🌍</span>
              <div className="benefit-content">
                <h4>Global Access</h4>
                <p>Work with service providers from anywhere in the world</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">💰</span>
              <div className="benefit-content">
                <h4>Cost Effective</h4>
                <p>Often more affordable than local alternatives</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">⚡</span>
              <div className="benefit-content">
                <h4>Quick Delivery</h4>
                <p>Many services can be completed quickly online</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🛡️</span>
              <div className="benefit-content">
                <h4>Secure Trading</h4>
                <p>Safe and secure exchange platform</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlineServices;
