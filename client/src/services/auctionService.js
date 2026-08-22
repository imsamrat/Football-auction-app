import api from './api';

export const getCurrentAuction = () => api.get('/auction/current');
export const getResults = () => api.get('/auction/results');
export const getResult = (id) => api.get(`/auction/results/${id}`);
export const getStats = () => api.get('/auction/stats');
export const getPlayerBids = (playerId) => api.get(`/auction/player/${playerId}/bids`);
