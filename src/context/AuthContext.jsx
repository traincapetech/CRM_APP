import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    token: null,
    authenticated: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      setAuthState({
        user: null,
        token: null,
        authenticated: false,
      });
      delete apiClient.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    checkAuthState();
    
    // Setup interceptor for 401 errors
    const interceptor = apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token is invalid or expired, logout user
          console.log('Token invalid or expired, logging out...');
          await logout();
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      apiClient.interceptors.response.eject(interceptor);
    };
  }, []);

  const checkAuthState = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('userData');

      if (storedToken && storedUser) {
        setAuthState({
          user: JSON.parse(storedUser),
          token: storedToken,
          authenticated: true,
        });
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      console.log('apiClient:', apiClient);
      console.log('Attempting login with:', { email, password });
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      const { user: userData, token: authToken } = response.data.data;

      // Store in AsyncStorage
      await AsyncStorage.setItem('authToken', authToken);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      // Set in state
      setAuthState({
        user: userData,
        token: authToken,
        authenticated: true,
      });
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData, autoLogin = false) => {
    try {
      setIsLoading(true);
      console.log('apiClient:', apiClient);
      console.log('Attempting registration with:', userData);
      const response = await apiClient.post('/auth/register', userData);

      if (autoLogin) {
        const { user: newUser, token: authToken } = response.data.data;

        // Store in AsyncStorage
        await AsyncStorage.setItem('authToken', authToken);
        await AsyncStorage.setItem('userData', JSON.stringify(newUser));

        // Set in state
        setAuthState({
          user: newUser,
          token: authToken,
          authenticated: true,
        });
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      }

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (updatedUser) => {
    setAuthState(prev => ({ ...prev, user: updatedUser }));
    AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
  };

  const value = {
    authState,
    user: authState.user,
    token: authState.token,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
