// Product display card
import React from 'react';

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <div className="card-image">
        <img src={product?.image || '/placeholder-image.png'} alt={product?.name} />
      </div>
      <div className="card-content">
        <h3>{product?.name || 'Product Name'}</h3>
        <p className="category">{product?.category || 'Category'}</p>
        <p className="price">${product?.price || '0.00'}</p>
        <p className="location">{product?.location || 'Location'}</p>
        <button className="btn">Propose Trade</button>
      </div>
    </div>
  );
};

export default ProductCard;
