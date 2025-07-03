// Authentication context and provider
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    setIsAuthenticated(true);
    localStorage.setItem('token', userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{
      user, token, isAuthenticated, login, logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
