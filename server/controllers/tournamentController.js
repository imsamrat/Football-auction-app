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
      { $match: { tournamentId: new (require('mongoose').Types.ObjectId)(req.params.id), type: { $in: ['GOAL', 'PENALTY_GOAL'] } } },
      {
        $group: {
          _id: { $ifNull: ['$playerId', '$playerName'] },
          playerId: { $first: '$playerId' },
          playerName: { $first: '$playerName' },
          teamId: { $first: '$teamId' },
          goals: { $sum: 1 },
          matches: { $addToSet: '$matchId' },
        }
      },
      {
        $project: {
          playerId: 1,
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
          type: { $in: ['GOAL', 'PENALTY_GOAL'] },
          assistPlayerName: { $exists: true, $ne: '' },
        }
      },
      {
        $group: {
          _id: { $ifNull: ['$assistPlayerId', '$assistPlayerName'] },
          playerId: { $first: '$assistPlayerId' },
          playerName: { $first: '$assistPlayerName' },
          teamId: { $first: '$teamId' },
          assists: { $sum: 1 },
          matches: { $addToSet: '$matchId' },
        }
      },
      {
        $project: {
          playerId: 1,
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
    const totalGoals = await MatchEvent.countDocuments({ tournamentId: tournament._id, type: { $in: ['GOAL', 'PENALTY_GOAL', 'OWN_GOAL'] } });

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

// Get tournament teams directory with squads and tournament standings
exports.getTournamentTeamsDirectory = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate({
        path: 'teams',
        select: 'name team bidderNumber budget remainingBudget totalSpent playersPurchased',
        populate: {
          path: 'playersPurchased.playerId',
          select: 'name photo position division basePrice rating playerNumber matches goals assists',
        },
      });
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

    // Calculate standings for performance context
    const matches = await Match.find({
      tournamentId: tournament._id,
      status: 'COMPLETED',
    });

    const statsMap = {};
    for (const team of tournament.teams) {
      statsMap[team._id.toString()] = {
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        cleanSheets: 0,
        points: 0,
        form: [],
      };
    }

    for (const m of matches) {
      const hId = m.homeTeamId.toString();
      const aId = m.awayTeamId.toString();

      if (statsMap[hId]) {
        statsMap[hId].played++;
        statsMap[hId].goalsFor += m.homeScore;
        statsMap[hId].goalsAgainst += m.awayScore;
        if (m.awayScore === 0) statsMap[hId].cleanSheets++;
        if (m.homeScore > m.awayScore) {
          statsMap[hId].wins++;
          statsMap[hId].points += tournament.pointsForWin;
          statsMap[hId].form.push('W');
        } else if (m.homeScore < m.awayScore) {
          statsMap[hId].losses++;
          statsMap[hId].points += tournament.pointsForLoss;
          statsMap[hId].form.push('L');
        } else {
          statsMap[hId].draws++;
          statsMap[hId].points += tournament.pointsForDraw;
          statsMap[hId].form.push('D');
        }
      }

      if (statsMap[aId]) {
        statsMap[aId].played++;
        statsMap[aId].goalsFor += m.awayScore;
        statsMap[aId].goalsAgainst += m.homeScore;
        if (m.homeScore === 0) statsMap[aId].cleanSheets++;
        if (m.awayScore > m.homeScore) {
          statsMap[aId].wins++;
          statsMap[aId].points += tournament.pointsForWin;
          statsMap[aId].form.push('W');
        } else if (m.awayScore < m.homeScore) {
          statsMap[aId].losses++;
          statsMap[aId].points += tournament.pointsForLoss;
          statsMap[aId].form.push('L');
        } else {
          statsMap[aId].draws++;
          statsMap[aId].points += tournament.pointsForDraw;
          statsMap[aId].form.push('D');
        }
      }
    }

    // Sort to determine positions
    const sortedTeamIds = Object.keys(statsMap).sort((a, b) => {
      const sA = statsMap[a];
      const sB = statsMap[b];
      if (sB.points !== sA.points) return sB.points - sA.points;
      const gdA = sA.goalsFor - sA.goalsAgainst;
      const gdB = sB.goalsFor - sB.goalsAgainst;
      if (gdB !== gdA) return gdB - gdA;
      return sB.goalsFor - sA.goalsFor;
    });

    const positionMap = {};
    sortedTeamIds.forEach((id, idx) => {
      positionMap[id] = idx + 1;
    });

    const teamsDirectory = tournament.teams.map(team => {
      const tId = team._id.toString();
      const stats = statsMap[tId] || {
        played: 0, wins: 0, draws: 0, losses: 0,
        goalsFor: 0, goalsAgainst: 0, cleanSheets: 0, points: 0, form: [],
      };

      const squad = (team.playersPurchased || []).map(item => {
        const playerObj = item.playerId || {};
        return {
          id: playerObj._id || item._id,
          name: item.playerName || playerObj.name || 'Unnamed Player',
          playerNumber: playerObj.playerNumber ?? null,
          position: playerObj.position || 'FORWARD',
          division: playerObj.division || 'Unassigned',
          photo: playerObj.photo || '',
          price: item.price || 0,
          basePrice: playerObj.basePrice || 0,
          rating: playerObj.rating || 0,
          matches: playerObj.matches || 0,
          goals: playerObj.goals || 0,
          assists: playerObj.assists || 0,
        };
      });

      // Role breakdown
      let gkCount = 0;
      let defCount = 0;
      let midCount = 0;
      let fwdCount = 0;
      squad.forEach(p => {
        const pos = (p.position || '').toUpperCase();
        if (pos.includes('GOAL') || pos === 'GK') gkCount++;
        else if (pos.includes('DEF') || pos === 'CB' || pos === 'LB' || pos === 'RB') defCount++;
        else if (pos.includes('MID') || pos === 'CM' || pos === 'CDM' || pos === 'CAM') midCount++;
        else fwdCount++;
      });

      return {
        _id: team._id,
        teamId: team._id,
        teamName: team.team,
        bidderName: team.name,
        bidderNumber: team.bidderNumber,
        budget: team.budget,
        remainingBudget: team.remainingBudget,
        totalSpent: team.totalSpent,
        position: positionMap[tId] || 1,
        played: stats.played,
        wins: stats.wins,
        draws: stats.draws,
        losses: stats.losses,
        goalsFor: stats.goalsFor,
        goalsAgainst: stats.goalsAgainst,
        goalDifference: stats.goalsFor - stats.goalsAgainst,
        cleanSheets: stats.cleanSheets,
        points: stats.points,
        form: stats.form.slice(-5),
        winRate: stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0,
        avgGoals: stats.played > 0 ? (stats.goalsFor / stats.played).toFixed(1) : '0.0',
        squad,
        squadStats: {
          totalPlayers: squad.length,
          gkCount,
          defCount,
          midCount,
          fwdCount,
          totalValue: squad.reduce((sum, p) => sum + (p.price || 0), 0),
          avgPrice: squad.length > 0 ? Math.round(squad.reduce((sum, p) => sum + (p.price || 0), 0) / squad.length) : 0,
        },
      };
    });

    // Sort by standings position
    teamsDirectory.sort((a, b) => a.position - b.position);

    res.json(teamsDirectory);
  } catch (error) {
    next(error);
  }
};

// Get tournament-wide deep analytics
exports.getTournamentAnalytics = async (req, res, next) => {
  try {
    const tournamentId = new (require('mongoose').Types.ObjectId)(req.params.id);
    const tournament = await Tournament.findById(tournamentId)
      .populate('teams', 'name team bidderNumber');
    if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

    const [allMatches, allEvents] = await Promise.all([
      Match.find({ tournamentId })
        .populate('homeTeamId', 'name team')
        .populate('awayTeamId', 'name team'),
      MatchEvent.find({ tournamentId })
        .populate('teamId', 'name team'),
    ]);

    const completedMatches = allMatches.filter(m => m.status === 'COMPLETED');
    const liveMatches = allMatches.filter(m => m.status === 'LIVE' || m.status === 'HALF_TIME');
    const upcomingMatches = allMatches.filter(m => m.status === 'UPCOMING');

    let totalGoals = 0;
    let homeWins = 0;
    let awayWins = 0;
    let draws = 0;
    let highestScoringMatch = null;
    let biggestWin = null;
    let highestTotalGoalsInMatch = -1;
    let biggestWinMargin = -1;

    // Team stats aggregation
    const teamStats = {};
    for (const team of tournament.teams) {
      teamStats[team._id.toString()] = {
        teamId: team._id,
        teamName: team.team,
        bidderName: team.name,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        cleanSheets: 0,
        points: 0,
        yellowCards: 0,
        redCards: 0,
        fouls: 0,
        penaltiesWon: 0,
        firstHalfGoals: 0,
        secondHalfGoals: 0,
      };
    }

    for (const m of completedMatches) {
      const matchGoals = m.homeScore + m.awayScore;
      totalGoals += matchGoals;

      const hId = m.homeTeamId?._id?.toString() || m.homeTeamId?.toString();
      const aId = m.awayTeamId?._id?.toString() || m.awayTeamId?.toString();

      if (teamStats[hId]) {
        teamStats[hId].played++;
        teamStats[hId].goalsFor += m.homeScore;
        teamStats[hId].goalsAgainst += m.awayScore;
        if (m.awayScore === 0) teamStats[hId].cleanSheets++;
      }
      if (teamStats[aId]) {
        teamStats[aId].played++;
        teamStats[aId].goalsFor += m.awayScore;
        teamStats[aId].goalsAgainst += m.homeScore;
        if (m.homeScore === 0) teamStats[aId].cleanSheets++;
      }

      if (m.homeScore > m.awayScore) {
        homeWins++;
        if (teamStats[hId]) {
          teamStats[hId].wins++;
          teamStats[hId].points += tournament.pointsForWin;
        }
        if (teamStats[aId]) {
          teamStats[aId].losses++;
          teamStats[aId].points += tournament.pointsForLoss;
        }
      } else if (m.homeScore < m.awayScore) {
        awayWins++;
        if (teamStats[aId]) {
          teamStats[aId].wins++;
          teamStats[aId].points += tournament.pointsForWin;
        }
        if (teamStats[hId]) {
          teamStats[hId].losses++;
          teamStats[hId].points += tournament.pointsForLoss;
        }
      } else {
        draws++;
        if (teamStats[hId]) {
          teamStats[hId].draws++;
          teamStats[hId].points += tournament.pointsForDraw;
        }
        if (teamStats[aId]) {
          teamStats[aId].draws++;
          teamStats[aId].points += tournament.pointsForDraw;
        }
      }

      // Check highest scoring
      if (matchGoals > highestTotalGoalsInMatch) {
        highestTotalGoalsInMatch = matchGoals;
        highestScoringMatch = {
          homeTeam: m.homeTeamId?.team || 'Home',
          awayTeam: m.awayTeamId?.team || 'Away',
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          totalGoals: matchGoals,
          round: m.round,
        };
      }

      // Check biggest win
      const margin = Math.abs(m.homeScore - m.awayScore);
      if (margin > biggestWinMargin && margin > 0) {
        biggestWinMargin = margin;
        const winner = m.homeScore > m.awayScore ? m.homeTeamId?.team : m.awayTeamId?.team;
        const loser = m.homeScore > m.awayScore ? m.awayTeamId?.team : m.homeTeamId?.team;
        biggestWin = {
          winner: winner || 'Winner',
          loser: loser || 'Loser',
          score: `${Math.max(m.homeScore, m.awayScore)} - ${Math.min(m.homeScore, m.awayScore)}`,
          margin,
          round: m.round,
        };
      }
    }

    // Process MatchEvents for cards, fouls, phases
    let totalYellowCards = 0;
    let totalRedCards = 0;
    let totalFouls = 0;
    let totalCorners = 0;
    let totalOffsides = 0;
    let totalPenalties = 0;
    let penaltiesScored = 0;
    let firstHalfGoals = 0;
    let secondHalfGoals = 0;

    for (const ev of allEvents) {
      const tId = ev.teamId?._id?.toString() || ev.teamId?.toString();
      const currentTeam = teamStats[tId];

      if (['GOAL', 'PENALTY_GOAL', 'OWN_GOAL'].includes(ev.type)) {
        if (ev.minute <= 45) {
          firstHalfGoals++;
          if (currentTeam) currentTeam.firstHalfGoals++;
        } else {
          secondHalfGoals++;
          if (currentTeam) currentTeam.secondHalfGoals++;
        }
      }

      switch (ev.type) {
        case 'YELLOW_CARD':
          totalYellowCards++;
          if (currentTeam) currentTeam.yellowCards++;
          break;
        case 'RED_CARD':
          totalRedCards++;
          if (currentTeam) currentTeam.redCards++;
          break;
        case 'FOUL':
          totalFouls++;
          if (currentTeam) currentTeam.fouls++;
          break;
        case 'PENALTY_GOAL':
          totalPenalties++;
          penaltiesScored++;
          if (currentTeam) currentTeam.penaltiesWon++;
          break;
        case 'PENALTY_MISSED':
          totalPenalties++;
          if (currentTeam) currentTeam.penaltiesWon++;
          break;
        case 'CORNER':
          totalCorners++;
          break;
        case 'OFFSIDE':
          totalOffsides++;
          break;
      }
    }

    const teamList = Object.values(teamStats);

    // Attack rankings: Goals For DESC, avg goals DESC
    const attackRankings = [...teamList].map(t => ({
      teamId: t.teamId,
      teamName: t.teamName,
      bidderName: t.bidderName,
      played: t.played,
      goalsFor: t.goalsFor,
      avgGoals: t.played > 0 ? (t.goalsFor / t.played).toFixed(2) : '0.00',
      firstHalfGoals: t.firstHalfGoals,
      secondHalfGoals: t.secondHalfGoals,
    })).sort((a, b) => b.goalsFor - a.goalsFor || parseFloat(b.avgGoals) - parseFloat(a.avgGoals));

    // Defense rankings: Goals Against ASC, clean sheets DESC
    const defenseRankings = [...teamList].map(t => ({
      teamId: t.teamId,
      teamName: t.teamName,
      bidderName: t.bidderName,
      played: t.played,
      goalsAgainst: t.goalsAgainst,
      cleanSheets: t.cleanSheets,
      avgConceded: t.played > 0 ? (t.goalsAgainst / t.played).toFixed(2) : '0.00',
    })).sort((a, b) => a.goalsAgainst - b.goalsAgainst || b.cleanSheets - a.cleanSheets);

    // Fair play index: yellow = 1 pt, red = 3 pt, foul = 0.2 pt. Lowest points = cleanest team
    const fairPlayRankings = [...teamList].map(t => {
      const score = (t.yellowCards * 1) + (t.redCards * 3) + Math.round(t.fouls * 0.2);
      return {
        teamId: t.teamId,
        teamName: t.teamName,
        bidderName: t.bidderName,
        played: t.played,
        yellowCards: t.yellowCards,
        redCards: t.redCards,
        fouls: t.fouls,
        fairPlayPoints: score,
      };
    }).sort((a, b) => a.fairPlayPoints - b.fairPlayPoints || a.redCards - b.redCards || a.yellowCards - b.yellowCards);

    const totalCleanSheets = teamList.reduce((acc, t) => acc + t.cleanSheets, 0);
    const goalsPerMatch = completedMatches.length > 0 ? (totalGoals / completedMatches.length).toFixed(2) : '0.00';
    const completionRate = allMatches.length > 0 ? Math.round((completedMatches.length / allMatches.length) * 100) : 0;

    res.json({
      summary: {
        totalMatches: allMatches.length,
        completedMatches: completedMatches.length,
        upcomingMatches: upcomingMatches.length,
        liveMatches: liveMatches.length,
        completionRate,
        totalGoals,
        goalsPerMatch,
        totalCleanSheets,
        totalYellowCards,
        totalRedCards,
        totalFouls,
        totalCorners,
        totalOffsides,
        totalPenalties,
        penaltiesScored,
      },
      outcomes: {
        homeWins,
        awayWins,
        draws,
        total: completedMatches.length,
        homeWinPct: completedMatches.length > 0 ? Math.round((homeWins / completedMatches.length) * 100) : 0,
        awayWinPct: completedMatches.length > 0 ? Math.round((awayWins / completedMatches.length) * 100) : 0,
        drawPct: completedMatches.length > 0 ? Math.round((draws / completedMatches.length) * 100) : 0,
      },
      goalPhases: {
        firstHalf: firstHalfGoals,
        secondHalf: secondHalfGoals,
        firstHalfPct: totalGoals > 0 ? Math.round((firstHalfGoals / totalGoals) * 100) : 0,
        secondHalfPct: totalGoals > 0 ? Math.round((secondHalfGoals / totalGoals) * 100) : 0,
      },
      records: {
        highestScoringMatch: highestTotalGoalsInMatch > 0 ? highestScoringMatch : null,
        biggestWin: biggestWinMargin > 0 ? biggestWin : null,
      },
      attackRankings,
      defenseRankings,
      fairPlayRankings,
    });
  } catch (error) {
    next(error);
  }
};

