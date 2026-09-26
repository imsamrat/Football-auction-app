import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Monitor, Maximize, Minimize, ArrowLeft, RefreshCw, Calendar, AlertCircle } from 'lucide-react';
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
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    loadTournaments();
  }, []);

  useEffect(() => {
    if (selectedId) {
      loadData();
    }
  }, [selectedId]);

  // Auto-refresh every 25 seconds
  useEffect(() => {
    if (!selectedId) return;
    const interval = setInterval(loadData, 25000);
    return () => clearInterval(interval);
  }, [selectedId]);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket || !selectedId) return;
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
      setLoading(true);
      setError(null);
      const data = await tournamentService.getTournaments();
      setTournaments(data || []);
      if (data && data.length > 0) {
        const ongoing = data.find(t => t.status === 'ONGOING');
        setSelectedId(ongoing?._id || data[0]._id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Failed to load tournaments:', err);
      setError('Unable to load tournaments. Please check your connection.');
      setLoading(false);
    }
  };

  const loadData = async () => {
    if (!selectedId) return;
    try {
      setError(null);
      const [dash, stand] = await Promise.all([
        tournamentService.getDashboard(selectedId),
        tournamentService.getStandings(selectedId),
      ]);
      setDashboard(dash);
      setStandings(stand);
    } catch (err) {
      console.error('Failed to load display data:', err);
      setError('Failed to fetch tournament data.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // 1. Initial Fullscreen Loading
  if (loading && !dashboard) {
    return (
      <div className="min-h-screen bg-[#0d0d11] text-white flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm font-medium">Loading TV Display Mode...</p>
      </div>
    );
  }

  // 2. Empty State (No Tournaments Created Yet)
  if (!loading && (!tournaments || tournaments.length === 0)) {
    return (
      <div className="min-h-screen bg-[#0d0d11] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="glass-card max-w-md w-full p-8 border border-white/10 space-y-5">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
            <Monitor className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-white mb-2">No Tournaments Available</h2>
            <p className="text-sm text-gray-400">
              Create a tournament in the Admin Panel to broadcast live matches, point tables, and fixtures on TV.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link to="/" className="btn-dark flex-1 text-sm flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <Link to="/admin/tournaments" className="btn-primary flex-1 text-sm flex items-center justify-center gap-2">
              Admin Panel
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Error State with Retry
  if (error && !dashboard) {
    return (
      <div className="min-h-screen bg-[#0d0d11] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="glass-card max-w-md w-full p-8 border border-red-500/20 space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Display Unavailable</h2>
          <p className="text-sm text-gray-400">{error}</p>
          <div className="flex gap-3 pt-2">
            <button onClick={loadTournaments} className="btn-primary flex-1 text-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
            <Link to="/" className="btn-dark flex-1 text-sm flex items-center justify-center gap-2">
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tournament = dashboard?.tournament || {};
  const liveMatches = dashboard?.liveMatches || [];
  const upcomingMatches = dashboard?.upcomingMatches || [];
  const recentResults = dashboard?.recentResults || [];
  const hasLive = liveMatches.length > 0;

  // Auto mode: show live match if available, otherwise show point table standings
  const currentView = view === 'auto' ? (hasLive ? 'live' : 'standings') : view;

  return (
    <div className="min-h-screen bg-[#0d0d11] text-white p-4 sm:p-6 md:p-10 flex flex-col justify-between">
      <div>
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="p-2.5 rounded-xl bg-dark-200/80 hover:bg-dark-100 text-gray-400 hover:text-white border border-white/5 transition-all"
              title="Exit TV Display"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                  {tournament.name || 'Tournament'}
                </h1>
                {hasLive && (
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Live
                  </span>
                )}
              </div>
              {tournament.season && (
                <p className="text-xs text-gray-400 uppercase tracking-widest">{tournament.season}</p>
              )}
            </div>
          </div>

          {/* Controls: Tournament Switcher + View Toggles + Fullscreen */}
          <div className="flex items-center flex-wrap gap-2.5">
            {tournaments.length > 1 && (
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="input-field !text-xs !py-1.5 bg-dark-200/90 text-gray-200 border-white/10"
              >
                {tournaments.map(t => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            )}

            {/* View Mode Switcher */}
            <div className="flex items-center bg-dark-200/90 p-1 rounded-xl border border-white/10">
              {['auto', 'live', 'standings', 'fixtures'].map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                    view === v ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {v === 'auto' ? 'Auto' : v}
                </button>
              ))}
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-dark-200/90 hover:bg-dark-100 text-gray-300 hover:text-white border border-white/10 transition-all"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* VIEW 1: LIVE MATCHES */}
        {/* ============================================================ */}
        {currentView === 'live' && (
          <div className="space-y-6">
            {hasLive ? (
              liveMatches.map(match => (
                <motion.div
                  key={match._id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card p-8 md:p-12 border-red-500/30 relative overflow-hidden"
                >
                  <div className="text-center mb-6">
                    <span className="bg-red-500/20 text-red-400 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest animate-pulse border border-red-500/30">
                      LIVE MATCH
                    </span>
                    <div className="mt-3 text-4xl sm:text-5xl font-mono font-black text-red-400">
                      {match.matchMinute || 0}'
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-6 md:gap-16">
                    {/* Home Team */}
                    <div className="text-center flex-1">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary/15 border border-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <span className="text-3xl sm:text-4xl font-bold text-primary">
                          {(match.homeTeamId?.team || 'H')[0]}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-3xl font-display font-bold text-white">
                        {match.homeTeamId?.team}
                      </h2>
                    </div>

                    {/* Live Score */}
                    <div className="flex items-center gap-4 sm:gap-8 px-4 py-2 bg-dark-200/60 rounded-2xl border border-white/5">
                      <span className="text-5xl sm:text-8xl font-black font-mono text-white">
                        {match.homeScore}
                      </span>
                      <span className="text-3xl sm:text-5xl text-gray-600 font-light">-</span>
                      <span className="text-5xl sm:text-8xl font-black font-mono text-white">
                        {match.awayScore}
                      </span>
                    </div>

                    {/* Away Team */}
                    <div className="text-center flex-1">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-500/15 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                        <span className="text-3xl sm:text-4xl font-bold text-blue-400">
                          {(match.awayTeamId?.team || 'A')[0]}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-3xl font-display font-bold text-white">
                        {match.awayTeamId?.team}
                      </h2>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="glass-card text-center py-20 border border-white/5 space-y-3">
                <Monitor className="w-14 h-14 text-gray-600 mx-auto" />
                <h3 className="text-xl font-bold text-white">No Match Currently In Play</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Matches will appear here automatically when started from the Admin Match Control panel.
                </p>
                <button
                  onClick={() => setView('standings')}
                  className="btn-dark !text-xs !py-2 !px-4 mt-2"
                >
                  View Standings
                </button>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 2: POINT TABLE / STANDINGS */}
        {/* ============================================================ */}
        {currentView === 'standings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" /> Point Table & Standings
              </h2>
            </div>
            <div className="glass-card p-4 sm:p-6 border border-white/10">
              <PointTable standings={standings} />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 3: FIXTURES & RESULTS */}
        {/* ============================================================ */}
        {currentView === 'fixtures' && (
          <div className="space-y-8">
            {upcomingMatches.length > 0 && (
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" /> Upcoming Fixtures
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {upcomingMatches.map(m => (
                    <FixtureCard key={m._id} match={m} />
                  ))}
                </div>
              </div>
            )}

            {recentResults.length > 0 && (
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-emerald-400" /> Recent Results
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {recentResults.map(m => (
                    <FixtureCard key={m._id} match={m} />
                  ))}
                </div>
              </div>
            )}

            {upcomingMatches.length === 0 && recentResults.length === 0 && (
              <div className="glass-card text-center py-16 text-gray-500 text-sm">
                No scheduled fixtures found for this tournament yet.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer ticker */}
      <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Kickoff Arena Broadcast • Auto-updating in real-time</span>
        </div>
        <div>
          <span>Press F11 or click Fullscreen for venue projection</span>
        </div>
      </div>
    </div>
  );
};

export default TournamentDisplay;
