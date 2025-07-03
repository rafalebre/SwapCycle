// Product API calls
import api from './api';

export const productService = {
  getProducts: (params) => api.get('/products', { params }),
  createProduct: (productData) => api.post('/products', productData),
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  getProductById: (id) => api.get(`/products/${id}`)
};

export default productService;
