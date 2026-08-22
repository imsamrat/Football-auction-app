const express = require('express');
const router = express.Router();
const {
  getBidders, getBidder, createBidder, updateBidder,
  deleteBidder, getBidderDashboard,
} = require('../controllers/bidderController');
const { adminAuth, bidderAuth, auth } = require('../middleware/auth');

// Public (for auction display)
router.get('/', getBidders);

// Bidder dashboard (must be logged in as bidder)
router.get('/dashboard', bidderAuth, getBidderDashboard);

// Admin routes
router.get('/:id', auth, getBidder);
router.post('/', adminAuth, createBidder);
router.put('/:id', adminAuth, updateBidder);
router.delete('/:id', adminAuth, deleteBidder);

module.exports = router;
