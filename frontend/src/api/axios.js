import axios from 'axios';

let rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Normalize URL: trim trailing slashes and ensure /api path suffix
rawBaseURL = rawBaseURL.replace(/\/+$/, '');
if (!rawBaseURL.endsWith('/api')) {
  rawBaseURL += '/api';
}

const API = axios.create({
  baseURL: rawBaseURL
});

API.interceptors.request.use((req) => {
  if (localStorage.getItem('user')) {
    req.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem('user')).token}`;
  }
  return req;
});

export default API;
