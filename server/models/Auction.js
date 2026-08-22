const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true,
  },
  startTime: { type: Date },
  endTime: { type: Date },
  pausedAt: { type: Date },
  remainingTimeWhenPaused: { type: Number },
  currentBid: { type: Number, default: 0 },
  highestBidderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bidder',
    default: null,
  },
  highestBidderName: { type: String, default: '' },
  highestBidderTeam: { type: String, default: '' },
  totalBids: { type: Number, default: 0 },
  basePrice: { type: Number, required: true },
  bidIncrement: { type: Number, default: 500 },
  stage: {
    type: String,
    enum: ['WAITING', 'GOING_ONCE', 'GOING_TWICE', 'FINAL_CALL', 'SOLD', 'UNSOLD', 'PAUSED'],
    default: 'WAITING',
  },
  status: {
    type: String,
    enum: ['UPCOMING', 'LIVE', 'PAUSED', 'COMPLETED'],
    default: 'UPCOMING',
  },
  finalPrice: { type: Number, default: 0 },
  completedAt: { type: Date },
}, {
  timestamps: true,
});

auctionSchema.index({ playerId: 1 });
auctionSchema.index({ status: 1 });

module.exports = mongoose.model('Auction', auctionSchema);
