// API configuration for Grant IQ Pro Edition
// Use environment variable for production or fallback to local development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_BASE = `${API_BASE_URL}/api`;

export const apiConfig = {
  baseURL: API_BASE,
  endpoints: {
    grants: `${API_BASE}/grants`,
    grantDetails: (id) => `${API_BASE}/grants/${id}`,
    health: `${API_BASE_URL}/health`,
  }
};

// Helper function for API calls with error handling
export const apiCall = async (url, options = {}) => {
  try {
    console.log('Making API call to:', url);
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API response:', data);
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Specific API functions
export const fetchGrants = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  
  const url = params.toString() 
    ? `${apiConfig.endpoints.grants}?${params.toString()}`
    : apiConfig.endpoints.grants;
    
  return apiCall(url);
};

export const fetchGrantDetails = async (id) => {
  return apiCall(apiConfig.endpoints.grantDetails(id));
};

export const fetchHealth = async () => {
  return apiCall(apiConfig.endpoints.health);
};

// Main API object for easy importing
export const api = {
  // Configuration
  config: apiConfig,
  
  // Helper functions
  call: apiCall,
  
  // Grant operations
  grants: {
    getAll: fetchGrants,
    getById: fetchGrantDetails,
  },
  
  // Authentication
  auth: {
    login: async (credentials) => {
      return apiCall(`${API_BASE}/auth/login`, {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    },
    demoLogin: async (role = 'admin') => {
      return apiCall(`${API_BASE}/auth/demo-login`, {
        method: 'POST',
        body: JSON.stringify({ role }),
      });
    },
    getMe: async (token) => {
      return apiCall(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    },
  },
  
  // Analytics
  analytics: {
    getDashboard: async () => {
      return apiCall(`${API_BASE}/analytics/dashboard`);
    },
    getStats: async () => {
      return apiCall(`${API_BASE}/analytics/stats`);
    },
  },
  
  // Tasks
  tasks: {
    getAll: async () => {
      return apiCall(`${API_BASE}/tasks`);
    },
    create: async (task) => {
      return apiCall(`${API_BASE}/tasks`, {
        method: 'POST',
        body: JSON.stringify(task),
      });
    },
    update: async (id, task) => {
      return apiCall(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(task),
      });
    },
    delete: async (id) => {
      return apiCall(`${API_BASE}/tasks/${id}`, {
        method: 'DELETE',
      });
    },
  },
  
  // PDF Processing
  pdf: {
    upload: async (file) => {
      const formData = new FormData();
      formData.append('pdf', file);
      
      return fetch(`${API_BASE}/pdf/upload`, {
        method: 'POST',
        body: formData,
      }).then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      });
    },
    health: async () => {
      return apiCall(`${API_BASE}/pdf/health`);
    },
  },
  
  // Documents
  documents: {
    getAll: async () => {
      return apiCall(`${API_BASE}/documents`);
    },
    upload: async (file, metadata = {}) => {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('metadata', JSON.stringify(metadata));
      
      return fetch(`${API_BASE}/documents/upload`, {
        method: 'POST',
        body: formData,
      }).then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      });
    },
  },
  
  // Notifications
  notifications: {
    getAll: async () => {
      return apiCall(`${API_BASE}/notifications`);
    },
    markAsRead: async (id) => {
      return apiCall(`${API_BASE}/notifications/${id}/read`, {
        method: 'POST',
      });
    },
  },
  
  // Health check
  health: fetchHealth,
}; 