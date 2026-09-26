import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Shield,
  Trophy,
  DollarSign,
  Search,
  ChevronDown,
  ChevronUp,
  Star,
  Activity,
  Flame,
  Award,
  Wallet,
} from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const getPositionBadge = (pos) => {
  const p = (pos || '').toUpperCase();
  if (p.includes('GOAL') || p === 'GK') {
    return { label: 'GK', full: 'Goalkeeper', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
  }
  if (p.includes('DEF') || p === 'CB' || p === 'LB' || p === 'RB') {
    return { label: 'DEF', full: 'Defender', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' };
  }
  if (p.includes('MID') || p === 'CM' || p === 'CDM' || p === 'CAM') {
    return { label: 'MID', full: 'Midfielder', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
  }
  return { label: 'FWD', full: 'Forward', color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' };
};

const getTeamGradient = (name = '') => {
  const gradients = [
    'from-red-600/30 via-red-900/10 to-transparent border-red-500/30',
    'from-blue-600/30 via-blue-900/10 to-transparent border-blue-500/30',
    'from-emerald-600/30 via-emerald-900/10 to-transparent border-emerald-500/30',
    'from-purple-600/30 via-purple-900/10 to-transparent border-purple-500/30',
    'from-amber-600/30 via-amber-900/10 to-transparent border-amber-500/30',
    'from-cyan-600/30 via-cyan-900/10 to-transparent border-cyan-500/30',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
};

const TeamDirectory = ({ teams = [], loading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTeamId, setExpandedTeamId] = useState(null);
  const [roleFilter, setRoleFilter] = useState('ALL');

  const filteredTeams = useMemo(() => {
    return teams.filter(t => {
      const matchSearch =
        t.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.bidderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.squad?.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchSearch;
    });
  }, [teams, searchTerm]);

  const toggleExpand = (teamId) => {
    setExpandedTeamId(prev => (prev === teamId ? null : teamId));
    setRoleFilter('ALL');
  };

  const totalTournamentPlayers = useMemo(() => {
    return teams.reduce((acc, t) => acc + (t.squad?.length || 0), 0);
  }, [teams]);

  const totalInvestment = useMemo(() => {
    return teams.reduce((acc, t) => acc + (t.totalSpent || 0), 0);
  }, [teams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!teams.length) {
    return (
      <div className="glass-card p-12 text-center text-gray-400">
        <Shield className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white mb-1">No Teams Enrolled</h3>
        <p className="text-sm text-gray-500">No teams are currently enrolled in this tournament.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Directory Overview & Search Bar */}
      <div className="glass-card p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-display font-bold text-white tracking-wide">
                Teams & Squad Directory
              </h2>
            </div>
            <p className="text-xs text-gray-400">
              Official roster, financial allocation, and league form for all {teams.length} clubs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-dark-200/80 border border-dark-50/50 text-xs">
              <span className="text-gray-400">Clubs: <strong className="text-white">{teams.length}</strong></span>
              <span className="text-gray-600">|</span>
              <span className="text-gray-400">Roster: <strong className="text-white">{totalTournamentPlayers}</strong></span>
              <span className="text-gray-600">|</span>
              <span className="text-gray-400">Auction Vol: <strong className="text-primary font-mono">{formatCurrency(totalInvestment)}</strong></span>
            </div>

            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search team, owner, player..."
                className="w-full pl-9 pr-3 py-1.5 bg-dark-300 border border-dark-50/50 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 gap-5">
        {filteredTeams.map((team, idx) => {
          const isExpanded = expandedTeamId === team.teamId;
          const gradientStyle = getTeamGradient(team.teamName);
          const squad = team.squad || [];

          // Filter squad players if role filter applied
          const visibleSquad = squad.filter(player => {
            if (roleFilter === 'ALL') return true;
            const badge = getPositionBadge(player.position);
            return badge.label === roleFilter;
          });

          return (
            <motion.div
              key={team.teamId}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={`glass-card overflow-hidden border transition-all ${
                isExpanded ? 'border-primary/40 shadow-lg shadow-primary/5' : 'border-dark-50/40 hover:border-dark-50/80'
              }`}
            >
              {/* Card Header Banner */}
              <div className={`p-5 bg-gradient-to-r ${gradientStyle} border-b border-dark-50/30`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Crest & Team Info */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-dark-100 to-dark-300 border-2 border-primary/30 flex items-center justify-center font-display font-black text-xl text-white shadow-inner">
                        {team.teamName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className={`absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-dark-200 ${
                        team.position === 1 ? 'bg-amber-400 text-black' :
                        team.position === 2 ? 'bg-slate-300 text-black' :
                        team.position === 3 ? 'bg-amber-700 text-white' :
                        'bg-dark-100 text-gray-400'
                      }`}>
                        #{team.position}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-display font-bold text-white">
                          {team.teamName}
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-dark-100/80 border border-dark-50 text-gray-400 uppercase tracking-wider">
                          Bidder #{team.bidderNumber}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                        <span>Owner:</span>
                        <strong className="text-gray-200">{team.bidderName}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Right: Tournament Standing & Form */}
                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="text-right">
                      <div className="flex items-baseline justify-end gap-1.5">
                        <span className="text-3xl font-display font-bold text-primary font-mono">
                          {team.points}
                        </span>
                        <span className="text-xs uppercase text-gray-400 font-medium">PTS</span>
                      </div>
                      {/* Form pills */}
                      <div className="flex items-center gap-1 mt-1 justify-end">
                        {team.form && team.form.length > 0 ? (
                          team.form.map((res, fIdx) => (
                            <span
                              key={fIdx}
                              className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                                res === 'W'
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                  : res === 'D'
                                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}
                              title={res === 'W' ? 'Win' : res === 'D' ? 'Draw' : 'Loss'}
                            >
                              {res}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-gray-500">No matches yet</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => toggleExpand(team.teamId)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isExpanded
                          ? 'bg-primary text-white shadow-md shadow-primary/20'
                          : 'bg-dark-100 text-gray-300 hover:text-white hover:bg-dark-50 border border-dark-50/60'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{isExpanded ? 'Hide Squad' : 'View Squad'}</span>
                      <span className="text-[10px] opacity-80">({squad.length})</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Tournament Match Performance Strip */}
              <div className="p-4 bg-dark-200/40 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center border-b border-dark-50/30">
                <div className="p-2 rounded-lg bg-dark-300/40">
                  <div className="text-xs text-gray-500 uppercase font-medium">Played</div>
                  <div className="text-base font-bold text-white font-mono">{team.played}</div>
                </div>
                <div className="p-2 rounded-lg bg-dark-300/40">
                  <div className="text-xs text-gray-500 uppercase font-medium">Won</div>
                  <div className="text-base font-bold text-green-400 font-mono">{team.wins}</div>
                </div>
                <div className="p-2 rounded-lg bg-dark-300/40">
                  <div className="text-xs text-gray-500 uppercase font-medium">Drawn</div>
                  <div className="text-base font-bold text-yellow-400 font-mono">{team.draws}</div>
                </div>
                <div className="p-2 rounded-lg bg-dark-300/40">
                  <div className="text-xs text-gray-500 uppercase font-medium">Lost</div>
                  <div className="text-base font-bold text-red-400 font-mono">{team.losses}</div>
                </div>
                <div className="p-2 rounded-lg bg-dark-300/40">
                  <div className="text-xs text-gray-500 uppercase font-medium">Goals (GF-GA)</div>
                  <div className="text-base font-bold text-gray-200 font-mono">
                    {team.goalsFor} - {team.goalsAgainst}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-dark-300/40">
                  <div className="text-xs text-gray-500 uppercase font-medium">Goal Diff</div>
                  <div
                    className={`text-base font-bold font-mono ${
                      team.goalDifference > 0
                        ? 'text-green-400'
                        : team.goalDifference < 0
                        ? 'text-red-400'
                        : 'text-gray-400'
                    }`}
                  >
                    {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-dark-300/40 col-span-2 sm:col-span-1">
                  <div className="text-xs text-gray-500 uppercase font-medium">Win Rate</div>
                  <div className="text-base font-bold text-primary font-mono">{team.winRate}%</div>
                </div>
              </div>

              {/* Auction Financials & Role Breakdown Bar */}
              <div className="px-5 py-3 bg-dark-300/20 flex flex-wrap items-center justify-between gap-4 text-xs border-b border-dark-50/20">
                {/* Financial Summary */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Wallet className="w-3.5 h-3.5 text-primary" />
                    <span>Total Purse:</span>
                    <strong className="text-white font-mono">{formatCurrency(team.budget)}</strong>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <DollarSign className="w-3.5 h-3.5 text-green-400" />
                    <span>Spent:</span>
                    <strong className="text-green-400 font-mono">{formatCurrency(team.totalSpent)}</strong>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <span>Remaining:</span>
                    <strong className="text-gray-300 font-mono">{formatCurrency(team.remainingBudget)}</strong>
                  </div>
                </div>

                {/* Squad Position Counts */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 font-medium">Squad:</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[11px] font-medium border border-amber-500/20">
                    {team.squadStats?.gkCount || 0} GK
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[11px] font-medium border border-blue-500/20">
                    {team.squadStats?.defCount || 0} DEF
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[11px] font-medium border border-emerald-500/20">
                    {team.squadStats?.midCount || 0} MID
                  </span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[11px] font-medium border border-rose-500/20">
                    {team.squadStats?.fwdCount || 0} FWD
                  </span>
                </div>
              </div>

              {/* Expandable Squad Roster Section */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 bg-dark-300/40">
                      {/* Filter by role chips */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-dark-50/40">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-primary" />
                          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                            Official Squad Roster ({squad.length})
                          </h4>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {['ALL', 'GK', 'DEF', 'MID', 'FWD'].map(pos => (
                            <button
                              key={pos}
                              onClick={() => setRoleFilter(pos)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                roleFilter === pos
                                  ? 'bg-primary text-white'
                                  : 'bg-dark-200 text-gray-400 hover:text-white hover:bg-dark-100'
                              }`}
                            >
                              {pos}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Players Grid */}
                      {visibleSquad.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                          {visibleSquad.map((player, pIdx) => {
                            const badge = getPositionBadge(player.position);
                            return (
                              <motion.div
                                key={player.id || pIdx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: pIdx * 0.02 }}
                                className="p-3.5 rounded-xl bg-dark-200/80 border border-dark-50/50 hover:border-primary/40 transition-all flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2.5">
                                      {/* Player Avatar */}
                                      {player.photo ? (
                                        <img
                                          src={player.photo}
                                          alt={player.name}
                                          className="w-10 h-10 rounded-xl object-cover border border-dark-50"
                                        />
                                      ) : (
                                        <div className="w-10 h-10 rounded-xl bg-dark-300 border border-dark-50 flex items-center justify-center font-bold text-xs text-gray-400">
                                          {player.playerNumber ? `#${player.playerNumber}` : player.name.slice(0, 2).toUpperCase()}
                                        </div>
                                      )}

                                      <div>
                                        <h5 className="font-semibold text-white text-sm leading-tight">
                                          {player.name}
                                        </h5>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${badge.color}`}>
                                            {badge.label}
                                          </span>
                                          {player.division && (
                                            <span className="text-[10px] text-gray-500 font-mono">
                                              Div {player.division}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Rating badge */}
                                    {player.rating > 0 && (
                                      <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20">
                                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                        <span>{player.rating}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Player stats & auction price */}
                                <div className="pt-2 mt-2 border-t border-dark-50/40 flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2 text-gray-400 text-[11px]">
                                    <span>Goals: <strong className="text-white">{player.goals}</strong></span>
                                    <span>Assists: <strong className="text-white">{player.assists}</strong></span>
                                  </div>

                                  <div className="text-right">
                                    <span className="text-xs font-bold text-green-400 font-mono">
                                      {formatCurrency(player.price)}
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="py-8 text-center text-gray-500 text-xs">
                          {squad.length === 0
                            ? 'No auction players have been purchased by this team yet.'
                            : `No ${roleFilter} players found in this squad.`}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamDirectory;
