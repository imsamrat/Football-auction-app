import api from './api';

const seasonService = {
  getSeasons: async () => {
    const response = await api.get('/seasons');
    return response.data;
  },

  getActiveSeason: async () => {
    const response = await api.get('/seasons/active');
    return response.data;
  },

  createSeason: async (data) => {
    const response = await api.post('/seasons', data);
    return response.data;
  },

  updateSeason: async (id, data) => {
    const response = await api.put(`/seasons/${id}`, data);
    return response.data;
  },

  deleteSeason: async (id) => {
    const response = await api.delete(`/seasons/${id}`);
    return response.data;
  },

  activateSeason: async (id) => {
    const response = await api.put(`/seasons/${id}/activate`);
    return response.data;
  }
};

export default seasonService;
