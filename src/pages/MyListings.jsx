import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/cards/ProductCard';
import ServiceCard from '../components/cards/ServiceCard';
import productService from '../services/productService';
import serviceService from '../services/serviceService';

const MyListings = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUserListings();
  }, []);

  const loadUserListings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [productsResponse, servicesResponse] = await Promise.all([
        productService.getUserProducts(),
        serviceService.getUserServices()
      ]);

      if (productsResponse.success) {
        setProducts(productsResponse.data);
      } else {
        console.error('Error loading products:', productsResponse.message);
      }

      if (servicesResponse.success) {
        setServices(servicesResponse.data);
      } else {
        console.error('Error loading services:', servicesResponse.message);
      }
    } catch (error) {
      console.error('Error loading listings:', error);
      setError('Failed to load your listings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await productService.deleteProduct(productId);
      if (response.success) {
        setProducts(products.filter(p => p.id !== productId));
        alert('Product deleted successfully');
      } else {
        alert('Error deleting product: ' + response.message);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product. Please try again.');
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      const response = await serviceService.deleteService(serviceId);
      if (response.success) {
        setServices(services.filter(s => s.id !== serviceId));
        alert('Service deleted successfully');
      } else {
        alert('Error deleting service: ' + response.message);
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Error deleting service. Please try again.');
    }
  };

  const currentItems = activeTab === 'products' ? products : services;
  const totalItems = products.length + services.length;

  if (loading) {
    return (
      <div className="my-listings">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-listings">
      <div className="page-header">
        <h1>My Listings</h1>
        <p>Manage your products and services</p>
        <div className="header-stats">
          <span className="stat">
            <strong>{products.length}</strong> Products
          </span>
          <span className="stat">
            <strong>{services.length}</strong> Services
          </span>
          <span className="stat">
            <strong>{totalItems}</strong> Total Items
          </span>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadUserListings} className="btn btn-secondary">
            Try Again
          </button>
        </div>
      )}

      <div className="listings-container">
        {/* Tab Navigation */}
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            My Products ({products.length})
          </button>
          <button 
            className={`tab ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            My Services ({services.length})
          </button>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <Link 
            to="/dashboard/register-product" 
            className="btn btn-primary"
          >
            Add New Product
          </Link>
          <Link 
            to="/dashboard/register-service" 
            className="btn btn-primary"
          >
            Add New Service
          </Link>
        </div>

        {/* Items Grid */}
        <div className="listings-grid">
          {currentItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                {activeTab === 'products' ? '📦' : '🛠️'}
              </div>
              <h3>No {activeTab} yet</h3>
              <p>
                {activeTab === 'products' 
                  ? 'Start by adding your first product to trade with others'
                  : 'Start by adding your first service to offer to others'
                }
              </p>
              <Link 
                to={`/dashboard/register-${activeTab === 'products' ? 'product' : 'service'}`}
                className="btn btn-primary"
              >
                Add {activeTab === 'products' ? 'Product' : 'Service'}
              </Link>
            </div>
          ) : (
            currentItems.map(item => (
              activeTab === 'products' ? (
                <div key={item.id} className="listing-item">
                  <ProductCard product={item} />
                  <div className="item-actions">
                    <Link 
                      to={`/dashboard/edit-product/${item.id}`}
                      className="btn btn-secondary btn-sm"
                    >
                      Edit
                    </Link>
                    <button 
                      onClick={() => handleDeleteProduct(item.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div key={item.id} className="listing-item">
                  <ServiceCard service={item} />
                  <div className="item-actions">
                    <Link 
                      to={`/dashboard/edit-service/${item.id}`}
                      className="btn btn-secondary btn-sm"
                    >
                      Edit
                    </Link>
                    <button 
                      onClick={() => handleDeleteService(item.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyListings;
