import axios from "axios";

// Determine the correct API base URL based on environment
const getApiBaseURL = () => {
  // If we're in development (localhost)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return "http://localhost:5000/api";
  }
  
  // If we're in production (deployed), always use Render backend
  return "https://cake-selling-app.onrender.com/api";
};

const api = axios.create({
  baseURL: getApiBaseURL(),
  withCredentials: true,
});

// Enhanced logging for debugging
console.log('🌐 API Configuration:');
console.log('  - Current hostname:', window.location.hostname);
console.log('  - API Base URL:', getApiBaseURL());
console.log('  - Full URL example:', getApiBaseURL() + '/cakes');
console.log('  - Environment:', import.meta.env.MODE);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Log each request for debugging
  console.log('🚀 API Request:', {
    method: config.method?.toUpperCase(),
    url: config.url,
    fullURL: config.baseURL + config.url,
    headers: config.headers
  });
  
  return config;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('🚨 API Error:', {
      url: error.config?.url,
      fullURL: error.config?.baseURL + error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      response: error.response?.data
    });
    return Promise.reject(error);
  }
);

export default api;
