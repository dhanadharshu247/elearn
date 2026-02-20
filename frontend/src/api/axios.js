import axios from 'axios';

// Create an Axios instance
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000', // Use explicit 127.0.0.1 for reliability in Windows environments
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log('Axios Interceptor Token:', token); // DEBUG
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle token expiration (optional but recommended)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Optionally redirect to login or dispatch a logout action
            // window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;
