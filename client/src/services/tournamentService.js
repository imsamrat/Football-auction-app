import api from './api';

const tournamentService = {
  // Tournaments
  getTournaments: async () => {
    const response = await api.get('/tournaments');
    return response.data;
  },

  getTournament: async (id) => {
    const response = await api.get(`/tournaments/${id}`);
    return response.data;
  },

  createTournament: async (data) => {
    const response = await api.post('/tournaments', data);
    return response.data;
  },

  updateTournament: async (id, data) => {
    const response = await api.put(`/tournaments/${id}`, data);
    return response.data;
  },

  deleteTournament: async (id) => {
    const response = await api.delete(`/tournaments/${id}`);
    return response.data;
  },

  // Teams
  getAvailableTeams: async () => {
    const response = await api.get('/tournaments/available-teams');
    return response.data;
  },

  getTeamSquad: async (teamId) => {
    const response = await api.get(`/tournaments/teams/${teamId}/squad`);
    return response.data;
  },

  // Fixtures
  getFixtures: async (tournamentId) => {
    const response = await api.get(`/tournaments/${tournamentId}/fixtures`);
    return response.data;
  },

  generateFixtures: async (tournamentId, data) => {
    const response = await api.post(`/tournaments/${tournamentId}/generate-fixtures`, data);
    return response.data;
  },

  deleteFixtures: async (tournamentId) => {
    const response = await api.delete(`/tournaments/${tournamentId}/fixtures`);
    return response.data;
  },

  // Standings & Analytics
  getStandings: async (tournamentId) => {
    const response = await api.get(`/tournaments/${tournamentId}/standings`);
    return response.data;
  },

  getTeamsDirectory: async (tournamentId) => {
    const response = await api.get(`/tournaments/${tournamentId}/teams-directory`);
    return response.data;
  },

  getTournamentAnalytics: async (tournamentId) => {
    const response = await api.get(`/tournaments/${tournamentId}/analytics`);
    return response.data;
  },

  // Stats
  getTopScorers: async (tournamentId) => {
    const response = await api.get(`/tournaments/${tournamentId}/scorers`);
    return response.data;
  },

  getTopAssists: async (tournamentId) => {
    const response = await api.get(`/tournaments/${tournamentId}/assists`);
    return response.data;
  },

  getPlayerStats: async (tournamentId) => {
    const response = await api.get(`/tournaments/${tournamentId}/player-stats`);
    return response.data;
  },

  getDashboard: async (tournamentId) => {
    const response = await api.get(`/tournaments/${tournamentId}/dashboard`);
    return response.data;
  },

  // Matches
  createMatch: async (data) => {
    const response = await api.post('/matches', data);
    return response.data;
  },

  deleteMatch: async (matchId) => {
    const response = await api.delete(`/matches/${matchId}`);
    return response.data;
  },

  getMatch: async (matchId) => {
    const response = await api.get(`/matches/${matchId}`);
    return response.data;
  },

  updateMatch: async (matchId, data) => {
    const response = await api.put(`/matches/${matchId}`, data);
    return response.data;
  },

  startMatch: async (matchId) => {
    const response = await api.post(`/matches/${matchId}/start`);
    return response.data;
  },

  halfTime: async (matchId) => {
    const response = await api.post(`/matches/${matchId}/half-time`);
    return response.data;
  },

  endMatch: async (matchId) => {
    const response = await api.post(`/matches/${matchId}/end`);
    return response.data;
  },

  updateMinute: async (matchId, minute) => {
    const response = await api.put(`/matches/${matchId}/minute`, { minute });
    return response.data;
  },

  addMatchEvent: async (matchId, data) => {
    const response = await api.post(`/matches/${matchId}/events`, data);
    return response.data;
  },

  deleteMatchEvent: async (matchId, eventId) => {
    const response = await api.delete(`/matches/${matchId}/events/${eventId}`);
    return response.data;
  },

  getMatchEvents: async (matchId) => {
    const response = await api.get(`/matches/${matchId}/events`);
    return response.data;
  },

  getMatchPlayers: async (matchId) => {
    const response = await api.get(`/matches/${matchId}/players`);
    return response.data;
  },
};

export default tournamentService;
