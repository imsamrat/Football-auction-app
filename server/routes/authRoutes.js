const express = require('express');
const router = express.Router();
const { adminLogin, bidderLogin, getMe } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/admin/login', adminLogin);
router.post('/bidder/login', bidderLogin);
router.get('/me', auth, getMe);

module.exports = router;
