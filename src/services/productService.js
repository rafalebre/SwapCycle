import api from './api';

const productService = {
  // Create new product
  createProduct: async (productData) => {
    try {
      const response = await api.post('/products', productData);
      return {
        success: true,
        data: response.data,
        message: 'Product created successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error creating product'
      };
    }
  },

  // Get all products for current user
  getUserProducts: async () => {
    try {
      const response = await api.get('/products/user');
      return {
        success: true,
        data: response.data.products || [],
        total: response.data.total || 0
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Error fetching products'
      };
    }
  },

  // Get single product by ID
  getProduct: async (productId) => {
    try {
      const response = await api.get(`/products/${productId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error fetching product'
      };
    }
  },

  // Update product
  updateProduct: async (productId, productData) => {
    try {
      const response = await api.put(`/products/${productId}`, productData);
      return {
        success: true,
        data: response.data,
        message: 'Product updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error updating product'
      };
    }
  },

  // Delete product
  deleteProduct: async (productId) => {
    try {
      await api.delete(`/products/${productId}`);
      return {
        success: true,
        message: 'Product deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error deleting product'
      };
    }
  },

  // Get product categories
  getCategories: async () => {
    try {
      const response = await api.get('/products/categories');
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
  }
};

export default productService;
