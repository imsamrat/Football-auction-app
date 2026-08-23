const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const bidderSchema = new mongoose.Schema({
  auctionSeasonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuctionSeason',
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Bidder name is required'],
    trim: true,
  },
  bidderNumber: {
    type: Number,
    required: [true, 'Bidder number is required'],
  },
  team: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 4,
  },
  budget: {
    type: Number,
    required: [true, 'Budget is required'],
    min: [0, 'Budget must be positive'],
  },
  remainingBudget: {
    type: Number,
    required: true,
  },
  totalSpent: {
    type: Number,
    default: 0,
  },
  playersPurchased: [{
    playerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    playerName: String,
    price: Number,
    purchasedAt: { type: Date, default: Date.now },
  }],
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
  },
}, {
  timestamps: true,
});

bidderSchema.index({ bidderNumber: 1, auctionSeasonId: 1 }, { unique: true });
bidderSchema.index({ status: 1 });

bidderSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

bidderSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Don't return password in JSON
bidderSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Bidder', bidderSchema);
