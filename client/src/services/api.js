import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Request interceptor
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

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🚫 Prevent retry loop
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      originalRequest._retry = true;

      try {
        // ✅ Use SAME api instance
        const refreshRes = await api.post('/auth/refresh-token');

        const { accessToken } = refreshRes.data.data;

        localStorage.setItem('accessToken', accessToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // ❌ Refresh failed → logout
        localStorage.removeItem('accessToken');

        // Optional: cleaner navigation if using React Router
        window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    console.error('API Error:', error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

// ALL YOUR API FUNCTIONS (UNCHANGED BELOW)

// Auth
export const registerUser = (userData) => api.post('/auth/register', userData);
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const getCurrentUser = () => api.get('/auth/me');

export const updateProfile = (data) => {
    if (data instanceof FormData) {
        return api.put('/auth/me', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
    return api.put('/auth/me', data);
};

// Advanced Auth
export const googleLogin = (token, role) => api.post('/auth/google', { token, role });
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const verifyOtp = (email, otp) => api.post('/auth/verify-otp', { email, otp });
export const resetPassword = (email, otp, newPassword) => api.post('/auth/reset-password', { email, otp, newPassword });

// Artist Profile
export const getArtistProfile = (id) => api.get(`/artists/${id}`);
export const getArtists = (params) => api.get('/artists', { params });
export const updateArtistProfile = (data) => api.post('/artists/profile', data);

// Portfolio
export const getPortfolio = (artistId) => api.get(`/portfolio/${artistId}`);
export const addPortfolioItem = (formData) => api.post('/portfolio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const updatePortfolioItem = (id, data) => api.patch(`/portfolio/${id}`, data);
export const deletePortfolioItem = (id) => api.delete(`/portfolio/${id}`);
export const uploadPortfolioImage = (formData) => api.post('/portfolio/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

// Community Posts
export const getPosts = () => api.get('/posts');
export const createPost = (data) => api.post('/posts', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const toggleLike = (id) => api.put(`/posts/${id}/like`);
export const addComment = (id, data) => api.post(`/posts/${id}/comment`, data);

// Orders
export const getArtistOrders = () => api.get('/orders');
export const getClientOrders = () => api.get('/orders');
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

// Reviews
export const submitReview = (reviewData) => api.post('/reviews', reviewData);
export const getArtistReviews = (artistId) => api.get(`/reviews/artist/${artistId}`);

// Notifications
export const getNotifications = () => api.get('/notifications');
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.patch('/notifications/mark-all');

export default api;