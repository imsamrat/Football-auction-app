const express = require('express');
const router = express.Router();
const { getCurrentAuction, getResults, getResult, getStats, getPlayerBids } = require('../controllers/auctionController');

router.get('/current', getCurrentAuction);
router.get('/results', getResults);
router.get('/results/:id', getResult);
router.get('/stats', getStats);
router.get('/player/:playerId/bids', getPlayerBids);

module.exports = router;
