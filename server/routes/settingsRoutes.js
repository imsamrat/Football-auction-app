const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { adminAuth } = require('../middleware/auth');

router.get('/', getSettings);
router.put('/', adminAuth, updateSettings);

module.exports = router;
