import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ServiceForm from '../components/forms/ServiceForm';
import serviceService from '../services/serviceService';

const RegisterService = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleServiceSubmit = async (serviceData) => {
    if (!user || !token) {
      setError('You must be logged in to register a service');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await serviceService.createService(serviceData);
      
      if (response.status === 201) {
        // Success - redirect to user's services
        navigate('/dashboard/my-listings', { 
          state: { 
            message: 'Service registered successfully!',
            tab: 'services'
          }
        });
      }
    } catch (error) {
      console.error('Error creating service:', error);
      
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to register service. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="auth-required">
        <h2>Login Required</h2>
        <p>You must be logged in to register a service.</p>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/login')}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="register-service-page">
      <div className="page-header">
        <h1>Register New Service</h1>
        <p>Share your skills and services with the SwapCycle community</p>
      </div>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className="form-container">
        <ServiceForm 
          onSubmit={handleServiceSubmit}
          isEditing={false}
        />
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Registering your service...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterService;
