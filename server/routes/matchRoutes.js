const express = require('express');
const router = express.Router();
const {
  getMatch, updateMatch, startMatch, halfTime, endMatch,
  updateMinute, addEvent, deleteEvent, getMatchEvents, getMatchPlayers,
  createMatch, deleteMatch,
} = require('../controllers/matchController');
const { adminAuth } = require('../middleware/auth');

// Public routes
router.get('/:id', getMatch);
router.get('/:id/events', getMatchEvents);
router.get('/:id/players', getMatchPlayers);

// Admin routes
router.post('/', adminAuth, createMatch);
router.put('/:id', adminAuth, updateMatch);
router.delete('/:id', adminAuth, deleteMatch);
router.post('/:id/start', adminAuth, startMatch);
router.post('/:id/half-time', adminAuth, halfTime);
router.post('/:id/end', adminAuth, endMatch);
router.put('/:id/minute', adminAuth, updateMinute);
router.post('/:id/events', adminAuth, addEvent);
router.delete('/:id/events/:eventId', adminAuth, deleteEvent);

module.exports = router;
