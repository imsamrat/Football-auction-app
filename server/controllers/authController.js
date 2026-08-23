const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Bidder = require('../models/Bidder');
const config = require('../config');
const { getSeasonFilter } = require('../utils/seasonHelper');

const generateToken = (payload) => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
};

// Admin login
exports.adminLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({ id: admin._id, role: 'admin', username: admin.username });
    res.json({
      token,
      user: { id: admin._id, username: admin.username, role: 'admin' },
    });
  } catch (error) {
    next(error);
  }
};

// Bidder login
exports.bidderLogin = async (req, res, next) => {
  try {
    const { bidderNumber, password } = req.body;
    if (!bidderNumber || !password) {
      return res.status(400).json({ message: 'Bidder number and password are required' });
    }

    const seasonFilter = await getSeasonFilter();
    const bidder = await Bidder.findOne({ ...seasonFilter, bidderNumber: Number(bidderNumber) });
    if (!bidder) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bidder.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (bidder.status !== 'ACTIVE') {
      return res.status(403).json({ message: 'Bidder account is inactive' });
    }

    const token = generateToken({
      id: bidder._id,
      role: 'bidder',
      bidderNumber: bidder.bidderNumber,
      name: bidder.name,
      team: bidder.team,
    });

    res.json({
      token,
      user: {
        id: bidder._id,
        name: bidder.name,
        bidderNumber: bidder.bidderNumber,
        team: bidder.team,
        role: 'bidder',
        budget: bidder.budget,
        remainingBudget: bidder.remainingBudget,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
exports.getMe = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      const admin = await Admin.findById(req.user.id);
      if (!admin) return res.status(404).json({ message: 'Admin not found' });
      return res.json({ user: { id: admin._id, username: admin.username, role: 'admin' } });
    }

    if (req.user.role === 'bidder') {
      const bidder = await Bidder.findById(req.user.id);
      if (!bidder) return res.status(404).json({ message: 'Bidder not found' });
      return res.json({
        user: {
          id: bidder._id,
          name: bidder.name,
          bidderNumber: bidder.bidderNumber,
          team: bidder.team,
          role: 'bidder',
          budget: bidder.budget,
          remainingBudget: bidder.remainingBudget,
          totalSpent: bidder.totalSpent,
          playersPurchased: bidder.playersPurchased,
        },
      });
    }

    res.status(400).json({ message: 'Unknown role' });
  } catch (error) {
    next(error);
  }
};
