import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

const ServiceForm = ({ onSubmit, initialData = {}, isEditing = false }) => {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    subcategory_id: '',
    estimated_value: '',
    description: '',
    is_online: false,
    address: '',
    latitude: null,
    longitude: null,
    ...initialData
  });

  // Load service categories on component mount
  useEffect(() => {
    loadServiceCategories();
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

  const loadServiceCategories = async () => {
    try {
      const response = await fetch('/api/services/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // Clear related fields when switching to online
    if (name === 'is_online' && checked) {
      setFormData(prev => ({
        ...prev,
        address: '',
        latitude: null,
        longitude: null
      }));
    }

    // Clear errors for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Service name is required';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }

    if (!formData.estimated_value || formData.estimated_value <= 0) {
      newErrors.estimated_value = 'Valid estimated value is required';
    }

    // Address is required for physical services
    if (!formData.is_online && !formData.address.trim()) {
      newErrors.address = 'Address is required for physical services';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddressGeocoding = async (address) => {
    try {
      const response = await fetch('/api/utils/geocode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ address })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return {
            latitude: data.coordinates.latitude,
            longitude: data.coordinates.longitude
          };
        }
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
    }
    return { latitude: null, longitude: null };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let finalFormData = { ...formData };

      // Geocode address for physical services
      if (!formData.is_online && formData.address) {
        const coordinates = await handleAddressGeocoding(formData.address);
        finalFormData = {
          ...finalFormData,
          ...coordinates
        };
      }

      await onSubmit(finalFormData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Error creating service. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="service-form-container">
      <form onSubmit={handleSubmit} className="service-form">
        <h2>{isEditing ? 'Edit Service' : 'Register New Service'}</h2>
        
        {errors.submit && (
          <div className="error-message">{errors.submit}</div>
        )}

        <div className="form-group">
          <label htmlFor="name">Service Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter service name"
            className={errors.name ? 'error' : ''}
            required
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="category_id">Category *</label>
          <select
            id="category_id"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className={errors.category_id ? 'error' : ''}
            required
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category_id && <span className="field-error">{errors.category_id}</span>}
        </div>

        {subcategories.length > 0 && (
          <div className="form-group">
            <label htmlFor="subcategory_id">Subcategory</label>
            <select
              id="subcategory_id"
              name="subcategory_id"
              value={formData.subcategory_id}
              onChange={handleChange}
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

        <div className="form-group">
          <label htmlFor="estimated_value">Estimated Value (USD) *</label>
          <input
            type="number"
            id="estimated_value"
            name="estimated_value"
            value={formData.estimated_value}
            onChange={handleChange}
            placeholder="0.00"
            min="0"
            step="0.01"
            className={errors.estimated_value ? 'error' : ''}
            required
          />
          {errors.estimated_value && <span className="field-error">{errors.estimated_value}</span>}
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="is_online"
              checked={formData.is_online}
              onChange={handleChange}
            />
            <span className="checkmark"></span>
            This is an online service
          </label>
          <small className="help-text">
            Check this if your service can be provided remotely (online)
          </small>
        </div>

        {!formData.is_online && (
          <div className="form-group">
            <label htmlFor="address">Service Location *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter the address where you provide this service"
              className={errors.address ? 'error' : ''}
              required={!formData.is_online}
            />
            {errors.address && <span className="field-error">{errors.address}</span>}
            <small className="help-text">
              This address will be used to show your service location on the map
            </small>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your service (optional)"
            rows="4"
            maxLength="500"
          ></textarea>
          <small className="help-text">
            {formData.description.length}/500 characters
          </small>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (isEditing ? 'Update Service' : 'Register Service')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceForm;
