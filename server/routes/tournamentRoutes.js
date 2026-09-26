const express = require('express');
const router = express.Router();
const {
  getTournaments, getTournament, createTournament, updateTournament,
  deleteTournament, getAvailableTeams, getTeamSquad, generateFixtures,
  getFixtures, deleteFixtures, getStandings, getTopScorers,
  getTopAssists, getPlayerStats, getDashboard,
} = require('../controllers/tournamentController');
const { adminAuth } = require('../middleware/auth');

// Public routes
router.get('/', getTournaments);
router.get('/available-teams', getAvailableTeams);
router.get('/:id', getTournament);
router.get('/:id/fixtures', getFixtures);
router.get('/:id/standings', getStandings);
router.get('/:id/scorers', getTopScorers);
router.get('/:id/assists', getTopAssists);
router.get('/:id/player-stats', getPlayerStats);
router.get('/:id/dashboard', getDashboard);
router.get('/teams/:teamId/squad', getTeamSquad);

// Admin routes
router.post('/', adminAuth, createTournament);
router.put('/:id', adminAuth, updateTournament);
router.delete('/:id', adminAuth, deleteTournament);
router.post('/:id/generate-fixtures', adminAuth, generateFixtures);
router.delete('/:id/fixtures', adminAuth, deleteFixtures);

module.exports = router;
