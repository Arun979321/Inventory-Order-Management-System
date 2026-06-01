import client from './client';

export const productsAPI = {
  getAll: () => client.get('/api/products'),
  get: (id) => client.get(`/api/products/${id}`),
  create: (data) => client.post('/api/products', data),
  update: (id, data) => client.put(`/api/products/${id}`, data),
  delete: (id) => client.delete(`/api/products/${id}`),
};

export const customersAPI = {
  getAll: () => client.get('/api/customers'),
  get: (id) => client.get(`/api/customers/${id}`),
  create: (data) => client.post('/api/customers', data),
  update: (id, data) => client.put(`/api/customers/${id}`, data),
  delete: (id) => client.delete(`/api/customers/${id}`),
};

export const ordersAPI = {
  getAll: () => client.get('/api/orders'),
  get: (id) => client.get(`/api/orders/${id}`),
  create: (data) => client.post('/api/orders', data),
  updateStatus: (id, data) => client.put(`/api/orders/${id}/status`, data),
  delete: (id) => client.delete(`/api/orders/${id}`),
};

export const inventoryAPI = {
  getAll: () => client.get('/api/inventory'),
  update: (id, data) => client.put(`/api/inventory/${id}`, data),
};
