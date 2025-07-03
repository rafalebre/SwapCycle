// User favorites page
import React from 'react';

const Favorites = () => {
  return (
    <div className="favorites-page">
      <h2>My Favorites</h2>
      <div className="filter-tabs">
        <button className="tab active">All</button>
        <button className="tab">Products</button>
        <button className="tab">Services</button>
      </div>
      <div className="favorites-grid">
        <p>Your favorite items will appear here</p>
      </div>
    </div>
  );
};

export default Favorites;
