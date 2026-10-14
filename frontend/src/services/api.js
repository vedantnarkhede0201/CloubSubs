import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5055/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 10000
});

export function getApiErrorMessage(error) {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.request) {
    return 'The backend could not be reached. Check that the API server is running.';
  }
  return error.message || 'An unexpected error occurred.';
}

export default api;
