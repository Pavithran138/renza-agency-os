import axios from 'axios';

const api = axios.create({
  // Pointing to your live Render backend
  baseURL: 'https://renza-agency.onrender.com/api', 
});

export default api;