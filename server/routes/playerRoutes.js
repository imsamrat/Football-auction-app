const express = require('express');
const router = express.Router();
const {
  getPlayers, getPlayer, createPlayer, updatePlayer,
  deletePlayer, reorderPlayers, getPlayerQueue, revertPlayerStatus,
} = require('../controllers/playerController');
const { adminAuth } = require('../middleware/auth');

// Public routes
router.get('/', getPlayers);
router.get('/queue', getPlayerQueue);
router.get('/:id', getPlayer);

// Admin routes
router.post('/', adminAuth, createPlayer);
router.put('/reorder', adminAuth, reorderPlayers);
router.put('/:id/revert', adminAuth, revertPlayerStatus);
router.put('/:id', adminAuth, updatePlayer);
router.delete('/:id', adminAuth, deletePlayer);

module.exports = router;
