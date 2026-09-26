const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tournament name is required'],
    trim: true,
  },
  season: {
    type: String,
    trim: true,
    default: '',
  },
  logo: {
    type: String,
    default: '',
  },
  startDate: {
    type: Date,
    default: null,
  },
  endDate: {
    type: Date,
    default: null,
  },
  format: {
    type: String,
    enum: ['LEAGUE', 'KNOCKOUT', 'LEAGUE_AND_KNOCKOUT'],
    default: 'LEAGUE',
  },
  status: {
    type: String,
    enum: ['UPCOMING', 'ONGOING', 'COMPLETED'],
    default: 'UPCOMING',
  },
  // Teams = Bidder references from the auction system
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bidder',
  }],
  // Configurable point system
  pointsForWin: {
    type: Number,
    default: 3,
  },
  pointsForDraw: {
    type: Number,
    default: 1,
  },
  pointsForLoss: {
    type: Number,
    default: 0,
  },
  // Fixture generation config
  roundRobinType: {
    type: String,
    enum: ['SINGLE', 'DOUBLE'],
    default: 'SINGLE',
  },
  // Linked auction season (optional)
  auctionSeasonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuctionSeason',
    default: null,
  },
}, {
  timestamps: true,
});

tournamentSchema.index({ status: 1 });

module.exports = mongoose.model('Tournament', tournamentSchema);
