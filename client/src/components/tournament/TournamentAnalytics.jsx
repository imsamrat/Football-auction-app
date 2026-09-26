import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Shield,
  Target,
  Trophy,
  AlertTriangle,
  Award,
  Flame,
  Activity,
  Zap,
  Clock,
  CheckCircle,
} from 'lucide-react';

const TournamentAnalytics = ({ analytics, loading = false }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!analytics || !analytics.summary) {
    return (
      <div className="glass-card p-12 text-center text-gray-400">
        <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white mb-1">No Statistics Available</h3>
        <p className="text-sm text-gray-500">Analytics will become available as matches are played.</p>
      </div>
    );
  }

  const {
    summary = {},
    outcomes = {},
    goalPhases = {},
    records = {},
    attackRankings = [],
    defenseRankings = [],
    fairPlayRankings = [],
  } = analytics;

  const maxGoals = Math.max(...attackRankings.map(t => t.goalsFor || 0), 1);
  const fairPlayLeader = fairPlayRankings.length > 0 ? fairPlayRankings[0] : null;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-card p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-display font-bold text-white tracking-wide">
                Tournament Analytics & Records
              </h2>
            </div>
            <p className="text-xs text-gray-400">
              Enterprise-grade performance intelligence, goal trends, defensive records, and fair play index.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-dark-200/80 border border-dark-50/50 text-gray-300">
              Tournament Progress: <strong className="text-primary font-mono ml-1">{summary.completionRate || 0}%</strong>
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Matches */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">Matches</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-white font-mono">
            {summary.completedMatches} <span className="text-sm font-normal text-gray-500">/ {summary.totalMatches}</span>
          </div>
          <div className="mt-2 w-full bg-dark-300 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${summary.completionRate || 0}%` }}
            />
          </div>
          <div className="text-[11px] text-gray-500 mt-1.5 flex justify-between">
            <span>{summary.upcomingMatches} upcoming</span>
            <span>{summary.completionRate}% played</span>
          </div>
        </motion.div>

        {/* Goals Scored */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card p-4 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">Goals Scored</span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-white font-mono">
            {summary.totalGoals}{' '}
            <span className="text-xs font-normal text-primary">
              ({summary.goalsPerMatch} / match)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-gray-400 flex items-center gap-2">
            <span className="text-gray-500">1st Half: <strong className="text-white font-mono">{goalPhases.firstHalf || 0}</strong></span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-500">2nd Half: <strong className="text-white font-mono">{goalPhases.secondHalf || 0}</strong></span>
          </div>
          <div className="mt-1.5 w-full bg-dark-300 h-1.5 rounded-full overflow-hidden flex">
            <div
              className="bg-primary h-full transition-all duration-500"
              style={{ width: `${goalPhases.firstHalfPct || 50}%` }}
              title={`1st Half: ${goalPhases.firstHalfPct}%`}
            />
            <div
              className="bg-amber-400 h-full transition-all duration-500"
              style={{ width: `${goalPhases.secondHalfPct || 50}%` }}
              title={`2nd Half: ${goalPhases.secondHalfPct}%`}
            />
          </div>
        </motion.div>

        {/* Clean Sheets */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">Clean Sheets</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-emerald-400 font-mono">
            {summary.totalCleanSheets}
          </div>
          <div className="text-[11px] text-gray-500 mt-2">
            Across {summary.completedMatches * 2} team appearances
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Shutout efficiency in tournament play
          </div>
        </motion.div>

        {/* Discipline / Cards */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-4 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-gray-400 font-medium">Disciplinary Index</span>
            <div className="w-8 h-8 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-4.5 bg-yellow-400 rounded-sm shadow-sm" />
              <span className="text-xl font-bold text-white font-mono">{summary.totalYellowCards}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-4.5 bg-red-500 rounded-sm shadow-sm" />
              <span className="text-xl font-bold text-white font-mono">{summary.totalRedCards}</span>
            </div>
            {summary.totalFouls > 0 && (
              <div className="text-xs text-gray-500 font-mono ml-auto">
                {summary.totalFouls} Fouls
              </div>
            )}
          </div>
          <div className="text-[11px] text-gray-500 mt-2">
            {summary.totalPenalties > 0
              ? `${summary.penaltiesScored} / ${summary.totalPenalties} Penalties converted`
              : 'Cards & fouls registered by referees'}
          </div>
        </motion.div>
      </div>

      {/* Match Outcome Distribution Bar */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Match Outcomes Distribution
            </h3>
          </div>
          <span className="text-xs text-gray-500">
            {outcomes.total || 0} completed fixtures
          </span>
        </div>

        {/* Segmented bar */}
        <div className="h-3 w-full bg-dark-300 rounded-full overflow-hidden flex mb-3">
          <div
            className="bg-green-500 h-full transition-all duration-500"
            style={{ width: `${outcomes.homeWinPct || 33}%` }}
            title={`Home Wins: ${outcomes.homeWins} (${outcomes.homeWinPct}%)`}
          />
          <div
            className="bg-yellow-400 h-full transition-all duration-500"
            style={{ width: `${outcomes.drawPct || 34}%` }}
            title={`Draws: ${outcomes.draws} (${outcomes.drawPct}%)`}
          />
          <div
            className="bg-blue-500 h-full transition-all duration-500"
            style={{ width: `${outcomes.awayWinPct || 33}%` }}
            title={`Away Wins: ${outcomes.awayWins} (${outcomes.awayWinPct}%)`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-lg bg-dark-200/50 border border-green-500/20">
            <div className="flex items-center justify-center gap-1.5 text-green-400 font-semibold mb-0.5">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span>Home Wins</span>
            </div>
            <div className="text-base font-bold text-white font-mono">
              {outcomes.homeWins}{' '}
              <span className="text-xs text-gray-500 font-normal">({outcomes.homeWinPct}%)</span>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-dark-200/50 border border-yellow-500/20">
            <div className="flex items-center justify-center gap-1.5 text-yellow-400 font-semibold mb-0.5">
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              <span>Draws</span>
            </div>
            <div className="text-base font-bold text-white font-mono">
              {outcomes.draws}{' '}
              <span className="text-xs text-gray-500 font-normal">({outcomes.drawPct}%)</span>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-dark-200/50 border border-blue-500/20">
            <div className="flex items-center justify-center gap-1.5 text-blue-400 font-semibold mb-0.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Away Wins</span>
            </div>
            <div className="text-base font-bold text-white font-mono">
              {outcomes.awayWins}{' '}
              <span className="text-xs text-gray-500 font-normal">({outcomes.awayWinPct}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Columns: Attack Leaderboard vs Defense Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attacking Rankings */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-dark-50/40">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Attack Rankings (Top Scoring)
              </h3>
            </div>
            <span className="text-xs text-gray-500">Goals Scored</span>
          </div>

          <div className="space-y-3">
            {attackRankings.map((team, idx) => {
              const pctOfMax = Math.round((team.goalsFor / maxGoals) * 100);
              return (
                <div key={team.teamId} className="p-3 rounded-xl bg-dark-200/60 border border-dark-50/40">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 0 ? 'bg-primary text-white' : 'bg-dark-300 text-gray-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-white">{team.teamName}</div>
                        <div className="text-[10px] text-gray-500">{team.played} matches played</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-primary font-mono">
                        {team.goalsFor} <span className="text-xs font-normal text-gray-400">GF</span>
                      </div>
                      <div className="text-[10px] text-gray-500">{team.avgGoals} / match</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-dark-300 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary to-orange-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pctOfMax}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Defense Rankings */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-dark-50/40">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Defensive Solidity (Fewest Conceded)
              </h3>
            </div>
            <span className="text-xs text-gray-500">Goals Against</span>
          </div>

          <div className="space-y-3">
            {defenseRankings.map((team, idx) => {
              return (
                <div key={team.teamId} className="p-3 rounded-xl bg-dark-200/60 border border-dark-50/40">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 0 ? 'bg-emerald-500 text-black' : 'bg-dark-300 text-gray-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-white">{team.teamName}</div>
                        <div className="text-[10px] text-gray-500">
                          {team.cleanSheets} clean {team.cleanSheets === 1 ? 'sheet' : 'sheets'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-emerald-400 font-mono">
                        {team.goalsAgainst} <span className="text-xs font-normal text-gray-400">GA</span>
                      </div>
                      <div className="text-[10px] text-gray-500">{team.avgConceded} / match</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fair Play & Discipline Index */}
      <div className="glass-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-dark-50/40">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Fair Play & Disciplinary Index
              </h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Ranked by fewest disciplinary infractions (Yellow = 1 pt, Red = 3 pts). Lowest score leads.
            </p>
          </div>

          {fairPlayLeader && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium">
              <Trophy className="w-3.5 h-3.5" />
              <span>Fair Play Leader: <strong className="text-white">{fairPlayLeader.teamName}</strong></span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-gray-500 border-b border-dark-50/40">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Team</th>
                <th className="py-2.5 px-3 text-center">Played</th>
                <th className="py-2.5 px-3 text-center">Yellow Cards</th>
                <th className="py-2.5 px-3 text-center">Red Cards</th>
                <th className="py-2.5 px-3 text-center">Fouls</th>
                <th className="py-2.5 px-3 text-right">Fair Play Points</th>
              </tr>
            </thead>
            <tbody>
              {fairPlayRankings.map((team, idx) => (
                <tr
                  key={team.teamId}
                  className={`border-b border-dark-50/20 hover:bg-dark-200/40 transition-colors ${
                    idx === 0 ? 'bg-amber-500/5' : ''
                  }`}
                >
                  <td className="py-3 px-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? 'bg-amber-400 text-black' : 'text-gray-500'
                    }`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-white">
                    {team.teamName}
                  </td>
                  <td className="py-3 px-3 text-center text-gray-400 font-mono">
                    {team.played}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center gap-1 font-mono text-yellow-400 font-bold">
                      <span className="w-2.5 h-3 bg-yellow-400 rounded-[1px] inline-block" />
                      {team.yellowCards}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center gap-1 font-mono text-red-400 font-bold">
                      <span className="w-2.5 h-3 bg-red-500 rounded-[1px] inline-block" />
                      {team.redCards}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center text-gray-400 font-mono">
                    {team.fouls}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-gray-300">
                    {team.fairPlayPoints}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tournament Milestones & Highlights */}
      {(records.highestScoringMatch || records.biggestWin) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {records.highestScoringMatch && (
            <div className="glass-card p-4 border-l-4 border-l-primary flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                  Highest Scoring Match
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  {records.highestScoringMatch.homeTeam} {records.highestScoringMatch.homeScore} - {records.highestScoringMatch.awayScore} {records.highestScoringMatch.awayTeam}
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Round {records.highestScoringMatch.round} • {records.highestScoringMatch.totalGoals} goals thriller
                </p>
              </div>
            </div>
          )}

          {records.biggestWin && (
            <div className="glass-card p-4 border-l-4 border-l-green-500 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                  Biggest Victory Margin
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  {records.biggestWin.winner} ({records.biggestWin.score})
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Round {records.biggestWin.round} • {records.biggestWin.margin} goal victory margin
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TournamentAnalytics;
