import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, Clock } from 'lucide-react';
import tournamentService from '../services/tournamentService';
import { useSocket } from '../context/SocketContext';
import MatchTimeline from '../components/tournament/MatchTimeline';

const MatchCenter = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [match, setMatch] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatch();
  }, [matchId]);

  useEffect(() => {
    if (!socket) return;

    const handleMatchUpdate = (data) => {
      if (data.match?._id === matchId) {
        setMatch(data.match);
      }
    };

    const handleEvent = (data) => {
      if (data.match?._id === matchId) {
        setMatch(data.match);
        if (data.event) {
          setEvents(prev => [...prev, data.event].sort((a, b) => a.minute - b.minute));
        }
      }
    };

    socket.on('match:updated', handleMatchUpdate);
    socket.on('match:started', handleMatchUpdate);
    socket.on('match:ended', handleMatchUpdate);
    socket.on('match:event', handleEvent);
    socket.on('match:goal', handleEvent);

    return () => {
      socket.off('match:updated', handleMatchUpdate);
      socket.off('match:started', handleMatchUpdate);
      socket.off('match:ended', handleMatchUpdate);
      socket.off('match:event', handleEvent);
      socket.off('match:goal', handleEvent);
    };
  }, [socket, matchId]);

  const loadMatch = async () => {
    try {
      setLoading(true);
      const data = await tournamentService.getMatch(matchId);
      setMatch(data.match);
      setEvents(data.events || []);
    } catch (err) {
      console.error('Failed to load match:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'LIVE': return { label: 'LIVE', class: 'bg-red-500/20 text-red-400 animate-pulse' };
      case 'HALF_TIME': return { label: 'HALF TIME', class: 'bg-yellow-500/20 text-yellow-400' };
      case 'COMPLETED': return { label: 'FULL TIME', class: 'bg-green-500/20 text-green-400' };
      case 'POSTPONED': return { label: 'POSTPONED', class: 'bg-gray-500/20 text-gray-400' };
      case 'CANCELLED': return { label: 'CANCELLED', class: 'bg-red-500/20 text-red-400' };
      default: return { label: 'UPCOMING', class: 'bg-blue-500/20 text-blue-400' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-400">Match not found.</p>
      </div>
    );
  }

  const statusInfo = getStatusInfo(match.status);
  const homeTeam = match.homeTeamId?.team || 'Home';
  const awayTeam = match.awayTeamId?.team || 'Away';
  const isLive = match.status === 'LIVE' || match.status === 'HALF_TIME';
  const isFinished = match.status === 'COMPLETED';

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/tournament')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Tournament
      </button>

      {/* Tournament name */}
      {match.tournamentId && (
        <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">
          {match.tournamentId.name || 'Tournament'}
        </div>
      )}

      {/* Match Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass-card p-8 mb-6 ${isLive ? 'border-red-500/30 shadow-lg shadow-red-500/5' : ''}`}
      >
        {/* Status */}
        <div className="text-center mb-6">
          <span className={`text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full ${statusInfo.class}`}>
            {statusInfo.label}
          </span>
          {isLive && match.matchMinute > 0 && (
            <div className="mt-2 text-2xl font-mono font-bold text-red-400">
              {match.matchMinute}'
            </div>
          )}
        </div>

        {/* Score */}
        <div className="flex items-center justify-center gap-6 md:gap-12">
          {/* Home */}
          <div className="text-center flex-1">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-primary">{homeTeam[0]}</span>
            </div>
            <h2 className={`font-display font-bold text-lg ${isFinished && match.homeScore > match.awayScore ? 'text-white' : 'text-gray-300'}`}>
              {homeTeam}
            </h2>
          </div>

          {/* Score Center */}
          <div className="text-center px-4">
            {isFinished || isLive ? (
              <div className="flex items-center gap-4">
                <span className={`text-5xl md:text-6xl font-bold font-mono ${match.homeScore > match.awayScore ? 'text-white' : 'text-gray-500'}`}>
                  {match.homeScore}
                </span>
                <span className="text-2xl text-gray-600">-</span>
                <span className={`text-5xl md:text-6xl font-bold font-mono ${match.awayScore > match.homeScore ? 'text-white' : 'text-gray-500'}`}>
                  {match.awayScore}
                </span>
              </div>
            ) : (
              <div className="text-3xl font-bold text-gray-500">VS</div>
            )}
          </div>

          {/* Away */}
          <div className="text-center flex-1">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-blue-400">{awayTeam[0]}</span>
            </div>
            <h2 className={`font-display font-bold text-lg ${isFinished && match.awayScore > match.homeScore ? 'text-white' : 'text-gray-300'}`}>
              {awayTeam}
            </h2>
          </div>
        </div>

        {/* Match info footer */}
        <div className="flex items-center justify-center gap-4 mt-6 text-xs text-gray-500">
          {match.matchDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {formatDate(match.matchDate)}
            </div>
          )}
          {match.kickoffTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {match.kickoffTime}
            </div>
          )}
          {match.venue && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {match.venue}
            </div>
          )}
        </div>
      </motion.div>

      {/* Match Timeline */}
      <MatchTimeline events={events} homeTeamId={match.homeTeamId?._id} />

      {/* Goal Scorers Summary */}
      {events.filter(e => e.type === 'GOAL').length > 0 && (
        <div className="glass-card p-4 mt-6">
          <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-3">Goal Scorers</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Home goals */}
            <div className="space-y-1">
              {events
                .filter(e => e.type === 'GOAL' && (e.teamId === match.homeTeamId?._id || e.teamId?.toString() === match.homeTeamId?._id?.toString()))
                .map((e, i) => (
                  <div key={i} className="text-sm text-gray-300">
                    ⚽ {e.playerName} <span className="text-gray-500">{e.minute}'</span>
                  </div>
                ))}
            </div>
            {/* Away goals */}
            <div className="space-y-1 text-right">
              {events
                .filter(e => e.type === 'GOAL' && (e.teamId === match.awayTeamId?._id || e.teamId?.toString() === match.awayTeamId?._id?.toString()))
                .map((e, i) => (
                  <div key={i} className="text-sm text-gray-300">
                    <span className="text-gray-500">{e.minute}'</span> {e.playerName} ⚽
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchCenter;
