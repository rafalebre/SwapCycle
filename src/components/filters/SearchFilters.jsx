// Combined search filters
import React from 'react';

const SearchFilters = ({ filters, onFilterChange }) => {
  const handleChange = (filterName, value) => {
    onFilterChange({
      ...filters,
      [filterName]: value
    });
  };

  return (
    <div className="search-filters">
      <input
        type="text"
        placeholder="Search keywords..."
        value={filters.keyword || ''}
        onChange={(e) => handleChange('keyword', e.target.value)}
      />
      
      <select
        value={filters.type || ''}
        onChange={(e) => handleChange('type', e.target.value)}
      >
        <option value="">All Types</option>
        <option value="products">Products</option>
        <option value="services">Services</option>
      </select>

      <select
        value={filters.category || ''}
        onChange={(e) => handleChange('category', e.target.value)}
      >
        <option value="">All Categories</option>
        <option value="electronics">Electronics</option>
        <option value="home">Home & Garden</option>
        <option value="consulting">Consulting</option>
        <option value="education">Education</option>
      </select>

      <div className="price-range">
        <label>Price Range:</label>
        <input
          type="number"
          placeholder="Min"
          value={filters.minPrice || ''}
          onChange={(e) => handleChange('minPrice', e.target.value)}
        />
        <input
          type="number"
          placeholder="Max"
          value={filters.maxPrice || ''}
          onChange={(e) => handleChange('maxPrice', e.target.value)}
        />
      </div>
    </div>
  );
};

export default SearchFilters;
