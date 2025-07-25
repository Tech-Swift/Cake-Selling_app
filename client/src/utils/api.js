import axios from "axios";

const api = axios.create({
  baseURL: "https://cake-selling-app.onrender.com/api", // Updated to include /api prefix
  withCredentials: true, 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
