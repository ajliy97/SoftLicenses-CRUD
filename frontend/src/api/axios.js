import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1', // URL del backend
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Obtener el token del almacenamiento local
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;