import { createContext, useContext, useState, useEffect } from 'react';
import { handleAuthError, handleNetworkError } from '../utils/errorHandler';
import { register as apiRegister, login as apiLogin, getAuthUser } from '../lib/api';

// Create the context
export const AuthContext = createContext(null);

// Create the provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (storedUser && token) {
          try {
            // Verify the token by making an API call
            const { success, user: currentUser } = await getAuthUser();
            if (success && currentUser) {
              setUser(currentUser);
            } else {
              // If token is invalid, clear storage
              localStorage.removeItem('user');
              localStorage.removeItem('token');
            }
          } catch (error) {
            console.error('Error verifying auth:', error);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const data = await apiLogin(credentials);
      if (!data.token || !data.user) {
        throw new Error('Invalid authentication data');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
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
    } catch (error) {
      handleNetworkError(error);
    }
  };

  const register = async (userData) => {
    try {
      const data = await apiRegister(userData);
      return data;
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
      {children}
    </AuthContext.Provider>
  );
}

// Create the hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 