import React, { useState, useEffect } from 'react';
import { searchService } from '../../services/searchService';

const SearchFilters = ({ 
  filters, 
  onFiltersChange, 
  searchType = 'all',
  isLoading = false 
}) => {
  const [categories, setCategories] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    loadCategories();
  }, [searchType]);

  const loadCategories = async () => {
    try {
      const response = await searchService.getCategories(searchType);
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      // Set empty categories on error to prevent UI issues
      setCategories([]);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    
    // Reset page when filters change
    if (key !== 'page') {
      newFilters.page = 1;
    }
    
    onFiltersChange(newFilters);
  };

  const resetFilters = () => {
    onFiltersChange({
      keyword: '',
      type: searchType,
      category_id: '',
      min_price: '',
      max_price: '',
      radius: 10,
      page: 1
    });
    setShowAdvanced(false);
  };

  const hasActiveFilters = () => {
    return filters.keyword || 
           filters.category_id || 
           filters.min_price || 
           filters.max_price || 
           filters.radius !== 10;
  };

  return (
    <div className="search-filters" style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
      {/* Main Search Bar */}
      <div className="search-bar" style={{ marginBottom: '15px' }}>
        <div className="search-input-group" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search products and services..."
            value={filters.keyword || ''}
            onChange={(e) => handleFilterChange('keyword', e.target.value)}
            style={{
              width: '100%',
              padding: '12px 40px 12px 15px',
              border: '2px solid #ddd',
              borderRadius: '25px',
              fontSize: '16px',
              outline: 'none'
            }}
            disabled={isLoading}
          />
          {filters.keyword && (
            <button 
              type="button"
              onClick={() => handleFilterChange('keyword', '')}
              style={{
                position: 'absolute',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Search Type Toggle */}
      <div className="search-type-toggle" style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        {['all', 'products', 'services'].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => handleFilterChange('type', type)}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              border: '2px solid #007BFF',
              borderRadius: '20px',
              background: filters.type === type ? '#007BFF' : 'white',
              color: filters.type === type ? 'white' : '#007BFF',
              cursor: 'pointer',
              textTransform: 'capitalize',
              fontSize: '14px'
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Quick Filters Row */}
      <div className="quick-filters" style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Category Filter */}
        <select
          value={filters.category_id || ''}
          onChange={(e) => handleFilterChange('category_id', e.target.value)}
          disabled={isLoading}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '14px'
          }}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name} ({category.count || 0})
            </option>
          ))}
        </select>

        {/* Advanced Filters Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            padding: '8px 16px',
            border: '1px solid #666',
            borderRadius: '5px',
            background: showAdvanced ? '#666' : 'white',
            color: showAdvanced ? 'white' : '#666',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {showAdvanced ? 'Hide' : 'More'} Filters
        </button>

        {/* Reset Filters */}
        {hasActiveFilters() && (
          <button
            type="button"
            onClick={resetFilters}
            style={{
              padding: '8px 16px',
              border: '1px solid #dc3545',
              borderRadius: '5px',
              background: 'white',
              color: '#dc3545',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="advanced-filters" style={{ marginTop: '15px', padding: '15px', backgroundColor: 'white', borderRadius: '5px', border: '1px solid #ddd' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            {/* Price Range */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Price Range</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.min_price || ''}
                  onChange={(e) => handleFilterChange('min_price', e.target.value)}
                  style={{ width: '80px', padding: '5px', border: '1px solid #ddd', borderRadius: '3px' }}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.max_price || ''}
                  onChange={(e) => handleFilterChange('max_price', e.target.value)}
                  style={{ width: '80px', padding: '5px', border: '1px solid #ddd', borderRadius: '3px' }}
                />
              </div>
            </div>

            {/* Search Radius */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
                Search Radius: {filters.radius || 10} km
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={filters.radius || 10}
                onChange={(e) => handleFilterChange('radius', parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
                <span>1km</span>
                <span>50km</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
