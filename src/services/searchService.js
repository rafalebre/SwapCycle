import api from './api';

export const searchService = {
  // Universal search
  search: (params) => {
    return api.get('/search', { params });
  },

  // Map data for markers
  getMapData: (params) => {
    return api.get('/search/map-data', { params });
  },

  // Search only products
  searchProducts: (params) => {
    return api.get('/search/products', { params });
  },

  // Search only services
  searchServices: (params) => {
    return api.get('/search/services', { params });
  },

  // Search online services
  searchOnlineServices: (params) => {
    return api.get('/search/online-services', { params });
  },

  // Get categories for filters
  getCategories: (type = 'all') => {
    return api.get('/search/categories', { params: { type } });
  },

  // Get subcategories for a specific category
  getSubcategories: (categoryId, type = 'product') => {
    return api.get('/search/subcategories', { 
      params: { 
        category_id: categoryId, 
        type: type 
      } 
    });
  },

  // Helper to get user's location
  getUserLocation: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  },

  // Helper to build search params
  buildSearchParams: (filters, userLocation = null, mapBounds = null) => {
    const params = {};

    // Basic filters
    if (filters.keyword) params.keyword = filters.keyword;
    if (filters.type && filters.type !== 'all') params.type = filters.type;
    if (filters.category_id) params.category_id = filters.category_id;
    if (filters.subcategory_id) params.subcategory_id = filters.subcategory_id;
    if (filters.min_price) params.min_price = filters.min_price;
    if (filters.max_price) params.max_price = filters.max_price;

    // Location-based search
    if (mapBounds) {
      params.north = mapBounds.north;
      params.south = mapBounds.south;
      params.east = mapBounds.east;
      params.west = mapBounds.west;
    } else if (userLocation) {
      params.lat = userLocation.lat;
      params.lng = userLocation.lng;
      if (filters.radius) params.radius = filters.radius;
    }

    // Pagination
    if (filters.page) params.page = filters.page;
    if (filters.per_page) params.per_page = filters.per_page;

    return params;
  }
};

export default searchService;
