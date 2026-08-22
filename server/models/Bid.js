const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true,
  },
  auctionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    required: true,
  },
  bidderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bidder',
    required: true,
  },
  bidderName: {
    type: String,
    required: true,
  },
  bidderTeam: {
    type: String,
    default: '',
  },
  amount: {
    type: Number,
    required: [true, 'Bid amount is required'],
    min: [0, 'Bid amount must be positive'],
  },
}, {
  timestamps: true,
});

bidSchema.index({ playerId: 1, createdAt: -1 });
bidSchema.index({ auctionId: 1 });
bidSchema.index({ bidderId: 1 });

module.exports = mongoose.model('Bid', bidSchema);
