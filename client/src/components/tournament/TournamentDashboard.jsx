import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Calendar, Target, Users, Activity } from 'lucide-react';
import tournamentService from '../../services/tournamentService';
import PointTable from './PointTable';
import TopScorers from './TopScorers';
import TopAssists from './TopAssists';
import FixtureCard from './FixtureCard';

const TournamentDashboard = ({ tournamentId, onMatchClick }) => {
  const [data, setData] = useState(null);
  const [standings, setStandings] = useState([]);
  const [scorers, setScorers] = useState([]);
  const [assists, setAssists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tournamentId) return;
    loadData();
  }, [tournamentId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashData, standData, scorerData, assistData] = await Promise.all([
        tournamentService.getDashboard(tournamentId),
        tournamentService.getStandings(tournamentId),
        tournamentService.getTopScorers(tournamentId),
        tournamentService.getTopAssists(tournamentId),
      ]);
      setData(dashData);
      setStandings(standData);
      setScorers(scorerData);
      setAssists(assistData);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const { tournament, liveMatches, upcomingMatches, recentResults, stats } = data;

  return (
    <div className="space-y-6">
      {/* Tournament Header */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center">
            <Trophy className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">{tournament.name}</h1>
            {tournament.season && <p className="text-sm text-gray-400">{tournament.season}</p>}
          </div>
          <div className="ml-auto flex items-center gap-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
              tournament.status === 'ONGOING' ? 'bg-green-500/20 text-green-400' :
              tournament.status === 'COMPLETED' ? 'bg-gray-500/20 text-gray-400' :
              'bg-blue-500/20 text-blue-400'
            }`}>
              {tournament.status}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Teams', value: stats.teamsCount, icon: Users, color: 'text-blue-400' },
          { label: 'Matches', value: `${stats.completedMatches}/${stats.totalMatches}`, icon: Calendar, color: 'text-green-400' },
          { label: 'Goals', value: stats.totalGoals, icon: Target, color: 'text-primary' },
          { label: 'Status', value: tournament.status, icon: Activity, color: 'text-yellow-400' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="stat-card"
          >
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
            <span className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</span>
            <span className="text-xl font-bold text-white font-mono">{stat.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Live Matches */}
      {liveMatches.length > 0 && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-red-400 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Live Now
          </h2>
          <div className="grid gap-3">
            {liveMatches.map(match => (
              <FixtureCard key={match._id} match={match} onClick={onMatchClick} />
            ))}
          </div>
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Point Table */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Standings</h2>
          <PointTable standings={standings} compact />
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Top Scorers */}
          <TopScorers scorers={scorers} limit={5} />

          {/* Top Assists */}
          <TopAssists assists={assists} limit={5} />
        </div>
      </div>

      {/* Upcoming & Recent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Upcoming</h2>
          <div className="space-y-3">
            {upcomingMatches.length > 0 ? upcomingMatches.map(match => (
              <FixtureCard key={match._id} match={match} onClick={onMatchClick} />
            )) : (
              <div className="glass-card p-4 text-center text-gray-500 text-sm">No upcoming matches</div>
            )}
          </div>
        </div>

        {/* Recent Results */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Recent Results</h2>
          <div className="space-y-3">
            {recentResults.length > 0 ? recentResults.map(match => (
              <FixtureCard key={match._id} match={match} onClick={onMatchClick} />
            )) : (
              <div className="glass-card p-4 text-center text-gray-500 text-sm">No completed matches</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentDashboard;
