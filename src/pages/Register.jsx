// User registration page
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    name: '',
    surname: '',
    address: '',
    password: ''
  });
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.register(formData);
      login(response.data.user, response.data.token);
      alert('Registration successful!');
    } catch (error) {
      alert('Registration failed: ' + error.response?.data?.message);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
        <input name="username" placeholder="Username" onChange={handleChange} required />
        <input name="name" placeholder="Name" onChange={handleChange} required />
        <input name="surname" placeholder="Surname" onChange={handleChange} required />
        <input name="address" placeholder="Address" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
