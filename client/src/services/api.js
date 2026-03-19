import axios from 'axios';
import { store } from '../store/store';
import { setCredentials, logoutUser } from '../store/authSlice';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// ── Request interceptor: attach access token from Redux memory ─────────────
api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: auto-refresh on 401 ─────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest || originalRequest._retry) return Promise.reject(error);

    if (error.response?.status === 401) {
      originalRequest._retry = true;
      try {
        const refreshRes = await api.post('/auth/refresh-token');
        const { accessToken } = refreshRes.data.data;
        if (!accessToken) {
          store.dispatch(logoutUser());
          return Promise.reject(error);
        }
        store.dispatch(setCredentials({ user: store.getState().auth.user, accessToken }));
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch {
        store.dispatch(logoutUser());
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

// ═══════════════════════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════════════════════
export const registerUser = (data) => api.post('/auth/register', data);

// Send 'identifier' for email-or-username login
export const loginUser = ({ identifier, password }) =>
  api.post('/auth/login', { identifier, password });

export const googleLogin = (token, role) => api.post('/auth/google', { token, role });
export const completeGoogleProfile = (data) => api.post('/auth/complete-profile', data);

export const getCurrentUser = () => api.get('/auth/me');
export const logoutUser_api = () => api.post('/auth/logout');
export const refreshToken = () => api.post('/auth/refresh-token');

export const updateProfile = (data) => {
  if (data instanceof FormData) {
    return api.put('/auth/me', data, { headers: { 'Content-Type': 'multipart/form-data' } });
  }
  return api.put('/auth/me', data);
};

export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const verifyOtp = (email, otp) => api.post('/auth/verify-otp', { email, otp });
export const resetPassword = (email, otp, newPassword) =>
  api.post('/auth/reset-password', { email, otp, newPassword });

// ═══════════════════════════════════════════════════════════════
//  ARTISTS
// ═══════════════════════════════════════════════════════════════
export const getArtistProfile = (artistId) => api.get(`/artists/${artistId}`);
export const getArtists = (params) => api.get('/artists', { params });
export const updateArtistProfile = (data) => api.post('/artists/profile', data);

// ═══════════════════════════════════════════════════════════════
//  PORTFOLIO / ARTWORKS
// ═══════════════════════════════════════════════════════════════
export const getPortfolio = (artistId, params) => api.get(`/portfolio/${artistId}`, { params });
export const addPortfolioItem = (formData) =>
  api.post('/portfolio', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updatePortfolioItem = (id, formData) =>
  api.patch(`/portfolio/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deletePortfolioItem = (id) => api.delete(`/portfolio/${id}`);
export const toggleArtworkLike = (id) => api.post(`/portfolio/${id}/like`);
export const toggleArtworkAvailability = (id) => api.patch(`/portfolio/${id}/availability`);

// ═══════════════════════════════════════════════════════════════
//  ORDERS
// ═══════════════════════════════════════════════════════════════
export const getOrders = (params) => api.get('/orders', { params });
export const createOrder = (data) => api.post('/orders', data);
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const updateOrderStatus = (id, status, extras = {}) =>
  api.patch(`/orders/${id}/status`, { status, ...extras });
export const setOrderPrice = (id, price) => api.patch(`/orders/${id}/price`, { price });
// Alias helpers
export const getArtistOrders = (params) => getOrders(params);
export const getClientOrders = (params) => getOrders(params);

// ═══════════════════════════════════════════════════════════════
//  MESSAGES
// ═══════════════════════════════════════════════════════════════
export const getOrderMessages = (orderId) => api.get(`/orders/${orderId}/messages`);
export const sendMessage = (orderId, data) => {
  if (data instanceof FormData) {
    return api.post(`/orders/${orderId}/messages`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
  return api.post(`/orders/${orderId}/messages`, data);
};

// ═══════════════════════════════════════════════════════════════
//  REVIEWS
// ═══════════════════════════════════════════════════════════════
export const submitReview = (data) => api.post('/reviews', data);
export const getArtistReviews = (artistId) => api.get(`/reviews/artist/${artistId}`);

// ═══════════════════════════════════════════════════════════════
//  FEEDBACK
// ═══════════════════════════════════════════════════════════════
export const createFeedback = (data) => api.post('/feedback', data);
export const getFeedbackForArtwork = (portfolioItemId) =>
  api.get(`/feedback/artwork/${portfolioItemId}`);
export const likeFeedback = (id) => api.post(`/feedback/${id}/like`);

// ═══════════════════════════════════════════════════════════════
//  COMMUNITY POSTS
// ═══════════════════════════════════════════════════════════════
export const getPosts = (params) => api.get('/posts', { params });
export const createPost = (data) =>
  api.post('/posts', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const toggleLike = (id) => api.put(`/posts/${id}/like`);
export const addComment = (id, data) => api.post(`/posts/${id}/comment`, data);

// ═══════════════════════════════════════════════════════════════
//  CATEGORIES
// ═══════════════════════════════════════════════════════════════
export const getCategories = () => api.get('/categories');

// ═══════════════════════════════════════════════════════════════
//  ADMIN
// ═══════════════════════════════════════════════════════════════
export const getAdminStats = () => api.get('/admin/stats');
export const getAdminUsers = (params) => api.get('/admin/users', { params });
export const deleteAdminUser = (id) => api.delete(`/admin/users/${id}`);
export const updateAdminUserRole = (id, role) => api.patch(`/admin/users/${id}/role`, { role });

// ═══════════════════════════════════════════════════════════════
//  NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════
export const getNotifications = () => api.get('/notifications');
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.patch('/notifications/mark-all');

export default api;