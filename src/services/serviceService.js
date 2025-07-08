import api from './api';

const serviceService = {
  // Create new service
  createService: async (serviceData) => {
    try {
      const response = await api.post('/services', serviceData);
      return {
        success: true,
        data: response.data,
        message: 'Service created successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error creating service'
      };
    }
  },

  // Get all services for current user
  getUserServices: async () => {
    try {
      const response = await api.get('/services/user');
      return {
        success: true,
        data: response.data.services || [],
        total: response.data.total || 0
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Error fetching services'
      };
    }
  },

  // Get single service by ID
  getService: async (serviceId) => {
    try {
      const response = await api.get(`/services/${serviceId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error fetching service'
      };
    }
  },

  // Update service
  updateService: async (serviceId, serviceData) => {
    try {
      const response = await api.put(`/services/${serviceId}`, serviceData);
      return {
        success: true,
        data: response.data,
        message: 'Service updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error updating service'
      };
    }
  },

  // Delete service
  deleteService: async (serviceId) => {
    try {
      await api.delete(`/services/${serviceId}`);
      return {
        success: true,
        message: 'Service deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error deleting service'
      };
    }
  },

  // Get service categories
  getCategories: async () => {
    try {
      const response = await api.get('/services/categories');
      return {
        success: true,
        data: response.data.categories || []
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Error fetching categories'
      };
    }
  },

  // Search online services
  searchOnlineServices: async (params) => {
    try {
      const response = await api.get('/services/online', { params });
      return {
        success: true,
        data: response.data.services || [],
        total: response.data.total || 0,
        pages: response.data.pages || 1,
        currentPage: response.data.current_page || 1
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Error searching services'
      };
    }
  }
};

export default serviceService;
