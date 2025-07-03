// Service creation/editing form
import React, { useState } from 'react';

const ServiceForm = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    estimatedValue: '',
    description: '',
    address: '',
    isOnline: false,
    ...initialData
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="service-form">
      <h2>Register Service</h2>
      <input name="name" placeholder="Service Name" onChange={handleChange} required />
      <select name="category" onChange={handleChange} required>
        <option value="">Select Category</option>
        <option value="consulting">Consulting</option>
        <option value="education">Education</option>
        <option value="health">Healthcare</option>
      </select>
      <input name="estimatedValue" type="number" placeholder="Estimated Value ($)" onChange={handleChange} required />
      <label>
        <input name="isOnline" type="checkbox" onChange={handleChange} />
        Online Service
      </label>
      {!formData.isOnline && (
        <input name="address" placeholder="Service Location" onChange={handleChange} required />
      )}
      <textarea name="description" placeholder="Service Description" onChange={handleChange}></textarea>
      <button type="submit" className="btn">Register Service</button>
    </form>
  );
};

export default ServiceForm;
