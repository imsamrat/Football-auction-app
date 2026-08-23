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
    default: 10000,
    min: 100,
  },
  // Tiered bid increments
  bidIncrementTier1: {
    type: Number,
    default: 10000,
  },
  bidIncrementTier2: {
    type: Number,
    default: 20000,
  },
  bidIncrementTier3: {
    type: Number,
    default: 30000,
  },
  bidIncrementTier1Threshold: {
    type: Number,
    default: 500000,
  },
  bidIncrementTier2Threshold: {
    type: Number,
    default: 1000000,
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
  // Break mode
  breakMode: {
    type: Boolean,
    default: false,
  },
  breakMessage: {
    type: String,
    default: '',
  },
  // Currency
  currencySymbol: {
    type: String,
    default: '$',
    trim: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Settings', settingsSchema);
