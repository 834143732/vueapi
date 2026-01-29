import axios from './index';
import { ElMessage } from 'element-plus';

// Store the JWT token and expiration
let token: string | null = null;
let tokenExpiration: string | null = null;

// API Base URL management
export const setAPIBaseURL = (url: string) => {
  console.log('Setting API base URL:', url);
  localStorage.setItem('apiBaseURL', url);
};

export const getAPIBaseURL = (): string | null => {
  return localStorage.getItem('apiBaseURL');
};

// Image Base URL management
export const setImageBaseURL = (url: string) => {
  console.log('Setting Image base URL:', url);
  localStorage.setItem('imageBaseURL', url);
};

export const getImageBaseURL = (): string | null => {
  return localStorage.getItem('imageBaseURL');
};

// Set the JWT token
export const setToken = (newToken: string) => {
  console.log('Setting authentication token:', newToken);
  token = newToken;

  // Set the token in localStorage for persistence
  localStorage.setItem('token', newToken);

  // Set the token in axios headers for all future requests
  axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

  // Log the current headers to verify the token is set
  console.log('Current axios headers:', axios.defaults.headers.common);

  // Test if the token is correctly set
  const currentToken = axios.defaults.headers.common['Authorization'];
  if (currentToken) {
    console.log('Authorization header successfully set:', currentToken);
  } else {
    console.error('Failed to set Authorization header!');
  }
};

// Set the token expiration time
export const setTokenExpiration = (expirationTime: string) => {
  console.log('Setting token expiration time:', expirationTime);
  tokenExpiration = expirationTime;

  // Set the expiration time in localStorage for persistence
  localStorage.setItem('tokenExpiration', expirationTime);
};

// Get the token expiration time
export const getTokenExpiration = (): string | null => {
  console.log('Getting token expiration time...');

  // If expiration is not in memory, try to get it from localStorage
  if (!tokenExpiration) {
    console.log('Token expiration not in memory, checking localStorage...');
    tokenExpiration = localStorage.getItem('tokenExpiration');

    if (tokenExpiration) {
      console.log('Token expiration found in localStorage:', tokenExpiration);
    } else {
      console.log('No token expiration found in localStorage');
    }
  } else {
    console.log('Using token expiration from memory:', tokenExpiration);
  }

  return tokenExpiration;
};

// Check if the token is expired
export const isTokenExpired = (): boolean => {
  const expiration = getTokenExpiration();
  if (!expiration) {
    console.log('No token expiration found, assuming token is valid');
    return false;
  }

  const expirationDate = new Date(expiration);
  const now = new Date();

  console.log('Token expiration check:', {
    expirationDate: expirationDate.toISOString(),
    now: now.toISOString(),
    isExpired: now >= expirationDate
  });

  return now >= expirationDate;
};

// Get the JWT token
export const getToken = (): string | null => {
  console.log('Getting authentication token...');

  // If token is not in memory, try to get it from localStorage
  if (!token) {
    console.log('Token not in memory, checking localStorage...');
    token = localStorage.getItem('token');

    if (token) {
      console.log('Token found in localStorage:', token);
      // Set the token in axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Authorization header set from localStorage token');
    } else {
      console.log('No token found in localStorage');
    }
  } else {
    console.log('Using token from memory:', token);
  }

  // Verify the current headers
  console.log('Current axios headers after getToken:', axios.defaults.headers.common);

  return token;
};

// Remove the JWT token (logout)
export const removeToken = () => {
  console.log('Removing authentication token from memory and storage...');

  // Clear token from memory
  token = null;
  tokenExpiration = null;

  // Clear token from localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('tokenExpiration');

  // Clear Authorization header from axios
  delete axios.defaults.headers.common['Authorization'];

  // Clear any other auth-related headers if they exist
  delete axios.defaults.headers.common['X-Auth-Token'];

  console.log('Authentication token removed successfully');
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const hasToken = !!getToken();
  if (!hasToken) {
    return false;
  }

  // Check if token is expired
  if (isTokenExpired()) {
    console.log('Token is expired, user is not authenticated');
    return false;
  }

  return true;
};

// Initialize token from localStorage on app start
export const initializeAuth = () => {
  const token = getToken();
  getTokenExpiration(); // Also initialize the token expiration

  // If no token is found, we'll still allow the app to work without authentication
  if (!token) {
    console.log('No authentication token found. Some features may be limited.');
  } else if (isTokenExpired()) {
    console.log('Token is expired. User will be logged out.');
  }
};

// Comprehensive logout function that can be called from anywhere
export const logout = (router?: any, message?: string) => {
  console.log('Performing comprehensive logout...');

  // Clear all authentication data
  removeToken();

  // Clear all user-related data from localStorage
  localStorage.removeItem('user');
  localStorage.removeItem('userInfo');
  localStorage.removeItem('permissions');
  localStorage.removeItem('lastLoginTime');
  localStorage.removeItem('settings');

  // Clear API URLs
  localStorage.removeItem('apiBaseURL');
  localStorage.removeItem('imageBaseURL');

  // Clear super admin flag
  localStorage.removeItem('isSuperAdmin');

  // Clear session storage as well
  sessionStorage.clear();

  // If router is provided, redirect to login page
  if (router) {
    console.log('Redirecting to login page...');

    // If a message is provided, show it
    if (message) {
      ElMessage({
        message: message,
        type: 'warning',
        duration: 5000,
        showClose: true
      });
    }

    router.push('/login');
  }

  console.log('Logout completed successfully');
};
