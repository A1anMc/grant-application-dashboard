// API configuration for SGE Grant Portal
// Use relative URLs to work with Vite proxy
const API_BASE = '/api';

export const apiConfig = {
  baseURL: API_BASE,
  endpoints: {
    grants: `${API_BASE}/grants`,
    grantDetails: (id) => `${API_BASE}/grants/${id}`,
    health: '/health',
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