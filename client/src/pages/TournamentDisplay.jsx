import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Monitor } from 'lucide-react';
import tournamentService from '../services/tournamentService';
import { useSocket } from '../context/SocketContext';
import PointTable from '../components/tournament/PointTable';
import FixtureCard from '../components/tournament/FixtureCard';

const TournamentDisplay = () => {
  const { socket } = useSocket();
  const [tournaments, setTournaments] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [standings, setStandings] = useState([]);
  const [view, setView] = useState('auto'); // auto, standings, fixtures, live
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTournaments();
  }, []);

  useEffect(() => {
    if (selectedId) loadData();
  }, [selectedId]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!selectedId) return;
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [selectedId]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;
    const refresh = () => loadData();
    socket.on('match:started', refresh);
    socket.on('match:ended', refresh);
    socket.on('match:goal', refresh);
    socket.on('match:updated', refresh);
    socket.on('standings:updated', refresh);
    return () => {
      socket.off('match:started', refresh);
      socket.off('match:ended', refresh);
      socket.off('match:goal', refresh);
      socket.off('match:updated', refresh);
      socket.off('standings:updated', refresh);
    };
  }, [socket, selectedId]);

  const loadTournaments = async () => {
    try {
      const data = await tournamentService.getTournaments();
      setTournaments(data);
      const ongoing = data.find(t => t.status === 'ONGOING');
      setSelectedId(ongoing?._id || data[0]?._id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    if (!selectedId) return;
    try {
      const [dash, stand] = await Promise.all([
        tournamentService.getDashboard(selectedId),
        tournamentService.getStandings(selectedId),
      ]);
      setDashboard(dash);
      setStandings(stand);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !dashboard) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { tournament, liveMatches, upcomingMatches, recentResults } = dashboard;
  const hasLive = liveMatches.length > 0;

  // Auto mode: show live if available, otherwise standings
  const currentView = view === 'auto' ? (hasLive ? 'live' : 'standings') : view;

  return (
    <div className="min-h-screen bg-dark text-white p-6 md:p-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center">
            <Trophy className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold">{tournament.name}</h1>
            {tournament.season && <p className="text-lg text-gray-400">{tournament.season}</p>}
          </div>
        </div>

        {/* View selector */}
        <div className="flex items-center gap-2">
          {['auto', 'live', 'standings', 'fixtures'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-all ${
                view === v ? 'bg-primary text-white' : 'bg-dark-200 text-gray-500 hover:text-white'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {currentView === 'live' && (
        <div className="space-y-8">
          {hasLive ? (
            liveMatches.map(match => (
              <motion.div
                key={match._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-8 md:p-12 border-red-500/30"
              >
                <div className="text-center mb-4">
                  <span className="bg-red-500/20 text-red-400 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest animate-pulse">
                    LIVE
                  </span>
                  {match.matchMinute > 0 && (
                    <div className="mt-3 text-4xl font-mono font-bold text-red-400">{match.matchMinute}'</div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-8 md:gap-16">
                  <div className="text-center flex-1">
                    <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-3xl font-bold text-primary">{(match.homeTeamId?.team || 'H')[0]}</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-display font-bold">{match.homeTeamId?.team}</h2>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="text-6xl md:text-8xl font-bold font-mono">{match.homeScore}</span>
                    <span className="text-3xl text-gray-600">-</span>
                    <span className="text-6xl md:text-8xl font-bold font-mono">{match.awayScore}</span>
                  </div>

                  <div className="text-center flex-1">
                    <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-3xl font-bold text-blue-400">{(match.awayTeamId?.team || 'A')[0]}</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-display font-bold">{match.awayTeamId?.team}</h2>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20">
              <Monitor className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-2xl text-gray-500">No live matches</p>
            </div>
          )}
        </div>
      )}

      {currentView === 'standings' && (
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wider text-gray-400 mb-4">Point Table</h2>
          <div className="text-lg">
            <PointTable standings={standings} />
          </div>
        </div>
      )}

      {currentView === 'fixtures' && (
        <div className="space-y-6">
          {upcomingMatches.length > 0 && (
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wider text-gray-400 mb-4">Upcoming</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {upcomingMatches.map(m => <FixtureCard key={m._id} match={m} />)}
              </div>
            </div>
          )}
          {recentResults.length > 0 && (
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wider text-gray-400 mb-4">Recent Results</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {recentResults.map(m => <FixtureCard key={m._id} match={m} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TournamentDisplay;
