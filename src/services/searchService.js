// Search API calls
import api from './api';

export const searchService = {
  searchAll: (params) => api.get('/search', { params }),
  searchProducts: (params) => api.get('/search/products', { params }),
  searchServices: (params) => api.get('/search/services', { params }),
  searchOnlineServices: (params) => api.get('/search/online-services', { params })
};

export default searchService;
