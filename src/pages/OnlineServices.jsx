// Online services search page
import React, { useState } from 'react';
import ServiceCard from '../components/cards/ServiceCard';

const OnlineServices = () => {
  const [filters, setFilters] = useState({
    keyword: '',
    category: '',
    minPrice: '',
    maxPrice: ''
  });

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="online-services-page">
      <h2>Online Services</h2>
      
      <div className="filters">
        <input
          type="text"
          placeholder="Search online services..."
          value={filters.keyword}
          onChange={(e) => handleFilterChange({...filters, keyword: e.target.value})}
        />
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange({...filters, category: e.target.value})}
        >
          <option value="">All Categories</option>
          <option value="consulting">Consulting</option>
          <option value="education">Education</option>
          <option value="design">Design</option>
          <option value="programming">Programming</option>
        </select>
      </div>

      <div className="services-grid">
        <p>Online services will appear here</p>
        {/* ServiceCard components will be mapped here */}
      </div>
    </div>
  );
};

export default OnlineServices;
