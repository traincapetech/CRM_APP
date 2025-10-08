import apiClient from '../services/api';

export const testApiConnection = async () => {
  try {
    console.log('Testing API connection...');
    console.log('apiClient:', apiClient);
    console.log('apiClient.post:', typeof apiClient.post);
    
    const response = await apiClient.get('/health');
    console.log('API Health Check Response:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('API Test Error:', error);
    return { success: false, error: error.message };
  }
};

export const testRegistration = async (userData) => {
  try {
    console.log('Testing registration...');
    console.log('apiClient:', apiClient);
    console.log('apiClient.post:', typeof apiClient.post);
    
    const response = await apiClient.post('/auth/register', userData);
    console.log('Registration Response:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Registration Test Error:', error);
    return { success: false, error: error.message };
  }
};
