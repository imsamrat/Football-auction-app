const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true,
    index: true,
  },
  homeTeamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bidder',
    required: true,
  },
  awayTeamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bidder',
    required: true,
  },
  matchDate: {
    type: Date,
    default: null,
  },
  kickoffTime: {
    type: String,
    default: '',
    trim: true,
  },
  venue: {
    type: String,
    default: '',
    trim: true,
  },
  round: {
    type: Number,
    default: 1,
  },
  matchNumber: {
    type: Number,
    default: 1,
  },
  status: {
    type: String,
    enum: ['UPCOMING', 'LIVE', 'HALF_TIME', 'COMPLETED', 'POSTPONED', 'CANCELLED'],
    default: 'UPCOMING',
  },
  homeScore: {
    type: Number,
    default: 0,
  },
  awayScore: {
    type: Number,
    default: 0,
  },
  // Match timer tracking
  matchMinute: {
    type: Number,
    default: 0,
  },
  halfStartedAt: {
    type: Date,
    default: null,
  },
  firstHalfEndMinute: {
    type: Number,
    default: 45,
  },
  startedAt: {
    type: Date,
    default: null,
  },
  completedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

matchSchema.index({ tournamentId: 1, round: 1 });
matchSchema.index({ status: 1 });
matchSchema.index({ matchDate: 1 });
matchSchema.index({ homeTeamId: 1 });
matchSchema.index({ awayTeamId: 1 });

module.exports = mongoose.model('Match', matchSchema);
