// Service display card
import React from 'react';

const ServiceCard = ({ service }) => {
  return (
    <div className="service-card">
      <div className="card-image">
        <img src={service?.image || '/placeholder-image.png'} alt={service?.name} />
      </div>
      <div className="card-content">
        <h3>{service?.name || 'Service Name'}</h3>
        <p className="category">{service?.category || 'Category'}</p>
        <p className="price">${service?.price || '0.00'}</p>
        <p className="type">{service?.isOnline ? 'Online Service' : 'Physical Service'}</p>
        <button className="btn">Propose Trade</button>
      </div>
    </div>
  );
};

export default ServiceCard;
