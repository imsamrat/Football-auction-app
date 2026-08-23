const mongoose = require('mongoose');

const auctionSeasonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Season name is required'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'INACTIVE',
  },
}, {
  timestamps: true,
});

auctionSeasonSchema.index({ status: 1 });

module.exports = mongoose.model('AuctionSeason', auctionSeasonSchema);
