// User's products and services page
import React from 'react';

const MyListings = () => {
  return (
    <div className="my-listings">
      <h2>My Products & Services</h2>
      <div className="tabs">
        <button className="tab active">My Products</button>
        <button className="tab">My Services</button>
      </div>
      <div className="listings-grid">
        <p>Your listings will appear here</p>
        <button className="btn">Add New Product</button>
        <button className="btn">Add New Service</button>
      </div>
    </div>
  );
};

export default MyListings;
