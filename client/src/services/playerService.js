import api from './api';

export const getPlayers = (params) => api.get('/players', { params });
export const getPlayer = (id) => api.get(`/players/${id}`);
export const createPlayer = (data) => api.post('/players', data);
export const updatePlayer = (id, data) => api.put(`/players/${id}`, data);
export const deletePlayer = (id) => api.delete(`/players/${id}`);
export const reorderPlayers = (orders) => api.put('/players/reorder', { orders });
export const getPlayerQueue = () => api.get('/players/queue');
