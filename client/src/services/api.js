import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
});

// Request interceptor: Attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle expired tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = res.data.data;
        localStorage.setItem('accessToken', accessToken);
        
        // Update header and retry
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, logout user
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    console.error('API Error:', error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

// Auth
export const registerUser = (userData) => api.post('/auth/register', userData);
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const getCurrentUser = () => api.get('/auth/me');

// Advanced Auth
export const googleLogin = (token) => api.post('/auth/google', { token });
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const verifyOtp = (email, otp) => api.post('/auth/verify-otp', { email, otp });
export const resetPassword = (email, otp, newPassword) => api.post('/auth/reset-password', { email, otp, newPassword });

// Artist Profile
export const getArtistProfile = (id) => api.get(`/artists/${id}`);
export const getArtists = (params) => api.get('/artists', { params });
export const updateArtistProfile = (data) => api.post('/artists/profile', data);

// Portfolio
export const getPortfolio = (artistId) => api.get(`/portfolio/artist/${artistId}`);
export const addPortfolioItem = (data) => api.post('/portfolio', data);
export const deletePortfolioItem = (id) => api.delete(`/portfolio/${id}`);

// Services
export const getServices = (artistId) => api.get(`/services/artist/${artistId}`);
export const createService = (data) => api.post('/services', data);

// Orders
export const getArtistOrders = () => api.get('/orders/artist');
export const getClientOrders = () => api.get('/orders/client');
export const createOrder = (data) => api.post('/orders', data);
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, { status });

// Messages
export const getOrderMessages = (orderId) => api.get(`/orders/${orderId}/messages`);
export const sendMessage = (orderId, data) => api.post(`/orders/${orderId}/messages`, data);

// Categories
export const getCategories = () => api.get('/categories');

// Admin
export const getAdminStats = () => api.get('/admin/stats');
export const getAdminUsers = () => api.get('/admin/users');
export const deleteAdminUser = (id) => api.delete(`/admin/users/${id}`);

// Payments
export const createConnectAccount = () => api.post('/payments/connect');
export const createCheckoutSession = (orderId) => api.post('/payments/checkout', { orderId });

// Reviews
export const submitReview = (reviewData) => api.post('/reviews', reviewData);
export const getArtistReviews = (artistId) => api.get(`/reviews/artist/${artistId}`);

// Notifications
export const getNotifications = () => api.get('/notifications');
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.patch('/notifications/mark-all');

// Disputes
export const raiseDispute = (disputeData) => api.post('/disputes', disputeData);
export const getAdminDisputes = () => api.get('/disputes/admin');
export const resolveDispute = (id, resolutionData) => api.patch(`/disputes/${id}/resolve`, resolutionData);

export default api;
