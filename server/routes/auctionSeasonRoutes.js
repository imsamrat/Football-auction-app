const express = require('express');
const router = express.Router();
const {
  getSeasons, getActiveSeason, createSeason,
  updateSeason, deleteSeason, activateSeason,
} = require('../controllers/auctionSeasonController');
const { adminAuth } = require('../middleware/auth');

router.get('/', getSeasons);
router.get('/active', getActiveSeason);
router.post('/', adminAuth, createSeason);
router.put('/:id', adminAuth, updateSeason);
router.delete('/:id', adminAuth, deleteSeason);
router.put('/:id/activate', adminAuth, activateSeason);

module.exports = router;
