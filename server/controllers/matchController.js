const Match = require('../models/Match');
const MatchEvent = require('../models/MatchEvent');
const Bidder = require('../models/Bidder');
const Player = require('../models/Player');

// Get single match with events
exports.getMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('homeTeamId', 'name team bidderNumber playersPurchased')
      .populate('awayTeamId', 'name team bidderNumber playersPurchased')
      .populate('tournamentId', 'name season');

    if (!match) return res.status(404).json({ message: 'Match not found' });

    const events = await MatchEvent.find({ matchId: match._id })
      .sort({ minute: 1, createdAt: 1 });

    res.json({ match, events });
  } catch (error) {
    next(error);
  }
};

// Update match (edit fixture details)
exports.updateMatch = async (req, res, next) => {
  try {
    const match = await Match.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('homeTeamId', 'name team bidderNumber')
      .populate('awayTeamId', 'name team bidderNumber');

    if (!match) return res.status(404).json({ message: 'Match not found' });
    res.json(match);
  } catch (error) {
    next(error);
  }
};

// Start match
exports.startMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    if (match.status !== 'UPCOMING' && match.status !== 'HALF_TIME') {
      return res.status(400).json({ message: `Cannot start match in ${match.status} status` });
    }

    match.status = 'LIVE';
    match.halfStartedAt = new Date();
    if (!match.startedAt) {
      match.startedAt = new Date();
    }
    await match.save();

    const populated = await Match.findById(match._id)
      .populate('homeTeamId', 'name team')
      .populate('awayTeamId', 'name team');

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('match:started', { match: populated });
    }

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// Half time
exports.halfTime = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    if (match.status !== 'LIVE') {
      return res.status(400).json({ message: 'Match is not live' });
    }

    match.status = 'HALF_TIME';
    match.matchMinute = 45;
    await match.save();

    const populated = await Match.findById(match._id)
      .populate('homeTeamId', 'name team')
      .populate('awayTeamId', 'name team');

    const io = req.app.get('io');
    if (io) {
      io.emit('match:updated', { match: populated });
    }

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// End match
exports.endMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    if (match.status !== 'LIVE' && match.status !== 'HALF_TIME') {
      return res.status(400).json({ message: 'Match is not in progress' });
    }

    match.status = 'COMPLETED';
    match.completedAt = new Date();
    match.matchMinute = 90;
    await match.save();

    const populated = await Match.findById(match._id)
      .populate('homeTeamId', 'name team')
      .populate('awayTeamId', 'name team');

    const io = req.app.get('io');
    if (io) {
      io.emit('match:ended', { match: populated });
      io.emit('standings:updated', { tournamentId: match.tournamentId });
    }

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// Update match minute
exports.updateMinute = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    match.matchMinute = req.body.minute || 0;
    await match.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('match:updated', { match });
    }

    res.json(match);
  } catch (error) {
    next(error);
  }
};

// Add match event (goal, card, substitution)
exports.addEvent = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    if (match.status === 'COMPLETED' || match.status === 'CANCELLED') {
      return res.status(400).json({ message: 'Cannot add events to a completed or cancelled match' });
    }

    const { teamId, playerId, playerName, type, minute, assistPlayerId, assistPlayerName, replacedPlayerId, replacedPlayerName, isGuestPlayer } = req.body;

    // Validate team belongs to match
    const homeId = match.homeTeamId.toString();
    const awayId = match.awayTeamId.toString();
    if (teamId !== homeId && teamId !== awayId) {
      return res.status(400).json({ message: 'Team does not belong to this match' });
    }

    // Create event
    const event = await MatchEvent.create({
      matchId: match._id,
      tournamentId: match.tournamentId,
      teamId,
      playerId: playerId || null,
      playerName: playerName || '',
      isGuestPlayer: Boolean(isGuestPlayer || !playerId),
      type,
      minute: minute || match.matchMinute || 0,
      assistPlayerId: assistPlayerId || null,
      assistPlayerName: assistPlayerName || '',
      replacedPlayerId: replacedPlayerId || null,
      replacedPlayerName: replacedPlayerName || '',
    });

    // Update score for goals (GOAL, PENALTY_GOAL, OWN_GOAL)
    const isRegularGoal = type === 'GOAL' || type === 'PENALTY_GOAL';
    const isOwnGoal = type === 'OWN_GOAL';

    if (isRegularGoal) {
      if (teamId === homeId) {
        match.homeScore += 1;
      } else {
        match.awayScore += 1;
      }
      await match.save();
    } else if (isOwnGoal) {
      // In an own goal, the OPPONENT team receives the goal point
      if (teamId === homeId) {
        match.awayScore += 1;
      } else {
        match.homeScore += 1;
      }
      await match.save();
    }

    const populated = await Match.findById(match._id)
      .populate('homeTeamId', 'name team')
      .populate('awayTeamId', 'name team');

    const io = req.app.get('io');
    if (io) {
      io.emit('match:event', { match: populated, event });
      if (isRegularGoal || isOwnGoal) {
        io.emit('match:goal', { match: populated, event });
      }
    }

    res.status(201).json({ match: populated, event });
  } catch (error) {
    next(error);
  }
};

// Delete match event
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await MatchEvent.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const match = await Match.findById(event.matchId);

    // Revert score if it was a goal
    if (match) {
      const homeId = match.homeTeamId.toString();
      const isRegularGoal = event.type === 'GOAL' || event.type === 'PENALTY_GOAL';
      const isOwnGoal = event.type === 'OWN_GOAL';

      if (isRegularGoal) {
        if (event.teamId.toString() === homeId) {
          match.homeScore = Math.max(0, match.homeScore - 1);
        } else {
          match.awayScore = Math.max(0, match.awayScore - 1);
        }
        await match.save();
      } else if (isOwnGoal) {
        if (event.teamId.toString() === homeId) {
          match.awayScore = Math.max(0, match.awayScore - 1);
        } else {
          match.homeScore = Math.max(0, match.homeScore - 1);
        }
        await match.save();
      }
    }

    await event.deleteOne();

    const populated = match ? await Match.findById(match._id)
      .populate('homeTeamId', 'name team')
      .populate('awayTeamId', 'name team') : null;

    const io = req.app.get('io');
    if (io && populated) {
      io.emit('match:updated', { match: populated });
    }

    res.json({ message: 'Event deleted', match: populated });
  } catch (error) {
    next(error);
  }
};

// Get match events
exports.getMatchEvents = async (req, res, next) => {
  try {
    const events = await MatchEvent.find({ matchId: req.params.id })
      .sort({ minute: 1, createdAt: 1 });
    res.json(events);
  } catch (error) {
    next(error);
  }
};

// Get players for a team in a match context (from bidder's purchased players)
exports.getMatchPlayers = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    const homeTeam = await Bidder.findById(match.homeTeamId)
      .populate('playersPurchased.playerId');
    const awayTeam = await Bidder.findById(match.awayTeamId)
      .populate('playersPurchased.playerId');

    res.json({
      home: {
        teamId: homeTeam._id,
        teamName: homeTeam.team,
        players: homeTeam.playersPurchased.map(p => ({
          playerId: p.playerId?._id || p.playerId,
          playerName: p.playerName || p.playerId?.name || 'Unknown',
          position: p.playerId?.position || '',
        })),
      },
      away: {
        teamId: awayTeam._id,
        teamName: awayTeam.team,
        players: awayTeam.playersPurchased.map(p => ({
          playerId: p.playerId?._id || p.playerId,
          playerName: p.playerName || p.playerId?.name || 'Unknown',
          position: p.playerId?.position || '',
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create a single match manually
exports.createMatch = async (req, res, next) => {
  try {
    const { tournamentId, homeTeamId, awayTeamId, round, matchNumber, matchDate, kickoffTime, venue } = req.body;

    if (!tournamentId || !homeTeamId || !awayTeamId) {
      return res.status(400).json({ message: 'Tournament, Home Team, and Away Team are required' });
    }

    if (homeTeamId === awayTeamId) {
      return res.status(400).json({ message: 'Home team and Away team must be different' });
    }

    let num = matchNumber ? Number(matchNumber) : null;
    if (!num) {
      const lastMatch = await Match.findOne({ tournamentId }).sort({ matchNumber: -1 });
      num = lastMatch ? (lastMatch.matchNumber || 0) + 1 : 1;
    }

    const match = new Match({
      tournamentId,
      homeTeamId,
      awayTeamId,
      round: round ? Number(round) : 1,
      matchNumber: num,
      matchDate: matchDate ? new Date(matchDate) : null,
      kickoffTime: kickoffTime || '',
      venue: venue || '',
      status: 'UPCOMING',
    });

    await match.save();

    const populated = await Match.findById(match._id)
      .populate('homeTeamId', 'name team bidderNumber')
      .populate('awayTeamId', 'name team bidderNumber')
      .populate('tournamentId', 'name season');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// Delete a single match
exports.deleteMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });

    await MatchEvent.deleteMany({ matchId: match._id });
    await Match.findByIdAndDelete(match._id);

    res.json({ message: 'Match deleted successfully' });
  } catch (error) {
    next(error);
  }
};
