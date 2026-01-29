/**
 * RSA Crypto Utility
 * Handles password encryption using RSA public key
 */
import JSEncrypt from 'jsencrypt';
import axios from 'axios';

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5001';

// Cache the public key
let cachedPublicKey: string | null = null;

/**
 * Fetch RSA public key from server
 */
export const fetchPublicKey = async (): Promise<string> => {
    if (cachedPublicKey) {
        return cachedPublicKey;
    }

    try {
        const response = await axios.get(`${AUTH_API_URL}/api/auth/public-key`);
        if (response.data.success && response.data.data.publicKey) {
            cachedPublicKey = response.data.data.publicKey;
            return cachedPublicKey!;
        }
        throw new Error('Failed to get public key');
    } catch (error) {
        console.error('Error fetching public key:', error);
        throw error;
    }
};

/**
 * Encrypt password using RSA public key
 * @param password - Plain text password
 * @returns Encrypted password (base64)
 */
export const encryptPassword = async (password: string): Promise<string> => {
    const publicKey = await fetchPublicKey();

    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKey);

    const encrypted = encrypt.encrypt(password);
    if (!encrypted) {
        throw new Error('Encryption failed');
    }

    return encrypted;
};

/**
 * Clear cached public key (call on logout or key rotation)
 */
export const clearPublicKeyCache = () => {
    cachedPublicKey = null;
};
