// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    SIGNUP: `${API_BASE_URL}/api/auth/signup`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    GOOGLE: `${API_BASE_URL}/api/auth/google`,
    ADMIN_LOGIN: `${API_BASE_URL}/api/auth/admin/login`,
  },
  
  // Issues endpoints
  ISSUES: {
    LIST: `${API_BASE_URL}/api/issues`,
    CREATE: `${API_BASE_URL}/api/issues`,
    DETAIL: (id) => `${API_BASE_URL}/api/issues/${id}`,
    UPVOTE: (id) => `${API_BASE_URL}/api/issues/${id}/upvote`,
    REMOVE_UPVOTE: (id) => `${API_BASE_URL}/api/issues/${id}/remove-upvote`,
    PINCODES: `${API_BASE_URL}/api/issues/pincodes`,
  },
  
  // Images endpoints
  IMAGES: {
    UPLOAD: `${API_BASE_URL}/api/images/upload`,
    DELETE: (key) => `${API_BASE_URL}/api/images/${key}`,
  },
  
  // Admin endpoints
  ADMIN: {
    DASHBOARD: `${API_BASE_URL}/api/admin/dashboard`,
    USERS: `${API_BASE_URL}/api/admin/users`,
    ISSUES: `${API_BASE_URL}/api/admin/issues`,
  }
};

export default API_BASE_URL;
