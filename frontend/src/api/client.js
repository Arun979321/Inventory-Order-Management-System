import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://inventory-order-management-system-wxl9.onrender.com/';

const client = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export default client;
