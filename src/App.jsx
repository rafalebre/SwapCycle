import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RegisterService from './pages/RegisterService';
import RegisterProduct from './pages/RegisterProduct';
import MyListings from './pages/MyListings';
import Search from './pages/Search';
import OnlineServices from './pages/OnlineServices';
import Trades from './pages/Trades';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/search" element={<Search />} />
            <Route path="/online-services" element={<OnlineServices />} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
            
            {/* Registration Routes */}
            <Route path="/register-service" element={<RegisterService />} />
            <Route path="/register-product" element={<RegisterProduct />} />
            <Route path="/dashboard/register-service" element={<RegisterService />} />
            <Route path="/dashboard/register-product" element={<RegisterProduct />} />
            
            {/* User Management Routes */}
            <Route path="/dashboard/my-listings" element={<MyListings />} />
            <Route path="/dashboard/trades" element={<Trades />} />
            <Route path="/dashboard/favorites" element={<Favorites />} />
            <Route path="/dashboard/profile" element={<Profile />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
