const mongoose = require('mongoose');

const auctionResultSchema = new mongoose.Schema({
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true,
  },
  playerName: { type: String, required: true },
  playerNumber: { type: Number },
  position: { type: String },
  division: { type: String },
  bidderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bidder',
    default: null,
  },
  bidderName: { type: String, default: '' },
  bidderTeam: { type: String, default: '' },
  basePrice: { type: Number, required: true },
  finalPrice: { type: Number, default: 0 },
  totalBids: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['SOLD', 'UNSOLD'],
    required: true,
  },
  auctionStartTime: { type: Date },
  auctionEndTime: { type: Date },
}, {
  timestamps: true,
});

auctionResultSchema.index({ status: 1 });
auctionResultSchema.index({ playerId: 1 });

module.exports = mongoose.model('AuctionResult', auctionResultSchema);
