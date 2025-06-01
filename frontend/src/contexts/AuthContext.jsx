import { createContext, useContext, useState, useEffect } from 'react';
import { handleAuthError, handleNetworkError } from '../utils/errorHandler';
import axios from 'axios';

// Create and export the context
export const AuthContext = createContext(null);

// Create and export the hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Create and export the provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (data) => {
    try {
      if (!data.token || !data.user) {
        throw new Error('Invalid authentication data');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);

      // Set default authorization header for all future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      delete axios.defaults.headers.common['Authorization'];
    } catch (error) {
      handleNetworkError(error);
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', userData);
      return response.data;
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 