// Product creation/editing form
import React, { useState } from 'react';

const ProductForm = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    condition: '',
    estimatedValue: '',
    description: '',
    address: '',
    quantity: 1,
    ...initialData
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <h2>Register Product</h2>
      <input name="name" placeholder="Product Name" onChange={handleChange} required />
      <select name="category" onChange={handleChange} required>
        <option value="">Select Category</option>
        <option value="electronics">Electronics</option>
        <option value="home">Home & Garden</option>
      </select>
      <select name="condition" onChange={handleChange} required>
        <option value="">Condition</option>
        <option value="new">New in Package</option>
        <option value="like-new">Like New</option>
        <option value="good">Good</option>
      </select>
      <input name="estimatedValue" type="number" placeholder="Estimated Value ($)" onChange={handleChange} required />
      <input name="quantity" type="number" placeholder="Quantity" onChange={handleChange} min="1" />
      <input name="address" placeholder="Address" onChange={handleChange} required />
      <textarea name="description" placeholder="Description (optional)" onChange={handleChange}></textarea>
      <button type="submit" className="btn">Register Product</button>
    </form>
  );
};

export default ProductForm;
