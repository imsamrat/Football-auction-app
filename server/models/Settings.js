const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  auctionDuration: {
    type: Number,
    default: 30,
    min: 10,
    max: 120,
  },
  bidIncrement: {
    type: Number,
    default: 500,
    min: 100,
  },
  bidExtensionEnabled: {
    type: Boolean,
    default: false,
  },
  bidExtensionTime: {
    type: Number,
    default: 5,
  },
  bidExtensionThreshold: {
    type: Number,
    default: 5,
  },
  autoAuction: {
    type: Boolean,
    default: false,
  },
  autoAuctionDelay: {
    type: Number,
    default: 5,
  },
  soundEnabled: {
    type: Boolean,
    default: true,
  },
  bidSound: {
    type: Boolean,
    default: true,
  },
  soldSound: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Settings', settingsSchema);
