import api from './api';

export const serviceService = {
  // Get all services with filtering
  getServices: (params = {}) => api.get('/services', { params }),
  
  // Get single service by ID
  getServiceById: (id) => api.get(`/services/${id}`),
  
  // Create new service
  createService: (serviceData) => api.post('/services', serviceData),
  
  // Update existing service
  updateService: (id, serviceData) => api.put(`/services/${id}`, serviceData),
  
  // Delete service
  deleteService: (id) => api.delete(`/services/${id}`),
  
  // Get service categories
  getServiceCategories: () => api.get('/services/categories'),
  
  // Get online services only
  getOnlineServices: (params = {}) => api.get('/services/online', { params }),
  
  // Get user's services
  getUserServices: (userId, params = {}) => api.get('/services', { 
    params: { ...params, user_id: userId } 
  }),
  
  // Filter services by type
  filterServices: (filters) => {
    const params = {};
    
    if (filters.category_id) params.category_id = filters.category_id;
    if (filters.subcategory_id) params.subcategory_id = filters.subcategory_id;
    if (filters.is_online !== undefined) params.is_online = filters.is_online;
    if (filters.keyword) params.keyword = filters.keyword;
    if (filters.page) params.page = filters.page;
    if (filters.per_page) params.per_page = filters.per_page;
    
    return api.get('/services', { params });
  }
};

export default serviceService;
