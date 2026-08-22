const jwt = require('jsonwebtoken');
const config = require('../config');

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  });
};

const bidderAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== 'bidder') {
      return res.status(403).json({ message: 'Bidder access required' });
    }
    next();
  });
};

module.exports = { auth, adminAuth, bidderAuth };
