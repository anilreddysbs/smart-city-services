import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.PROD ? '/api' : 'http://localhost:5000/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = String(error?.response?.data?.message || error?.response?.data?.error || '').toLowerCase();
    const isAuthLikeError =
      status === 401 ||
      (status === 404 && (message.includes('user not found') || message.includes('worker not found'))) ||
      (status === 403 && message.includes('forbidden'));

    if (isAuthLikeError) {
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
