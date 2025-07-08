import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import AddressAutocomplete from '../components/maps/AddressAutocomplete';

const Profile = () => {
  const { user, updateProfile, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    address: '',
    phone: '',
    bio: ''
  });
  const [errors, setErrors] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        surname: user.surname || '',
        email: user.email || '',
        address: user.address || '',
        phone: user.phone || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleAddressSelect = (address, coordinates) => {
    setFormData(prev => ({
      ...prev,
      address: address
    }));

    if (errors.address) {
      setErrors(prev => ({
        ...prev,
        address: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.surname.trim()) {
      newErrors.surname = 'Surname is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaveLoading(true);
    try {
      const success = await updateProfile(formData);
      if (success) {
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert('Error updating profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original user data
    if (user) {
      setFormData({
        name: user.name || '',
        surname: user.surname || '',
        email: user.email || '',
        address: user.address || '',
        phone: user.phone || '',
        bio: user.bio || ''
      });
    }
    setErrors({});
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your account information</p>
      </div>

      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="profile-info">
              <h2>{user?.name} {user?.surname}</h2>
              <p className="profile-email">{user?.email}</p>
              <p className="profile-member-since">
                Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
            <div className="profile-actions">
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="btn btn-primary"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="edit-actions">
                  <button 
                    onClick={handleSave}
                    className="btn btn-success"
                    disabled={saveLoading}
                  >
                    {saveLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    onClick={handleCancel}
                    className="btn btn-secondary"
                    disabled={saveLoading}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="profile-form">
            {/* Personal Information */}
            <div className="form-section">
              <h3>Personal Information</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">First Name *</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    placeholder="Enter your first name"
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="surname">Last Name *</label>
                  <input
                    id="surname"
                    name="surname"
                    type="text"
                    value={formData.surname}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`form-input ${errors.surname ? 'error' : ''}`}
                    placeholder="Enter your last name"
                  />
                  {errors.surname && <span className="error-message">{errors.surname}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="Enter your email address"
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="form-input"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Location Information */}
            <div className="form-section">
              <h3>Location</h3>
              
              <div className="form-group">
                <label>Address *</label>
                {isEditing ? (
                  <AddressAutocomplete
                    onAddressSelect={handleAddressSelect}
                    initialValue={formData.address}
                    placeholder="Enter your address"
                    className={errors.address ? 'error' : ''}
                  />
                ) : (
                  <input
                    type="text"
                    value={formData.address}
                    disabled
                    className="form-input"
                  />
                )}
                {errors.address && <span className="error-message">{errors.address}</span>}
              </div>
            </div>

            {/* About Section */}
            <div className="form-section">
              <h3>About You</h3>
              
              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="form-textarea"
                  placeholder="Tell others about yourself and what you're looking to trade"
                  maxLength={500}
                  rows={4}
                />
                <small className="character-count">
                  {formData.bio.length}/500 characters
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Account Stats */}
        <div className="profile-stats">
          <div className="stats-card">
            <h3>Trading Activity</h3>
            <div className="stat-grid">
              <div className="stat-item">
                <span className="stat-number">0</span>
                <span className="stat-label">Products Listed</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">0</span>
                <span className="stat-label">Services Listed</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">0</span>
                <span className="stat-label">Completed Trades</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">0</span>
                <span className="stat-label">Active Listings</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
