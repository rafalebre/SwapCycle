import React, { useState } from 'react';
import { Heart, MapPin, ShoppingBag, Star, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ProductCard = ({ product, onHover, onSelect, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(product?.is_favorited || false);
  const { user } = useAuth();

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (onHover) onHover(product?.id);
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
    if (onSelect) onSelect(product);
  };

  const getConditionBadge = (condition) => {
    const badges = {
      'new': { label: 'New', className: 'badge-new' },
      'excellent': { label: 'Excellent', className: 'badge-excellent' },
      'good': { label: 'Good', className: 'badge-good' },
      'fair': { label: 'Fair', className: 'badge-fair' },
      'poor': { label: 'Poor', className: 'badge-poor' }
    };
    return badges[condition] || badges['good'];
  };

  const getAvailabilityBadge = (available) => {
    return available 
      ? { label: 'Available', className: 'badge-available' }
      : { label: 'Unavailable', className: 'badge-unavailable' };
  };

  if (!product) {
    return (
      <div className="product-card product-card-skeleton">
        <div className="card-image-skeleton"></div>
        <div className="card-content">
          <div className="skeleton-line"></div>
          <div className="skeleton-line short"></div>
        </div>
      </div>
    );
  }

  const imageUrl = product.images?.[0]?.url || product.image_url || '/placeholder-product.jpg';
  const conditionBadge = getConditionBadge(product.condition);
  const availabilityBadge = getAvailabilityBadge(product.available);

  return (
    <div 
      className={`product-card ${className} ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleViewClick}
    >
      {/* Image Container */}
      <div className="card-image-container">
        <img 
          src={imageUrl} 
          alt={product.title || product.name}
          className="card-image"
          loading="lazy"
        />
        
        {/* Image Overlay Badges */}
        <div className="image-badges">
          <span className={`badge ${conditionBadge.className}`}>
            {conditionBadge.label}
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
          <h3 className="card-title" title={product.title || product.name}>
            {product.title || product.name}
          </h3>
          {product.rating && (
            <div className="rating">
              <Star className="star-icon filled" />
              <span className="rating-value">{product.rating}</span>
            </div>
          )}
        </div>

        <div className="card-details">
          <div className="price-section">
            <span className="price">
              {product.price} {product.currency || 'USD'}
            </span>
            {product.quantity && (
              <span className="quantity">
                <ShoppingBag className="quantity-icon" />
                {product.quantity} available
              </span>
            )}
          </div>

          {product.location && (
            <div className="location">
              <MapPin className="location-icon" />
              <span className="location-text">{product.location}</span>
            </div>
          )}

          {product.category && (
            <div className="category">
              <span className="category-label">{product.category}</span>
              {product.subcategory && (
                <span className="subcategory-label">{product.subcategory}</span>
              )}
            </div>
          )}
        </div>

        {product.description && (
          <p className="card-description">
            {product.description.length > 100 
              ? `${product.description.substring(0, 100)}...` 
              : product.description
            }
          </p>
        )}

        <div className="card-footer">
          <div className="owner-info">
            <div className="owner-avatar">
              {product.owner?.name?.[0] || 'U'}
            </div>
            <span className="owner-name">
              {product.owner?.name || 'Anonymous User'}
            </span>
          </div>
          
          <div className="card-actions">
            <button 
              className="btn btn-outline-primary btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Navigate to trade proposal
              }}
            >
              Propose Trade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
