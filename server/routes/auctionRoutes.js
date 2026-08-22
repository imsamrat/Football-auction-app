const express = require('express');
const router = express.Router();
const { getCurrentAuction, getResults, getResult, getStats } = require('../controllers/auctionController');

router.get('/current', getCurrentAuction);
router.get('/results', getResults);
router.get('/results/:id', getResult);
router.get('/stats', getStats);

module.exports = router;
