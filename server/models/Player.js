const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  playerNumber: {
    type: Number,
    required: [true, 'Player number is required'],
    unique: true,
  },
  name: {
    type: String,
    required: [true, 'Player name is required'],
    trim: true,
  },
  photo: {
    type: String,
    default: '',
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    enum: ['GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'STRIKER', 'WINGER', 'FORWARD'],
  },
  division: {
    type: String,
    required: [true, 'Division is required'],
    trim: true,
  },
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Base price must be positive'],
  },
  matches: { type: Number, default: 0 },
  goals: { type: Number, default: 0 },
  assists: { type: Number, default: 0 },
  rating: { type: Number, default: 0, min: 0, max: 10 },
  auctionOrder: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['UPCOMING', 'LIVE', 'SOLD', 'UNSOLD'],
    default: 'UPCOMING',
  },
}, {
  timestamps: true,
});

playerSchema.index({ auctionOrder: 1 });
playerSchema.index({ status: 1 });
playerSchema.index({ playerNumber: 1 });

module.exports = mongoose.model('Player', playerSchema);
