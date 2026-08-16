import axios from 'axios';
import toast from 'react-hot-toast';

const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const CLEAN_BASE = RAW_API_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');
const API_URL = `${CLEAN_BASE}/api`;

axios.defaults.baseURL = CLEAN_BASE;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
  withCredentials: true
});

// Request interceptor - Add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      const message = error.response?.data?.message || 'Access denied: Insufficient permissions';
      toast.error(message);
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/dashboard';
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper methods
export const auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const users = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (data) => api.put('/users/profile', data),
  getSuggestions: () => api.get('/users/suggestions'),
};

export const students = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  getFilterOptions: () => api.get('/students/filter-options'),
};

export const friends = {
  sendRequest: (receiverId) => api.post(`/friends/request/${receiverId}`, { receiverId }),
  acceptRequest: (id) => api.post(`/friends/accept/${id}`, { requestId: id }),
  rejectRequest: (id) => api.post(`/friends/reject/${id}`, { requestId: id }),
  getRequests: (params) => api.get('/friends/requests', { params }),
  getFriends: () => api.get('/friends'),
  remove: (friendId) => api.delete(`/friends/${friendId}`),
  removeFriend: (friendId) => api.delete(`/friends/${friendId}`),
};

export const chat = {
  sendMessage: (data) => api.post('/chat/send', data),
  getMessages: (userId) => api.get(`/chat/messages/${userId}`),
  getChatUsers: () => api.get('/chat/users'),
  markAsRead: (userId) => api.put(`/chat/read/${userId}`),
};

export const posts = {
  create: (data) => api.post('/posts', data),
  getAll: (params) => api.get('/posts', { params }),
  like: (postId) => api.post(`/posts/${postId}/like`),
  comment: (postId, text) => api.post(`/posts/${postId}/comment`, { text }),
  delete: (postId) => api.delete(`/posts/${postId}`),
};

export const communities = {
  create: (data) => api.post('/communities', data),
  getAll: () => api.get('/communities'),
  getById: (id) => api.get(`/communities/${id}`),
  join: (id) => api.post(`/communities/${id}/join`),
  leave: (id) => api.post(`/communities/${id}/leave`),
};

export const events = {
  create: (data) => api.post('/events', data),
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  rsvp: (id) => api.post(`/events/${id}/rsvp`),
};

export const notifications = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export const upload = {
  image: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  images: (files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    return api.post('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  profile: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

export const admin = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserDetails: (id) => api.get(`/admin/users/${id}/details`),
  createUser: (data) => api.post('/admin/users', data),
  deleteUser: (id, data) => api.delete(`/admin/users/${id}`, { data }),
  resetPassword: (id, data) => api.patch(`/admin/users/${id}/password`, data),
  changeRole: (id, data) => api.patch(`/admin/users/${id}/role`, data),
  toggleVerification: (id) => api.patch(`/admin/users/${id}/verify`),
  toggleSuspend: (id) => api.patch(`/admin/users/${id}/suspend`),
  getAuditLogs: () => api.get('/admin/audit-logs'),
};

export default api;