import axios from 'axios';

// Use environment variable or fallback to Render backend
const API_URL = import.meta.env.VITE_API_URL || 'https://shoe-store-api-yqhk.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('=== API SUCCESS ===');
    console.log('URL:', response.config.url);
    console.log('Status:', response.status);
    console.log('Response data:', response.data);
    return response;
  },
  (error) => {
    console.error('=== API ERROR ===');
    console.error('Error message:', error.message);
    console.error('API URL:', error.config?.url || API_URL);
    console.error('Full request URL:', error.config?.baseURL + error.config?.url);
    console.error('Error details:', error);
    console.error('Response data:', error.response?.data);
    console.error('Response status:', error.response?.status);
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
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
  deleteAccount: () => api.delete('/auth/profile'),
  changePassword: (data) => api.put('/auth/change-password', data),
  becomeSeller: (data) => api.post('/auth/become-seller', data),
  updateNotificationSettings: (data) => api.put('/auth/notification-settings', data),
};

// Products API
export const productAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  getFeatured: () => api.get('/products/featured'),
  getCategories: () => api.get('/products/categories'),
  searchProducts: (query) => api.get('/products/search', { params: { q: query } }),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart', data),
  updateCartItem: (itemId, data) => api.put(`/cart/${itemId}`, data),
  removeFromCart: (itemId) => api.delete(`/cart/${itemId}`),
  clearCart: () => api.delete('/cart'),
};

// Recommendations API
export const recommendationAPI = {
  getRecommendations: () => api.get('/recommendations'),
  getSimilarProducts: (productId) => api.get(`/recommendations/similar/${productId}`),
};

// Orders API
export const orderAPI = {
  createOrder: (data) => api.post('/orders', data),
  getOrders: (status) => api.get('/orders', { params: { status } }),
  getOrder: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  payOrder: (id) => api.put(`/orders/${id}/pay`),
};

export default api;
