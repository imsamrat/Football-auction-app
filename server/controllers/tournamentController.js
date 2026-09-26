const Tournament = require('../models/Tournament');
const Match = require('../models/Match');
const MatchEvent = require('../models/MatchEvent');
const Bidder = require('../models/Bidder');

// Get all tournaments
exports.getTournaments = async (req, res, next) => {
  try {
    const tournaments = await Tournament.find()
      .populate('teams', 'name team bidderNumber playersPurchased')
      .sort({ createdAt: -1 });
    res.json(tournaments);
  } catch (error) {
    next(error);
  }
};

// Get single tournament
exports.getTournament = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('teams', 'name team bidderNumber playersPurchased');
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
    res.json(tournament);
  } catch (error) {
    next(error);
  }
};

// Create tournament
exports.createTournament = async (req, res, next) => {
  try {
    const { name, season, logo, startDate, endDate, format, teams, pointsForWin, pointsForDraw, pointsForLoss, roundRobinType, auctionSeasonId } = req.body;

    const tournament = await Tournament.create({
      name,
      season: season || '',
      logo: logo || '',
      startDate: startDate || null,
      endDate: endDate || null,
      format: format || 'LEAGUE',
      teams: teams || [],
      pointsForWin: pointsForWin ?? 3,
      pointsForDraw: pointsForDraw ?? 1,
      pointsForLoss: pointsForLoss ?? 0,
      roundRobinType: roundRobinType || 'SINGLE',
      auctionSeasonId: auctionSeasonId || null,
    });

    const populated = await Tournament.findById(tournament._id)
      .populate('teams', 'name team bidderNumber playersPurchased');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// Update tournament
exports.updateTournament = async (req, res, next) => {
  try {
    const tournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('teams', 'name team bidderNumber playersPurchased');

    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
    res.json(tournament);
  } catch (error) {
    next(error);
  }
};

// Delete tournament
exports.deleteTournament = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

    // Also remove related matches and events
    const matches = await Match.find({ tournamentId: tournament._id });
    const matchIds = matches.map(m => m._id);
    await MatchEvent.deleteMany({ matchId: { $in: matchIds } });
    await Match.deleteMany({ tournamentId: tournament._id });
    await tournament.deleteOne();

    res.json({ message: 'Tournament deleted' });
  } catch (error) {
    next(error);
  }
};

// Get teams available for tournament (all bidders with team names)
exports.getAvailableTeams = async (req, res, next) => {
  try {
    const bidders = await Bidder.find({ status: 'ACTIVE' })
      .select('name team bidderNumber playersPurchased budget remainingBudget')
      .sort({ bidderNumber: 1 });
    res.json(bidders);
  } catch (error) {
    next(error);
  }
};

// Get team squad (players purchased by a bidder)
exports.getTeamSquad = async (req, res, next) => {
  try {
    const bidder = await Bidder.findById(req.params.teamId)
      .populate('playersPurchased.playerId');
    if (!bidder) return res.status(404).json({ message: 'Team not found' });
    res.json({
      team: bidder.team,
      bidderName: bidder.name,
      squad: bidder.playersPurchased,
    });
  } catch (error) {
    next(error);
  }
};

// Generate fixtures for a tournament
exports.generateFixtures = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

    const { defaultVenue, startDate, matchesPerDay, kickoffTimes } = req.body;

    const teamIds = tournament.teams;
    if (teamIds.length < 2) {
      return res.status(400).json({ message: 'Need at least 2 teams to generate fixtures' });
    }

    // Check for existing fixtures
    const existingCount = await Match.countDocuments({ tournamentId: tournament._id });
    if (existingCount > 0) {
      return res.status(400).json({ message: 'Fixtures already exist. Delete existing fixtures first.' });
    }

    // Round-robin fixture generation
    const teams = [...teamIds];
    const isOdd = teams.length % 2 !== 0;
    if (isOdd) {
      teams.push(null); // bye
    }

    const n = teams.length;
    const rounds = n - 1;
    const matchesPerRound = n / 2;
    const fixtures = [];
    let matchNumber = 1;

    // Standard round-robin algorithm
    const fixed = teams[0];
    const rotating = teams.slice(1);

    for (let round = 0; round < rounds; round++) {
      const roundTeams = [fixed, ...rotating];
      for (let i = 0; i < matchesPerRound; i++) {
        const home = roundTeams[i];
        const away = roundTeams[n - 1 - i];
        if (home && away) {
          fixtures.push({
            tournamentId: tournament._id,
            homeTeamId: home,
            awayTeamId: away,
            round: round + 1,
            matchNumber: matchNumber++,
            venue: defaultVenue || '',
          });
        }
      }
      // Rotate
      rotating.push(rotating.shift());
    }

    // Double round-robin: add reverse fixtures
    if (tournament.roundRobinType === 'DOUBLE') {
      const reverseStart = matchNumber;
      for (let i = 0; i < fixtures.length; i++) {
        const f = fixtures[i];
        fixtures.push({
          tournamentId: tournament._id,
          homeTeamId: f.awayTeamId,
          awayTeamId: f.homeTeamId,
          round: f.round + rounds,
          matchNumber: matchNumber++,
          venue: defaultVenue || '',
        });
      }
    }

    // Assign dates if provided
    if (startDate && matchesPerDay) {
      const times = kickoffTimes || ['16:00', '18:00'];
      let dateObj = new Date(startDate);
      let dayMatchCount = 0;

      for (let i = 0; i < fixtures.length; i++) {
        fixtures[i].matchDate = new Date(dateObj);
        fixtures[i].kickoffTime = times[dayMatchCount % times.length] || '16:00';
        dayMatchCount++;
        if (dayMatchCount >= matchesPerDay) {
          dayMatchCount = 0;
          dateObj.setDate(dateObj.getDate() + 1);
        }
      }
    }

    const created = await Match.insertMany(fixtures);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

// Get fixtures for a tournament
exports.getFixtures = async (req, res, next) => {
  try {
    const matches = await Match.find({ tournamentId: req.params.id })
      .populate('homeTeamId', 'name team bidderNumber')
      .populate('awayTeamId', 'name team bidderNumber')
      .sort({ round: 1, matchNumber: 1 });
    res.json(matches);
  } catch (error) {
    next(error);
  }
};

// Delete all fixtures for a tournament
exports.deleteFixtures = async (req, res, next) => {
  try {
    const matches = await Match.find({ tournamentId: req.params.id });
    const matchIds = matches.map(m => m._id);
    await MatchEvent.deleteMany({ matchId: { $in: matchIds } });
    await Match.deleteMany({ tournamentId: req.params.id });
    res.json({ message: 'All fixtures deleted' });
  } catch (error) {
    next(error);
  }
};

// Get standings (point table) for a tournament - computed from match results
exports.getStandings = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

    const completedMatches = await Match.find({
      tournamentId: tournament._id,
      status: 'COMPLETED',
    }).populate('homeTeamId', 'name team').populate('awayTeamId', 'name team');

    // Build standings map
    const standingsMap = {};

    // Initialize for all teams in tournament
    for (const teamId of tournament.teams) {
      standingsMap[teamId.toString()] = {
        teamId,
        played: 0, wins: 0, draws: 0, losses: 0,
        goalsFor: 0, goalsAgainst: 0, goalDifference: 0,
        points: 0, cleanSheets: 0, form: [],
      };
    }

    // Populate from completed matches
    for (const match of completedMatches) {
      const homeId = match.homeTeamId._id.toString();
      const awayId = match.awayTeamId._id.toString();

      if (!standingsMap[homeId]) continue;
      if (!standingsMap[awayId]) continue;

      const h = standingsMap[homeId];
      const a = standingsMap[awayId];

      h.played++;
      a.played++;
      h.goalsFor += match.homeScore;
      h.goalsAgainst += match.awayScore;
      a.goalsFor += match.awayScore;
      a.goalsAgainst += match.homeScore;

      if (match.awayScore === 0) h.cleanSheets++;
      if (match.homeScore === 0) a.cleanSheets++;

      if (match.homeScore > match.awayScore) {
        h.wins++;
        h.points += tournament.pointsForWin;
        h.form.push('W');
        a.losses++;
        a.points += tournament.pointsForLoss;
        a.form.push('L');
      } else if (match.homeScore < match.awayScore) {
        a.wins++;
        a.points += tournament.pointsForWin;
        a.form.push('W');
        h.losses++;
        h.points += tournament.pointsForLoss;
        h.form.push('L');
      } else {
        h.draws++;
        a.draws++;
        h.points += tournament.pointsForDraw;
        a.points += tournament.pointsForDraw;
        h.form.push('D');
        a.form.push('D');
      }
    }

    // Calculate GD and prepare array
    const standings = Object.values(standingsMap).map(s => ({
      ...s,
      goalDifference: s.goalsFor - s.goalsAgainst,
      form: s.form.slice(-5), // Last 5 matches
    }));

    // Sort: Points DESC, GD DESC, GF DESC
    standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });

    // Populate team names
    const teamIds = standings.map(s => s.teamId);
    const bidders = await Bidder.find({ _id: { $in: teamIds } }).select('name team');
    const bidderMap = {};
    for (const b of bidders) {
      bidderMap[b._id.toString()] = b;
    }

    const result = standings.map((s, i) => ({
      position: i + 1,
      teamId: s.teamId,
      teamName: bidderMap[s.teamId.toString()]?.team || 'Unknown',
      bidderName: bidderMap[s.teamId.toString()]?.name || 'Unknown',
      ...s,
    }));

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get top scorers for a tournament
exports.getTopScorers = async (req, res, next) => {
  try {
    const goals = await MatchEvent.aggregate([
      { $match: { tournamentId: new (require('mongoose').Types.ObjectId)(req.params.id), type: 'GOAL' } },
      {
        $group: {
          _id: '$playerId',
          playerName: { $first: '$playerName' },
          teamId: { $first: '$teamId' },
          goals: { $sum: 1 },
          matches: { $addToSet: '$matchId' },
        }
      },
      {
        $project: {
          playerId: '$_id',
          playerName: 1,
          teamId: 1,
          goals: 1,
          matches: { $size: '$matches' },
        }
      },
      { $sort: { goals: -1 } },
      { $limit: 20 },
    ]);

    // Populate team names
    const teamIds = [...new Set(goals.map(g => g.teamId.toString()))];
    const bidders = await Bidder.find({ _id: { $in: teamIds } }).select('name team');
    const bidderMap = {};
    for (const b of bidders) {
      bidderMap[b._id.toString()] = b;
    }

    const result = goals.map((g, i) => ({
      rank: i + 1,
      playerId: g.playerId,
      playerName: g.playerName,
      teamId: g.teamId,
      teamName: bidderMap[g.teamId.toString()]?.team || 'Unknown',
      goals: g.goals,
      matches: g.matches,
    }));

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get top assists for a tournament
exports.getTopAssists = async (req, res, next) => {
  try {
    const assists = await MatchEvent.aggregate([
      {
        $match: {
          tournamentId: new (require('mongoose').Types.ObjectId)(req.params.id),
          type: 'GOAL',
          assistPlayerId: { $ne: null },
        }
      },
      {
        $group: {
          _id: '$assistPlayerId',
          playerName: { $first: '$assistPlayerName' },
          teamId: { $first: '$teamId' },
          assists: { $sum: 1 },
          matches: { $addToSet: '$matchId' },
        }
      },
      {
        $project: {
          playerId: '$_id',
          playerName: 1,
          teamId: 1,
          assists: 1,
          matches: { $size: '$matches' },
        }
      },
      { $sort: { assists: -1 } },
      { $limit: 20 },
    ]);

    const teamIds = [...new Set(assists.map(a => a.teamId.toString()))];
    const bidders = await Bidder.find({ _id: { $in: teamIds } }).select('name team');
    const bidderMap = {};
    for (const b of bidders) {
      bidderMap[b._id.toString()] = b;
    }

    const result = assists.map((a, i) => ({
      rank: i + 1,
      playerId: a.playerId,
      playerName: a.playerName,
      teamId: a.teamId,
      teamName: bidderMap[a.teamId.toString()]?.team || 'Unknown',
      assists: a.assists,
      matches: a.matches,
    }));

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get player statistics for a tournament
exports.getPlayerStats = async (req, res, next) => {
  try {
    const tournamentId = new (require('mongoose').Types.ObjectId)(req.params.id);

    const stats = await MatchEvent.aggregate([
      { $match: { tournamentId } },
      {
        $group: {
          _id: { playerId: '$playerId', type: '$type' },
          playerName: { $first: '$playerName' },
          teamId: { $first: '$teamId' },
          count: { $sum: 1 },
          matches: { $addToSet: '$matchId' },
        }
      },
    ]);

    // Also count assists
    const assistStats = await MatchEvent.aggregate([
      { $match: { tournamentId, type: 'GOAL', assistPlayerId: { $ne: null } } },
      {
        $group: {
          _id: '$assistPlayerId',
          assists: { $sum: 1 },
          matches: { $addToSet: '$matchId' },
        }
      },
    ]);

    // Build player map
    const playerMap = {};
    for (const s of stats) {
      const pid = s._id.playerId.toString();
      if (!playerMap[pid]) {
        playerMap[pid] = {
          playerId: s._id.playerId,
          playerName: s.playerName,
          teamId: s.teamId,
          goals: 0, assists: 0, yellowCards: 0, redCards: 0,
          matchesPlayed: new Set(),
        };
      }
      switch (s._id.type) {
        case 'GOAL': playerMap[pid].goals = s.count; break;
        case 'YELLOW_CARD': playerMap[pid].yellowCards = s.count; break;
        case 'RED_CARD': playerMap[pid].redCards = s.count; break;
      }
      s.matches.forEach(m => playerMap[pid].matchesPlayed.add(m.toString()));
    }

    for (const a of assistStats) {
      const pid = a._id.toString();
      if (!playerMap[pid]) {
        playerMap[pid] = {
          playerId: a._id,
          playerName: '',
          teamId: null,
          goals: 0, assists: 0, yellowCards: 0, redCards: 0,
          matchesPlayed: new Set(),
        };
      }
      playerMap[pid].assists = a.assists;
      a.matches.forEach(m => playerMap[pid].matchesPlayed.add(m.toString()));
    }

    // Populate team names
    const allTeamIds = [...new Set(Object.values(playerMap).map(p => p.teamId?.toString()).filter(Boolean))];
    const bidders = await Bidder.find({ _id: { $in: allTeamIds } }).select('name team');
    const bidderMap = {};
    for (const b of bidders) {
      bidderMap[b._id.toString()] = b;
    }

    const result = Object.values(playerMap).map(p => ({
      ...p,
      teamName: bidderMap[p.teamId?.toString()]?.team || 'Unknown',
      matchesPlayed: p.matchesPlayed.size,
    }));

    result.sort((a, b) => b.goals - a.goals || b.assists - a.assists);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get tournament dashboard (overview data)
exports.getDashboard = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('teams', 'name team bidderNumber');
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

    // Live matches
    const liveMatches = await Match.find({
      tournamentId: tournament._id,
      status: { $in: ['LIVE', 'HALF_TIME'] },
    }).populate('homeTeamId', 'name team').populate('awayTeamId', 'name team');

    // Upcoming matches (next 5)
    const upcomingMatches = await Match.find({
      tournamentId: tournament._id,
      status: 'UPCOMING',
    })
      .populate('homeTeamId', 'name team')
      .populate('awayTeamId', 'name team')
      .sort({ matchDate: 1, matchNumber: 1 })
      .limit(5);

    // Recent results (last 5)
    const recentResults = await Match.find({
      tournamentId: tournament._id,
      status: 'COMPLETED',
    })
      .populate('homeTeamId', 'name team')
      .populate('awayTeamId', 'name team')
      .sort({ completedAt: -1 })
      .limit(5);

    // Match counts
    const totalMatches = await Match.countDocuments({ tournamentId: tournament._id });
    const completedMatches = await Match.countDocuments({ tournamentId: tournament._id, status: 'COMPLETED' });
    const totalGoals = await MatchEvent.countDocuments({ tournamentId: tournament._id, type: 'GOAL' });

    res.json({
      tournament,
      liveMatches,
      upcomingMatches,
      recentResults,
      stats: {
        totalMatches,
        completedMatches,
        totalGoals,
        teamsCount: tournament.teams.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
