import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ServiceCard = ({ service, showActions = false }) => {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleFavoriteToggle = async () => {
    // TODO: Implement favorite functionality
    setIsFavorited(!isFavorited);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const getImageUrl = () => {
    if (service?.images && service.images.length > 0 && !imageError) {
      return `/api/static/uploads/services/${service.images[0]}`;
    }
    return '/placeholder-service.png';
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0);
  };

  const getServiceTypeBadge = () => {
    if (service?.is_online) {
      return { label: 'Online Service', className: 'service-online', icon: '💻' };
    }
    return { label: 'Physical Service', className: 'service-physical', icon: '📍' };
  };

  const getAvailabilityStatus = () => {
    if (service?.availability_status === 'unavailable') {
      return { label: 'Unavailable', className: 'status-unavailable' };
    }
    return { label: 'Available', className: 'status-available' };
  };

  const serviceTypeBadge = getServiceTypeBadge();
  const availabilityStatus = getAvailabilityStatus();

  return (
    <div className="service-card">
      <div className="card-image">
        <img 
          src={getImageUrl()} 
          alt={service?.name || 'Service'} 
          onError={handleImageError}
        />
        <div className="card-badges">
          <span className={`service-type-badge ${serviceTypeBadge.className}`}>
            {serviceTypeBadge.icon} {serviceTypeBadge.label}
          </span>
          <span className={`availability-badge ${availabilityStatus.className}`}>
            {availabilityStatus.label}
          </span>
        </div>
        {user && (
          <button 
            className={`favorite-btn ${isFavorited ? 'favorited' : ''}`}
            onClick={handleFavoriteToggle}
            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <span className="heart-icon">
              {isFavorited ? '❤️' : '🤍'}
            </span>
          </button>
        )}
      </div>
      
      <div className="card-content">
        <h3 className="service-name">
          {service?.name || 'Service Name'}
        </h3>
        
        <div className="service-details">
          <p className="category">
            {service?.category || 'Category'}
            {service?.subcategory && (
              <span className="subcategory"> • {service.subcategory}</span>
            )}
          </p>
          
          <p className="price">{formatPrice(service?.estimated_value)}</p>
          
          {!service?.is_online && service?.address && (
            <p className="location">
              �� {service.address}
            </p>
          )}
          
          {service?.is_online && (
            <p className="online-indicator">
              🌐 Available worldwide
            </p>
          )}
        </div>

        {service?.description && (
          <p className="description">
            {service.description.length > 100 
              ? `${service.description.substring(0, 100)}...` 
              : service.description
            }
          </p>
        )}

        <div className="card-actions">
          {user && service?.user_id !== user.id && service?.availability_status === 'available' && (
            <button className="btn btn-primary">
              Propose Trade
            </button>
          )}
          
          <Link 
            to={`/service/${service?.id}`}
            className="btn btn-secondary"
          >
            View Details
          </Link>
        </div>

        {service?.created_at && (
          <div className="card-footer">
            <small className="creation-date">
              Listed {new Date(service.created_at).toLocaleDateString()}
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceCard;
