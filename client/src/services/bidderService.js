import api from './api';

export const getBidders = () => api.get('/bidders');
export const getBidder = (id) => api.get(`/bidders/${id}`);
export const createBidder = (data) => api.post('/bidders', data);
export const updateBidder = (id, data) => api.put(`/bidders/${id}`, data);
export const deleteBidder = (id) => api.delete(`/bidders/${id}`);
export const getBidderDashboard = () => api.get('/bidders/dashboard');
