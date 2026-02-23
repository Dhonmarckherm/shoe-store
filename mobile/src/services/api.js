import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use localhost for emulator, or update this IP for physical device
const LOCAL_IP = '10.111.5.200'; // Your computer's IP address

// For physical devices, use HTTPS for camera permissions
// Mobile browsers require HTTPS for camera access
const API_URL = Platform.OS === 'web'
  ? 'http://localhost:5000/api'  // Web uses HTTP localhost
  : `https://${LOCAL_IP}:5000/api`; // Physical device/emulator uses HTTPS

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Accept self-signed certificates for development
  validateStatus: (status) => status >= 200 && status < 300,
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  faceLogin: (data) => api.post('/auth/face-login', data),
  registerFace: (data) => api.post('/auth/face-register', data),
  getProfile: () => api.get('/auth/profile'),
};

// Products API
export const productAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  getFeatured: () => api.get('/products/featured'),
  getCategories: () => api.get('/products/categories'),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart', data),
  updateCartItem: (itemId, data) => api.put(`/cart/${itemId}`, data),
  removeFromCart: (itemId) => api.delete(`/cart/${itemId}`),
};

// Recommendations API
export const recommendationAPI = {
  getRecommendations: () => api.get('/recommendations'),
  getSimilarProducts: (productId) => api.get(`/recommendations/similar/${productId}`),
};

export default api;
