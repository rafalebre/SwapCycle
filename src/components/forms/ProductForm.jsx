import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import AddressAutocomplete from '../maps/AddressAutocomplete';

const ProductForm = ({ onSubmit, initialData = {}, isEditing = false }) => {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    subcategory_id: '',
    condition: '',
    estimated_value: '',
    quantity: 1,
    description: '',
    address: '',
    latitude: null,
    longitude: null,
    images: [],
    ...initialData
  });

  // Load product categories on component mount
  useEffect(() => {
    loadProductCategories();
  }, []);

  // Load subcategories when category changes
  useEffect(() => {
    if (formData.category_id) {
      const selectedCategory = categories.find(cat => cat.id === parseInt(formData.category_id));
      setSubcategories(selectedCategory ? selectedCategory.subcategories : []);
    } else {
      setSubcategories([]);
    }
  }, [formData.category_id, categories]);

  const loadProductCategories = async () => {
    try {
      const response = await fetch('/api/products/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let fieldValue = value;

    if (type === 'number') {
      fieldValue = value === '' ? '' : parseFloat(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // Clear related errors
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }

    // Reset subcategory when category changes
    if (name === 'category_id') {
      setFormData(prev => ({
        ...prev,
        subcategory_id: ''
      }));
    }
  };

  const handleAddressSelect = (address, coordinates) => {
    setFormData(prev => ({
      ...prev,
      address: address,
      latitude: coordinates.lat,
      longitude: coordinates.lng
    }));

    if (errors.address) {
      setErrors(prev => ({
        ...prev,
        address: null
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate files
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert(`File ${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} is not an image.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setLoading(true);
    try {
      const uploadPromises = validFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch('/api/utils/upload-image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          return data.filename;
        }
        throw new Error('Upload failed');
      });

      const uploadedImages = await Promise.all(uploadPromises);
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedImages].slice(0, 3) // Max 3 images
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error uploading images. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }

    if (!formData.condition) {
      newErrors.condition = 'Condition is required';
    }

    if (!formData.estimated_value || formData.estimated_value <= 0) {
      newErrors.estimated_value = 'Estimated value must be greater than 0';
    }

    if (!formData.quantity || formData.quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const conditionOptions = [
    { value: 'new', label: 'New in Package' },
    { value: 'like-new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' }
  ];

  return (
    <div className="product-form-container">
      <form onSubmit={handleSubmit} className="product-form">
        <h2>{isEditing ? 'Edit Product' : 'Register Product'}</h2>

        {/* Product Name */}
        <div className="form-group">
          <label htmlFor="name">Product Name *</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className={`form-input ${errors.name ? 'error' : ''}`}
            placeholder="Enter product name"
            maxLength={100}
            disabled={loading}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        {/* Category */}
        <div className="form-group">
          <label htmlFor="category_id">Category *</label>
          <select
            id="category_id"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className={`form-select ${errors.category_id ? 'error' : ''}`}
            disabled={loading}
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category_id && <span className="error-message">{errors.category_id}</span>}
        </div>

        {/* Subcategory */}
        {subcategories.length > 0 && (
          <div className="form-group">
            <label htmlFor="subcategory_id">Subcategory</label>
            <select
              id="subcategory_id"
              name="subcategory_id"
              value={formData.subcategory_id}
              onChange={handleChange}
              className="form-select"
              disabled={loading}
            >
              <option value="">Select a subcategory (optional)</option>
              {subcategories.map(subcategory => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Condition */}
        <div className="form-group">
          <label htmlFor="condition">Condition *</label>
          <select
            id="condition"
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            className={`form-select ${errors.condition ? 'error' : ''}`}
            disabled={loading}
          >
            <option value="">Select condition</option>
            {conditionOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.condition && <span className="error-message">{errors.condition}</span>}
        </div>

        {/* Estimated Value and Quantity */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="estimated_value">Estimated Value (USD) *</label>
            <input
              id="estimated_value"
              name="estimated_value"
              type="number"
              step="0.01"
              min="0"
              value={formData.estimated_value}
              onChange={handleChange}
              className={`form-input ${errors.estimated_value ? 'error' : ''}`}
              placeholder="0.00"
              disabled={loading}
            />
            {errors.estimated_value && <span className="error-message">{errors.estimated_value}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Quantity *</label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={handleChange}
              className={`form-input ${errors.quantity ? 'error' : ''}`}
              disabled={loading}
            />
            {errors.quantity && <span className="error-message">{errors.quantity}</span>}
          </div>
        </div>

        {/* Address */}
        <div className="form-group">
          <label>Address *</label>
          <AddressAutocomplete
            onAddressSelect={handleAddressSelect}
            initialValue={formData.address}
            placeholder="Enter your address"
            className={errors.address ? 'error' : ''}
            disabled={loading}
          />
          {errors.address && <span className="error-message">{errors.address}</span>}
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-textarea"
            placeholder="Describe your product (optional)"
            maxLength={500}
            rows={4}
            disabled={loading}
          />
          <small className="character-count">
            {formData.description.length}/500 characters
          </small>
        </div>

        {/* Image Upload */}
        <div className="form-group">
          <label>Images (up to 3)</label>
          <div className="image-upload-section">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="image-input"
              disabled={loading || formData.images.length >= 3}
            />
            
            {formData.images.length > 0 && (
              <div className="image-preview-grid">
                {formData.images.map((image, index) => (
                  <div key={index} className="image-preview">
                    <img 
                      src={`/api/static/uploads/products/${image}`} 
                      alt={`Product ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="remove-image-btn"
                      disabled={loading}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                {isEditing ? 'Updating...' : 'Registering...'}
              </>
            ) : (
              isEditing ? 'Update Product' : 'Register Product'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
