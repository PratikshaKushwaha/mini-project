import axios from 'axios';
import { store } from '../store/store';
import { setCredentials, logoutUser } from '../store/authSlice';

/**
 * @module ApiClient
 * @description Standardized Axios client for centralizing API interactions.
 * Handles automatic token injection, session persistence via Redux, and auto-refresh of expired access tokens.
 * 
 * @constant api
 * @private
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
});

/** 
 * @interceptor Request
 * @description Synchronizes the request headers with the current Redux auth state.
 */
api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** 
 * @interceptor Response
 * @description Handles basic response interception. Refresh token logic has been removed.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logoutUser());
    }
    return Promise.reject(error);
  }
);

/* -------------------------------------------------------------------------- */
/*                            CLIENT API DEFINITIONS                            */
/* -------------------------------------------------------------------------- */

// --- Authentication ---
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = ({ identifier, password }) => api.post('/auth/login', { identifier, password });
export const googleLogin = (token, role) => api.post('/auth/google', { token, role });
export const completeGoogleProfile = (data) => api.post('/auth/complete-profile', data);
export const getCurrentUser = () => api.get('/auth/me');
export const logoutUser_api = () => api.post('/auth/logout');
export const updateProfile = (data) => {
  if (data instanceof FormData) {
    return api.put('/auth/me', data, { headers: { 'Content-Type': 'multipart/form-data' } });
  }
  return api.put('/auth/me', data);
};
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const verifyOtp = (email, otp) => api.post('/auth/verify-otp', { email, otp });
export const resetPassword = (email, otp, newPassword) => api.post('/auth/reset-password', { email, otp, newPassword });

// --- Admin ---
// These are the canonical named exports consumed by AdminDashboard and other admin views.
export const getAdminStats = () => api.get('/admin/stats');
export const getAdminUsers = (params) => api.get('/admin/users', { params });
export const deleteAdminUser = (userId) => api.delete(`/admin/users/${userId}`);
export const changeUserRole = (userId, role) => api.patch(`/admin/users/${userId}/role`, { role });


// --- Artist Discovery ---
export const getArtistProfile = (artistId) => api.get(`/artists/${artistId}`);
export const getArtists = (params) => api.get('/artists', { params });
export const updateArtistProfile = (data) => api.post('/artists/profile', data);

// --- Portfolio Management ---
export const getPortfolio = (artistId, params) => api.get(`/portfolio/${artistId}`, { params });
export const addPortfolioItem = (formData) => api.post('/portfolio', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updatePortfolioItem = (id, formData) => api.patch(`/portfolio/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deletePortfolioItem = (id) => api.delete(`/portfolio/${id}`);
export const toggleArtworkLike = (id) => api.post(`/portfolio/${id}/like`);
export const toggleArtworkAvailability = (id) => api.patch(`/portfolio/${id}/availability`);

// --- Commission Workflow ---
export const getOrders = (params) => api.get('/orders', { params });
export const createOrder = (data) => api.post('/orders', data);
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const updateOrderStatus = (id, status, extras = {}) => api.patch(`/orders/${id}/status`, { status, ...extras });
export const setOrderPrice = (id, price) => api.patch(`/orders/${id}/price`, { price });
export const getArtistOrders = (params) => getOrders(params);
export const getClientOrders = (params) => getOrders(params);

// --- Real-time Communication ---
export const getOrderMessages = (orderId) => api.get(`/orders/${orderId}/messages`);
export const sendMessage = (orderId, data) => {
  if (data instanceof FormData) {
    return api.post(`/orders/${orderId}/messages`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
  }
  return api.post(`/orders/${orderId}/messages`, data);
};

// --- Reputation Management ---
export const submitReview = (data) => api.post('/reviews', data);
export const getArtistReviews = (artistId) => api.get(`/reviews/artist/${artistId}`);

// --- Notifications ---
export const getNotifications = () => api.get('/notifications');
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.patch('/notifications/mark-all');

// --- Community Posts ---
export const getPosts = () => api.get('/posts');
export const createPost = (formData) => api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const toggleLike = (postId) => api.post(`/posts/${postId}/like`);
export const addComment = (postId, data) => api.post(`/posts/${postId}/comment`, data);

// --- Categories ---
export const getCategories = () => api.get('/categories');

// --- Feedback ---
export const submitFeedback = (data) => api.post('/feedback', data);
export const getFeedback = (portfolioId) => api.get(`/feedback/${portfolioId}`);

// --- Admin (legacy aliases kept for backward compatibility) ---
export const getSystemStats = getAdminStats;
export const getAllUsers = getAdminUsers;
export const updateUserRole = changeUserRole;

/**
 * @export api
 * @description Default export of the core Axios instance for custom requests.
 */
export default api;