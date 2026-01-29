import axios from 'axios'
import { getAPIBaseURL } from './auth'

// Create a custom axios instance without static baseURL
// baseURL will be set dynamically from localStorage
const instance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
})

// Add request interceptor for dynamic baseURL and debugging
instance.interceptors.request.use(
  (config) => {
    // Dynamically set baseURL from localStorage
    const apiBaseURL = getAPIBaseURL();
    if (apiBaseURL) {
      config.baseURL = apiBaseURL;
    } else {
      console.warn('No API base URL found in localStorage. API calls may fail.');
    }

    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: (config.baseURL || '') + (config.url || ''),
      data: config.data,
      headers: config.headers
    })
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)


// Import router for redirection
import { ElMessage } from 'element-plus';
import { logout } from './auth';

// We'll need to set this from outside since we can't import router directly (circular dependency)
let router: any = null;

// Function to set the router instance
export const setRouter = (routerInstance: any) => {
  router = routerInstance;
};

// Add response interceptor for debugging and token handling
instance.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers
    });

    // Check for token expiration headers
    const tokenExpiringHeader = response.headers['x-token-expiring-soon'];
    const tokenExpiresIn = response.headers['x-token-expires-in'];

    if (tokenExpiringHeader === 'true' && tokenExpiresIn) {
      const minutesLeft = Math.floor(parseInt(tokenExpiresIn) / 60);
      console.log(`Token will expire in ${minutesLeft} minutes`);

      // Show a warning to the user if token will expire in less than 5 minutes
      if (minutesLeft < 5) {
        ElMessage({
          message: `您的登录将在${minutesLeft}分钟后过期，请及时保存工作并重新登录`,
          type: 'warning',
          duration: 10000,
          showClose: true
        });
      }
    }

    return response;
  },
  (error) => {
    console.error('API Response Error:', error);

    // Handle token expiration error
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error Response Data:', error.response.data);
      console.error('Error Response Status:', error.response.status);
      console.error('Error Response Headers:', error.response.headers);

      // Check if the error is due to token expiration
      if (error.response.status === 401 &&
        error.response.data &&
        error.response.data.error === 'Token expired') {

        console.log('Token expired error detected in API response');

        // If router is available, logout and redirect
        if (router) {
          logout(router, '登录已过期，请重新登录');
        } else {
          // If router is not available, just show a message
          ElMessage({
            message: '登录已过期，请重新登录',
            type: 'error',
            duration: 5000,
            showClose: true
          });

          // Clear token manually
          logout();

          // Redirect to login page manually
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error Request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error Message:', error.message);
    }

    return Promise.reject(error);
  }
)

export default instance
