import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ProductCard = ({ product, showActions = false }) => {
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
    if (product?.images && product.images.length > 0 && !imageError) {
      return `/api/static/uploads/products/${product.images[0]}`;
    }
    return '/placeholder-product.png';
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0);
  };

  const getConditionBadge = (condition) => {
    const badges = {
      'new': { label: 'New', className: 'condition-new' },
      'like-new': { label: 'Like New', className: 'condition-like-new' },
      'good': { label: 'Good', className: 'condition-good' },
      'fair': { label: 'Fair', className: 'condition-fair' },
      'poor': { label: 'Poor', className: 'condition-poor' }
    };
    
    return badges[condition] || { label: condition, className: 'condition-default' };
  };

  const getAvailabilityStatus = () => {
    if (product?.availability_status === 'unavailable') {
      return { label: 'Unavailable', className: 'status-unavailable' };
    }
    if (product?.quantity === 0) {
      return { label: 'Out of Stock', className: 'status-out-of-stock' };
    }
    return { label: 'Available', className: 'status-available' };
  };

  const conditionBadge = getConditionBadge(product?.condition);
  const availabilityStatus = getAvailabilityStatus();

  return (
    <div className="product-card">
      <div className="card-image">
        <img 
          src={getImageUrl()} 
          alt={product?.name || 'Product'} 
          onError={handleImageError}
        />
        <div className="card-badges">
          <span className={`condition-badge ${conditionBadge.className}`}>
            {conditionBadge.label}
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
        <h3 className="product-name">
          {product?.name || 'Product Name'}
        </h3>
        
        <div className="product-details">
          <p className="category">
            {product?.category || 'Category'}
            {product?.subcategory && (
              <span className="subcategory"> • {product.subcategory}</span>
            )}
          </p>
          
          <p className="price">{formatPrice(product?.estimated_value)}</p>
          
          {product?.address && (
            <p className="location">
              📍 {product.address}
            </p>
          )}
          
          {product?.quantity && (
            <p className="quantity">
              Qty: {product.quantity}
            </p>
          )}
        </div>

        {product?.description && (
          <p className="description">
            {product.description.length > 100 
              ? `${product.description.substring(0, 100)}...` 
              : product.description
            }
          </p>
        )}

        <div className="card-actions">
          {user && product?.user_id !== user.id && product?.availability_status === 'available' && (
            <button className="btn btn-primary">
              Propose Trade
            </button>
          )}
          
          <Link 
            to={`/product/${product?.id}`}
            className="btn btn-secondary"
          >
            View Details
          </Link>
        </div>

        {product?.created_at && (
          <div className="card-footer">
            <small className="creation-date">
              Listed {new Date(product.created_at).toLocaleDateString()}
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
