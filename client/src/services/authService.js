import api from './api';

export const adminLogin = (username, password) =>
  api.post('/auth/admin/login', { username, password });

export const bidderLogin = (bidderNumber, password) =>
  api.post('/auth/bidder/login', { bidderNumber, password });

export const getMe = () => api.get('/auth/me');
