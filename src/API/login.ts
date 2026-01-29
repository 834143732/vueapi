import axios from 'axios'
import { setToken, setTokenExpiration, setAPIBaseURL, setImageBaseURL } from './auth'
import { encryptPassword } from '../utils/crypto'

// Auth API URL from environment variable
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5001';

// Super Admin flag management
export const setSuperAdmin = (isSuperAdmin: boolean) => {
  localStorage.setItem('isSuperAdmin', isSuperAdmin ? 'true' : 'false');
};

export const isSuperAdmin = (): boolean => {
  return localStorage.getItem('isSuperAdmin') === 'true';
};

export const clearSuperAdmin = () => {
  localStorage.removeItem('isSuperAdmin');
}
const handleLogin = async (formData: any) => {
  console.log('Attempting to login with credentials:', { username: formData.username, password: '******' });

  try {
    // Encrypt password with RSA public key
    console.log('Encrypting password with RSA...');
    const encryptedPassword = await encryptPassword(formData.password);
    console.log('Password encrypted successfully');

    // Make the API call to the auth server login endpoint
    console.log(`Making API call to ${AUTH_API_URL}/api/auth/login`);
    const response = await axios.post(`${AUTH_API_URL}/api/auth/login`, {
      username: formData.username,
      password: encryptedPassword
    });

    console.log('Login API response status:', response.status);
    console.log('Login API response data:', response.data);

    if (response.data.success) {
      const { token, expiresAt, nick, apiBaseURL, imageBaseURL, isSuperAdmin: superAdminFlag, imgUrlCount, contentCount, seoConfig } = response.data.data;

      console.log('Login successful:', { nick, apiBaseURL, imageBaseURL, isSuperAdmin: superAdminFlag, imgUrlCount, contentCount, seoConfig });

      // Store the token
      if (token) {
        console.log('Token received from server:', token);
        setToken(token);
      }

      // Store the token expiration time
      if (expiresAt) {
        setTokenExpiration(expiresAt);
      } else {
        // If no expiration provided, set a default (2 hours from now)
        const defaultExpiration = new Date();
        defaultExpiration.setHours(defaultExpiration.getHours() + 2);
        setTokenExpiration(defaultExpiration.toISOString());
      }

      // Store the API base URL
      if (apiBaseURL) {
        setAPIBaseURL(apiBaseURL);
      }

      // Store the Image base URL
      if (imageBaseURL) {
        setImageBaseURL(imageBaseURL);
      }

      // Store super admin flag
      setSuperAdmin(superAdminFlag || false);

      // Double-check that values were stored correctly
      console.log('Stored values:', {
        token: localStorage.getItem('token'),
        tokenExpiration: localStorage.getItem('tokenExpiration'),
        apiBaseURL: localStorage.getItem('apiBaseURL'),
        imageBaseURL: localStorage.getItem('imageBaseURL')
      });

      // Return the successful response
      return {
        success: true,
        message: 'Login successful',
        userId: response.data.data?.id || 1,
        username: nick || formData.username,
        token: token,
        expiresAt: expiresAt,
        apiBaseURL: apiBaseURL,
        imageBaseURL: imageBaseURL,
        isSuperAdmin: superAdminFlag || false,
        imgUrlCount: imgUrlCount || 0,
        contentCount: contentCount || 0,
        seoConfig: seoConfig || 0
      };
    } else {
      console.error('Login failed:', response.data.message);
      return { success: false, message: response.data.message || '登录失败' };
    }
  } catch (error: any) {
    console.error('Login error:', error);

    // Extract error message from response if available
    const errorMessage = error.response?.data?.message || error.message || '登录失败';
    return { success: false, message: errorMessage };
  }
};

export default handleLogin