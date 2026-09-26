const mongoose = require('mongoose');

const matchEventSchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true,
    index: true,
  },
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true,
    index: true,
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bidder',
    required: true,
  },
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true,
  },
  playerName: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['GOAL', 'ASSIST', 'YELLOW_CARD', 'RED_CARD', 'SUBSTITUTION'],
    required: true,
  },
  minute: {
    type: Number,
    required: true,
    min: 0,
  },
  // For assists linked to a goal
  assistPlayerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    default: null,
  },
  assistPlayerName: {
    type: String,
    default: '',
  },
  // For substitutions
  replacedPlayerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    default: null,
  },
  replacedPlayerName: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

matchEventSchema.index({ matchId: 1, minute: 1 });
matchEventSchema.index({ playerId: 1 });
matchEventSchema.index({ type: 1 });
matchEventSchema.index({ tournamentId: 1, type: 1 });

module.exports = mongoose.model('MatchEvent', matchEventSchema);
