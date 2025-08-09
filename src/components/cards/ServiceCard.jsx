import React, { useState } from 'react';
import { Heart, MapPin, Monitor, User, Star, Eye, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ServiceCard = ({ service, onHover, onSelect, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(service?.is_favorited || false);
  const { user } = useAuth();

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (onHover) onHover(service?.id);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (onHover) onHover(null);
  };

  const handleFavoriteToggle = (e) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    // TODO: Implement favorite API call
  };

  const handleViewClick = (e) => {
    e.stopPropagation();
    if (onSelect) onSelect(service);
  };

  const getServiceTypeBadge = (isOnline) => {
    return isOnline 
      ? { label: 'Online', className: 'badge-online', icon: Monitor }
      : { label: 'Physical', className: 'badge-physical', icon: MapPin };
  };

  const getAvailabilityBadge = (available) => {
    return available 
      ? { label: 'Available', className: 'badge-available' }
      : { label: 'Busy', className: 'badge-busy' };
  };

  if (!service) {
    return (
      <div className="service-card service-card-skeleton">
        <div className="card-image-skeleton"></div>
        <div className="card-content">
          <div className="skeleton-line"></div>
          <div className="skeleton-line short"></div>
        </div>
      </div>
    );
  }

  const imageUrl = service.images?.[0]?.url || service.image_url || '/placeholder-service.jpg';
  const serviceTypeBadge = getServiceTypeBadge(service.is_online);
  const availabilityBadge = getAvailabilityBadge(service.available);
  const TypeIcon = serviceTypeBadge.icon;

  return (
    <div 
      className={`service-card ${className} ${isHovered ? 'hovered' : ''} ${service.is_online ? 'online-service' : 'physical-service'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleViewClick}
    >
      {/* Image Container */}
      <div className="card-image-container">
        <img 
          src={imageUrl} 
          alt={service.title || service.name}
          className="card-image"
          loading="lazy"
        />
        
        {/* Image Overlay Badges */}
        <div className="image-badges">
          <span className={`badge ${serviceTypeBadge.className}`}>
            <TypeIcon className="badge-icon" />
            {serviceTypeBadge.label}
          </span>
          <span className={`badge ${availabilityBadge.className}`}>
            {availabilityBadge.label}
          </span>
        </div>

        {/* Favorite Heart */}
        {user && (
          <button 
            className={`favorite-btn ${isFavorited ? 'favorited' : ''}`}
            onClick={handleFavoriteToggle}
            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`heart-icon ${isFavorited ? 'filled' : ''}`} />
          </button>
        )}

        {/* Hover Overlay */}
        <div className={`card-overlay ${isHovered ? 'visible' : ''}`}>
          <button className="view-btn" onClick={handleViewClick}>
            <Eye className="icon" />
            View Details
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title" title={service.title || service.name}>
            {service.title || service.name}
          </h3>
          {service.rating && (
            <div className="rating">
              <Star className="star-icon filled" />
              <span className="rating-value">{service.rating}</span>
            </div>
          )}
        </div>

        <div className="card-details">
          <div className="price-section">
            <span className="price">
              {service.price} {service.currency || 'USD'}
            </span>
            <span className="price-unit">
              /{service.price_unit || 'hour'}
            </span>
          </div>

          {!service.is_online && service.location && (
            <div className="location">
              <MapPin className="location-icon" />
              <span className="location-text">{service.location}</span>
            </div>
          )}

          {service.is_online && (
            <div className="online-info">
              <Monitor className="online-icon" />
              <span className="online-text">Remote Service</span>
            </div>
          )}

          {service.duration && (
            <div className="duration">
              <Clock className="duration-icon" />
              <span className="duration-text">{service.duration}</span>
            </div>
          )}

          {service.category && (
            <div className="category">
              <span className="category-label">{service.category}</span>
              {service.subcategory && (
                <span className="subcategory-label">{service.subcategory}</span>
              )}
            </div>
          )}
        </div>

        {service.description && (
          <p className="card-description">
            {service.description.length > 100 
              ? `${service.description.substring(0, 100)}...` 
              : service.description
            }
          </p>
        )}

        <div className="card-footer">
          <div className="provider-info">
            <div className="provider-avatar">
              {service.provider?.name?.[0] || service.owner?.name?.[0] || 'U'}
            </div>
            <div className="provider-details">
              <span className="provider-name">
                {service.provider?.name || service.owner?.name || 'Anonymous Provider'}
              </span>
              {service.provider?.verified && (
                <span className="verified-badge">Verified</span>
              )}
            </div>
          </div>
          
          <div className="card-actions">
            <button 
              className="btn btn-outline-primary btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Navigate to service booking
              }}
            >
              {service.is_online ? 'Book Online' : 'Request Service'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
