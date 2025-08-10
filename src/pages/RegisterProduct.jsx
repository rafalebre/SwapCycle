import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AddressAutocomplete from '../components/maps/AddressAutocomplete';
import apiService from '../services/api';

const RegisterProduct = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    subcategory_id: '',
    condition: '',
    estimated_value: '',
    currency: 'USD',
    quantity: 1,
    address: '',
    latitude: null,
    longitude: null,
    use_profile_address: false
  });

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const conditionOptions = [
    { value: 'new_in_package', label: 'New in Package' },
    { value: 'like_new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' }
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (formData.use_profile_address && user) {
      setFormData(prev => ({
        ...prev,
        address: user.address,
        latitude: user.latitude,
        longitude: user.longitude
      }));
    } else if (!formData.use_profile_address) {
      setFormData(prev => ({
        ...prev,
        address: '',
        latitude: null,
        longitude: null
      }));
    }
  }, [formData.use_profile_address, user]);

  useEffect(() => {
    if (formData.category_id) {
      loadSubcategories(formData.category_id);
    } else {
      setSubcategories([]);
      setFormData(prev => ({ ...prev, subcategory_id: '' }));
    }
  }, [formData.category_id]);

  const loadInitialData = async () => {
    try {
      const [categoriesRes, currenciesRes] = await Promise.all([
        apiService.get('/products/categories'),
        apiService.get('/utils/currencies')
      ]);

      setCategories(categoriesRes.data.categories || []);
      setCurrencies(currenciesRes.data.currencies || []);
    } catch (error) {
      console.error('Error loading initial data:', error);
      setErrors({ general: 'Failed to load form data. Please refresh the page.' });
    }
  };

  const loadSubcategories = async (categoryId) => {
    try {
      const response = await apiService.get(`/search/subcategories?category_id=${categoryId}&type=product`);
      setSubcategories(response.data.subcategories || []);
    } catch (error) {
      console.error('Error loading subcategories:', error);
      setSubcategories([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear related errors
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleAddressSelect = (addressData) => {
    setFormData(prev => ({
      ...prev,
      address: addressData.address,
      latitude: addressData.latitude,
      longitude: addressData.longitude
    }));

    if (errors.address) {
      setErrors(prev => ({ ...prev, address: null }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + images.length > 3) {
      setErrors(prev => ({ ...prev, images: 'Maximum 3 images allowed' }));
      return;
    }

    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024; // 5MB
      if (!isValid) {
        setErrors(prev => ({ ...prev, images: 'Invalid file. Please upload images under 5MB.' }));
      }
      return isValid;
    });

    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));

    setImages(prev => [...prev, ...newImages]);
    
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: null }));
    }
  };

  const removeImage = (imageId) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== imageId);
      // Cleanup blob URLs
      const removed = prev.find(img => img.id === imageId);
      if (removed?.preview?.startsWith('blob:')) {
        URL.revokeObjectURL(removed.preview);
      }
      return filtered;
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.category_id) newErrors.category_id = 'Category is required';
    if (!formData.condition) newErrors.condition = 'Condition is required';
    if (!formData.estimated_value || formData.estimated_value <= 0) {
      newErrors.estimated_value = 'Valid estimated value is required';
    }
    if (!formData.quantity || formData.quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.latitude || !formData.longitude) {
      newErrors.address = 'Please select a valid address from the suggestions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const submitData = new FormData();
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });

      // Add images
      images.forEach((image, index) => {
        submitData.append(`image_${index}`, image.file);
      });

      const response = await apiService.post('/products', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Success - redirect to listings or show success message
      navigate('/dashboard', { 
        state: { 
          message: 'Product registered successfully!', 
          activeSection: 'my-listings' 
        }
      });

    } catch (error) {
      console.error('Error registering product:', error);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ 
          general: error.response?.data?.message || 'Failed to register product. Please try again.' 
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach(image => {
        if (image.preview?.startsWith('blob:')) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, []);

  return (
    <div className="register-product">
      <div className="form-header">
        <h2>Register Product</h2>
        <p>List a product you'd like to trade</p>
      </div>

      {errors.general && (
        <div className="error-message general-error">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="product-form">
        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label htmlFor="name">Product Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter product name"
              maxLength={100}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category_id">Category *</label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className={errors.category_id ? 'error' : ''}
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category_id && <span className="error-text">{errors.category_id}</span>}
            </div>

            {subcategories.length > 0 && (
              <div className="form-group">
                <label htmlFor="subcategory_id">Subcategory</label>
                <select
                  id="subcategory_id"
                  name="subcategory_id"
                  value={formData.subcategory_id}
                  onChange={handleInputChange}
                >
                  <option value="">Select subcategory</option>
                  {subcategories.map(subcategory => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="condition">Condition *</label>
            <select
              id="condition"
              name="condition"
              value={formData.condition}
              onChange={handleInputChange}
              className={errors.condition ? 'error' : ''}
            >
              <option value="">Select condition</option>
              {conditionOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.condition && <span className="error-text">{errors.condition}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your product..."
              maxLength={500}
              rows={4}
            />
            <div className="char-count">{formData.description.length}/500</div>
          </div>
        </div>

        {/* Value and Quantity */}
        <div className="form-section">
          <h3>Value and Quantity</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="estimated_value">Estimated Value *</label>
              <input
                type="number"
                id="estimated_value"
                name="estimated_value"
                value={formData.estimated_value}
                onChange={handleInputChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={errors.estimated_value ? 'error' : ''}
              />
              {errors.estimated_value && <span className="error-text">{errors.estimated_value}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="currency">Currency</label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
              >
                {currencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="quantity">Quantity Available *</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="1"
                className={errors.quantity ? 'error' : ''}
              />
              {errors.quantity && <span className="error-text">{errors.quantity}</span>}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="form-section">
          <h3>Location</h3>
          
          <div className="form-group">
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="use_profile_address"
                  checked={formData.use_profile_address}
                  onChange={handleInputChange}
                />
                <span className="checkmark"></span>
                Use my registered address
              </label>
            </div>
          </div>

          {!formData.use_profile_address && (
            <div className="form-group">
              <label htmlFor="address">Address *</label>
              <AddressAutocomplete
                value={formData.address}
                onAddressSelect={handleAddressSelect}
                placeholder="Enter address for this product"
                className={errors.address ? 'error' : ''}
              />
              {errors.address && <span className="error-text">{errors.address}</span>}
            </div>
          )}

          {formData.use_profile_address && user?.address && (
            <div className="address-display">
              <p><strong>Using address:</strong> {user.address}</p>
            </div>
          )}
        </div>

        {/* Images */}
        <div className="form-section">
          <h3>Images</h3>
          
          <div className="form-group">
            <label htmlFor="images">Upload Images (Max 3)</label>
            <input
              type="file"
              id="images"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={images.length >= 3}
            />
            {errors.images && <span className="error-text">{errors.images}</span>}
          </div>

          {images.length > 0 && (
            <div className="image-preview-grid">
              {images.map(image => (
                <div key={image.id} className="image-preview">
                  <img src={image.preview} alt="Product preview" />
                  <button
                    type="button"
                    onClick={() => removeImage(image.id)}
                    className="remove-image-btn"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterProduct;
