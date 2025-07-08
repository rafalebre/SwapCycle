import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../components/forms/ProductForm';
import productService from '../services/productService';

const RegisterProduct = () => {
  const navigate = useNavigate();

  const handleProductSubmit = async (productData) => {
    try {
      const response = await productService.createProduct(productData);
      
      if (response.success) {
        alert('Product registered successfully!');
        navigate('/dashboard/my-listings');
      } else {
        alert('Error registering product: ' + response.message);
      }
    } catch (error) {
      console.error('Error registering product:', error);
      alert('Error registering product. Please try again.');
    }
  };

  return (
    <div className="register-product-page">
      <div className="page-header">
        <h1>Register New Product</h1>
        <p>Add your product to start trading with others</p>
      </div>
      
      <ProductForm onSubmit={handleProductSubmit} />
    </div>
  );
};

export default RegisterProduct;
