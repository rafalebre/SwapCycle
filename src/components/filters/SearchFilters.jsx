import React, { useState, useEffect } from 'react';
import searchService from '../../services/searchService';

const SearchFilters = ({ filters, onFiltersChange, isLoading }) => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Load categories when component mounts or search type changes
  useEffect(() => {
    loadCategories();
  }, [filters.type]);

  // Load subcategories when category changes
  useEffect(() => {
    if (filters.category_id && filters.type !== 'all') {
      loadSubcategories(filters.category_id, filters.type);
    } else {
      setSubcategories([]);
    }
  }, [filters.category_id, filters.type]);

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await searchService.getCategories(filters.type);
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadSubcategories = async (categoryId, type) => {
    setLoadingSubcategories(true);
    try {
      const response = await searchService.getSubcategories(categoryId, type);
      setSubcategories(response.data.subcategories || []);
    } catch (error) {
      console.error('Error loading subcategories:', error);
      setSubcategories([]);
    } finally {
      setLoadingSubcategories(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    
    // Reset subcategory when category changes
    if (key === 'category_id') {
      newFilters.subcategory_id = '';
    }
    
    // Reset category and subcategory when type changes
    if (key === 'type') {
      newFilters.category_id = '';
      newFilters.subcategory_id = '';
    }
    
    onFiltersChange(newFilters);
  };

  const resetFilters = () => {
    onFiltersChange({
      keyword: '',
      type: 'all',
      category_id: '',
      subcategory_id: '',
      min_price: '',
      max_price: '',
      radius: 50,
      page: 1
    });
  };

  const searchTypes = [
    { value: 'all', label: 'All Items' },
    { value: 'products', label: 'Products' },
    { value: 'services', label: 'Services' }
  ];

  return (
    <div className="search-filters">
      <div className="filters-container">
        {/* Keyword Search */}
        <div className="filter-group">
          <label htmlFor="keyword">Search</label>
          <input
            id="keyword"
            type="text"
            placeholder="Search for items..."
            value={filters.keyword || ''}
            onChange={(e) => handleFilterChange('keyword', e.target.value)}
            className="filter-input"
          />
        </div>

        {/* Search Type */}
        <div className="filter-group">
          <label>Type</label>
          <div className="search-type-buttons">
            {searchTypes.map((type, index) => (
              <button
                key={`search-type-${type.value}-${index}`}
                type="button"
                className={`type-button ${filters.type === type.value ? 'active' : ''}`}
                onClick={() => handleFilterChange('type', type.value)}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div className="filter-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={filters.category_id || ''}
            onChange={(e) => handleFilterChange('category_id', e.target.value)}
            className="filter-select"
            disabled={loadingCategories}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option 
                key={`${category.type}-${category.id}`} 
                value={category.id}
              >
                {category.name} ({category.count})
              </option>
            ))}
          </select>
          {loadingCategories && <span className="loading-text">Loading categories...</span>}
        </div>

        {/* Subcategory - Only show when category is selected */}
        {filters.category_id && filters.type !== 'all' && (
          <div className="filter-group">
            <label htmlFor="subcategory">Subcategory</label>
            <select
              id="subcategory"
              value={filters.subcategory_id || ''}
              onChange={(e) => handleFilterChange('subcategory_id', e.target.value)}
              className="filter-select"
              disabled={loadingSubcategories}
            >
              <option value="">All Subcategories</option>
              {subcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))}
            </select>
            {loadingSubcategories && <span className="loading-text">Loading subcategories...</span>}
          </div>
        )}

        {/* Advanced Filters Toggle */}
        <button
          type="button"
          className="advanced-toggle"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
        </button>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="advanced-filters">
            <div className="filter-row">
              <div className="filter-group">
                <label htmlFor="min_price">Min Price</label>
                <input
                  id="min_price"
                  type="number"
                  placeholder="0"
                  value={filters.min_price || ''}
                  onChange={(e) => handleFilterChange('min_price', e.target.value)}
                  className="filter-input small"
                />
              </div>
              
              <div className="filter-group">
                <label htmlFor="max_price">Max Price</label>
                <input
                  id="max_price"
                  type="number"
                  placeholder="1000"
                  value={filters.max_price || ''}
                  onChange={(e) => handleFilterChange('max_price', e.target.value)}
                  className="filter-input small"
                />
              </div>
            </div>

            <div className="filter-group">
              <label htmlFor="radius">Search Radius: {filters.radius || 50} km</label>
              <input
                id="radius"
                type="range"
                min="1"
                max="100"
                value={filters.radius || 50}
                onChange={(e) => handleFilterChange('radius', parseInt(e.target.value))}
                className="filter-range"
              />
            </div>
          </div>
        )}

        {/* Reset Button */}
        <button
          type="button"
          className="reset-button"
          onClick={resetFilters}
        >
          Reset All Filters
        </button>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="search-loading">
          <span>Searching...</span>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
