import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Calendar, BarChart3, Users, Target, Handshake, Activity } from 'lucide-react';
import tournamentService from '../services/tournamentService';
import { useSocket } from '../context/SocketContext';
import TournamentDashboard from '../components/tournament/TournamentDashboard';
import PointTable from '../components/tournament/PointTable';
import TopScorers from '../components/tournament/TopScorers';
import TopAssists from '../components/tournament/TopAssists';
import TeamStats from '../components/tournament/TeamStats';
import FixtureCard from '../components/tournament/FixtureCard';

const tabs = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'fixtures', label: 'Fixtures', icon: Calendar },
  { id: 'results', label: 'Results', icon: Trophy },
  { id: 'standings', label: 'Point Table', icon: BarChart3 },
  { id: 'teams', label: 'Teams', icon: Users },
  { id: 'scorers', label: 'Goal Scorers', icon: Target },
  { id: 'assists', label: 'Assists', icon: Handshake },
  { id: 'statistics', label: 'Statistics', icon: BarChart3 },
];

const TournamentHome = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [tournaments, setTournaments] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [fixtures, setFixtures] = useState([]);
  const [standings, setStandings] = useState([]);
  const [scorers, setScorers] = useState([]);
  const [assists, setAssists] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTournaments();
  }, []);

  useEffect(() => {
    if (selectedId && activeTab !== 'overview') {
      loadTabData();
    }
  }, [selectedId, activeTab]);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket || !selectedId) return;

    const handleUpdate = () => {
      loadTabData();
    };

    socket.on('match:ended', handleUpdate);
    socket.on('match:goal', handleUpdate);
    socket.on('standings:updated', handleUpdate);
    socket.on('match:started', handleUpdate);

    return () => {
      socket.off('match:ended', handleUpdate);
      socket.off('match:goal', handleUpdate);
      socket.off('standings:updated', handleUpdate);
      socket.off('match:started', handleUpdate);
    };
  }, [socket, selectedId, activeTab]);

  const loadTournaments = async () => {
    try {
      const data = await tournamentService.getTournaments();
      setTournaments(data);
      // Auto-select ongoing or most recent
      const ongoing = data.find(t => t.status === 'ONGOING');
      if (ongoing) setSelectedId(ongoing._id);
      else if (data.length > 0) setSelectedId(data[0]._id);
    } catch (err) {
      console.error('Failed to load tournaments:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async () => {
    if (!selectedId) return;
    try {
      switch (activeTab) {
        case 'fixtures':
        case 'results': {
          const data = await tournamentService.getFixtures(selectedId);
          setFixtures(data);
          break;
        }
        case 'standings':
        case 'statistics': {
          const data = await tournamentService.getStandings(selectedId);
          setStandings(data);
          break;
        }
        case 'scorers': {
          const data = await tournamentService.getTopScorers(selectedId);
          setScorers(data);
          break;
        }
        case 'assists': {
          const data = await tournamentService.getTopAssists(selectedId);
          setAssists(data);
          break;
        }
        case 'teams': {
          const data = await tournamentService.getStandings(selectedId);
          setStandings(data);
          break;
        }
      }
    } catch (err) {
      console.error('Failed to load tab data:', err);
    }
  };

  const handleMatchClick = useCallback((match) => {
    navigate(`/tournament/match/${match._id}`);
  }, [navigate]);

  const upcomingFixtures = fixtures.filter(f => f.status === 'UPCOMING' || f.status === 'POSTPONED');
  const completedFixtures = fixtures.filter(f => f.status === 'COMPLETED');
  const liveFixtures = fixtures.filter(f => f.status === 'LIVE' || f.status === 'HALF_TIME');

  // Group fixtures by round
  const groupByRound = (matches) => {
    const groups = {};
    for (const m of matches) {
      const key = `Round ${m.round}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    }
    return groups;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (tournaments.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h1 className="text-2xl font-display font-bold text-white mb-2">No Tournaments Yet</h1>
        <p className="text-gray-400">Tournaments will appear here once created by the admin.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Tournament Selector */}
      {tournaments.length > 1 && (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {tournaments.map(t => (
            <button
              key={t._id}
              onClick={() => { setSelectedId(t._id); setActiveTab('overview'); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                selectedId === t._id
                  ? 'bg-primary text-white'
                  : 'bg-dark-200 text-gray-400 hover:text-white hover:bg-dark-300'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-4 mb-6 border-b border-dark-50/50">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-primary/10 text-primary'
                : 'text-gray-400 hover:text-white hover:bg-dark-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && selectedId && (
            <TournamentDashboard tournamentId={selectedId} onMatchClick={handleMatchClick} />
          )}

          {activeTab === 'fixtures' && (
            <div className="space-y-6">
              {liveFixtures.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-red-400 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Live
                  </h2>
                  <div className="grid gap-3">
                    {liveFixtures.map(m => <FixtureCard key={m._id} match={m} onClick={handleMatchClick} />)}
                  </div>
                </div>
              )}
              {Object.entries(groupByRound(upcomingFixtures)).map(([round, matches]) => (
                <div key={round}>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">{round}</h3>
                  <div className="grid gap-3">
                    {matches.map(m => <FixtureCard key={m._id} match={m} onClick={handleMatchClick} />)}
                  </div>
                </div>
              ))}
              {upcomingFixtures.length === 0 && liveFixtures.length === 0 && (
                <div className="glass-card p-8 text-center text-gray-500">No upcoming fixtures</div>
              )}
            </div>
          )}

          {activeTab === 'results' && (
            <div className="space-y-6">
              {Object.entries(groupByRound(completedFixtures)).map(([round, matches]) => (
                <div key={round}>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">{round}</h3>
                  <div className="grid gap-3">
                    {matches.map(m => <FixtureCard key={m._id} match={m} onClick={handleMatchClick} />)}
                  </div>
                </div>
              ))}
              {completedFixtures.length === 0 && (
                <div className="glass-card p-8 text-center text-gray-500">No completed matches yet</div>
              )}
            </div>
          )}

          {activeTab === 'standings' && (
            <PointTable standings={standings} />
          )}

          {activeTab === 'teams' && (
            <TeamStats standings={standings} />
          )}

          {activeTab === 'scorers' && (
            <TopScorers scorers={scorers} limit={20} />
          )}

          {activeTab === 'assists' && (
            <TopAssists assists={assists} limit={20} />
          )}

          {activeTab === 'statistics' && (
            <div className="space-y-6">
              <TeamStats standings={standings} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TournamentHome;
