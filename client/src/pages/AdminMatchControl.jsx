import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Play, Pause, Square, Clock, Plus, X, Trash2,
  Target, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import tournamentService from '../services/tournamentService';
import { useSocket } from '../context/SocketContext';
import MatchTimeline from '../components/tournament/MatchTimeline';

const eventTypes = [
  { value: 'GOAL', label: 'Goal', icon: '⚽' },
  { value: 'YELLOW_CARD', label: 'Yellow Card', icon: '🟨' },
  { value: 'RED_CARD', label: 'Red Card', icon: '🟥' },
  { value: 'SUBSTITUTION', label: 'Substitution', icon: '🔄' },
];

const AdminMatchControl = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [match, setMatch] = useState(null);
  const [events, setEvents] = useState([]);
  const [players, setPlayers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEventForm, setShowEventForm] = useState(false);
  const [minuteInput, setMinuteInput] = useState(0);

  const [eventForm, setEventForm] = useState({
    teamId: '', playerId: '', playerName: '', type: 'GOAL',
    minute: 0, assistPlayerId: '', assistPlayerName: '',
    replacedPlayerId: '', replacedPlayerName: '',
  });

  useEffect(() => {
    loadMatch();
  }, [matchId]);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = (data) => {
      if (data.match?._id === matchId) {
        setMatch(data.match);
      }
    };
    const handleEvent = (data) => {
      if (data.match?._id === matchId) {
        setMatch(data.match);
        loadEvents();
      }
    };
    socket.on('match:updated', handleUpdate);
    socket.on('match:started', handleUpdate);
    socket.on('match:ended', handleUpdate);
    socket.on('match:event', handleEvent);
    socket.on('match:goal', handleEvent);
    return () => {
      socket.off('match:updated', handleUpdate);
      socket.off('match:started', handleUpdate);
      socket.off('match:ended', handleUpdate);
      socket.off('match:event', handleEvent);
      socket.off('match:goal', handleEvent);
    };
  }, [socket, matchId]);

  const loadMatch = async () => {
    try {
      setLoading(true);
      const [matchData, playersData] = await Promise.all([
        tournamentService.getMatch(matchId),
        tournamentService.getMatchPlayers(matchId),
      ]);
      setMatch(matchData.match);
      setEvents(matchData.events || []);
      setPlayers(playersData);
      setMinuteInput(matchData.match?.matchMinute || 0);
    } catch (err) {
      toast.error('Failed to load match');
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const evts = await tournamentService.getMatchEvents(matchId);
      setEvents(evts);
    } catch (err) {
      console.error('Failed to load events:', err);
    }
  };

  const handleStartMatch = async () => {
    try {
      const updated = await tournamentService.startMatch(matchId);
      setMatch(updated);
      toast.success('Match started!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start match');
    }
  };

  const handleHalfTime = async () => {
    try {
      const updated = await tournamentService.halfTime(matchId);
      setMatch(updated);
      toast.success('Half time!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleEndMatch = async () => {
    if (!window.confirm('End this match? This will finalize the result.')) return;
    try {
      const updated = await tournamentService.endMatch(matchId);
      setMatch(updated);
      toast.success('Match ended!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleResumeMatch = async () => {
    try {
      const updated = await tournamentService.startMatch(matchId);
      setMatch(updated);
      toast.success('Match resumed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleUpdateMinute = async () => {
    try {
      await tournamentService.updateMinute(matchId, minuteInput);
    } catch (err) {
      console.error('Failed to update minute');
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      await tournamentService.addMatchEvent(matchId, {
        ...eventForm,
        minute: eventForm.minute || minuteInput,
      });
      toast.success(`${eventForm.type.replace('_', ' ')} added!`);
      setShowEventForm(false);
      setEventForm({
        teamId: '', playerId: '', playerName: '', type: 'GOAL',
        minute: 0, assistPlayerId: '', assistPlayerName: '',
        replacedPlayerId: '', replacedPlayerName: '',
      });
      loadMatch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add event');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Delete this event? Score will be adjusted if it was a goal.')) return;
    try {
      const result = await tournamentService.deleteMatchEvent(matchId, eventId);
      if (result.match) setMatch(result.match);
      loadEvents();
      toast.success('Event deleted');
    } catch (err) {
      toast.error('Failed to delete event');
    }
  };

  const getTeamPlayers = (teamId) => {
    if (!players) return [];
    if (teamId === players.home?.teamId || teamId === players.home?.teamId?.toString()) {
      return players.home?.players || [];
    }
    return players.away?.players || [];
  };

  const openEventForm = (type = 'GOAL') => {
    setEventForm({
      teamId: '', playerId: '', playerName: '', type,
      minute: minuteInput, assistPlayerId: '', assistPlayerName: '',
      replacedPlayerId: '', replacedPlayerName: '',
    });
    setShowEventForm(true);
  };

  if (loading || !match) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const homeTeam = match.homeTeamId?.team || 'Home';
  const awayTeam = match.awayTeamId?.team || 'Away';
  const isLive = match.status === 'LIVE';
  const isHalfTime = match.status === 'HALF_TIME';
  const isCompleted = match.status === 'COMPLETED';
  const isUpcoming = match.status === 'UPCOMING';
  const canAddEvents = isLive || isHalfTime;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/fixtures')}
          className="p-2 text-gray-400 hover:text-white hover:bg-dark-200 rounded-lg transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-display font-bold text-white">Match Control</h1>
          <p className="text-xs text-gray-500">Round {match.round} • Match {match.matchNumber}</p>
        </div>
      </div>

      {/* Score Board */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass-card p-6 ${isLive ? 'border-red-500/30 shadow-lg shadow-red-500/5' : ''}`}
      >
        {/* Status indicator */}
        <div className="text-center mb-4">
          <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
            isLive ? 'bg-red-500/20 text-red-400 animate-pulse' :
            isHalfTime ? 'bg-yellow-500/20 text-yellow-400' :
            isCompleted ? 'bg-green-500/20 text-green-400' :
            'bg-blue-500/20 text-blue-400'
          }`}>
            {match.status.replace('_', ' ')}
          </span>
        </div>

        {/* Score display */}
        <div className="flex items-center justify-center gap-8">
          <div className="text-center flex-1">
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
              <span className="text-xl font-bold text-primary">{homeTeam[0]}</span>
            </div>
            <h3 className="font-semibold text-white">{homeTeam}</h3>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-4xl font-bold font-mono text-white">{match.homeScore}</span>
            <span className="text-xl text-gray-600">-</span>
            <span className="text-4xl font-bold font-mono text-white">{match.awayScore}</span>
          </div>

          <div className="text-center flex-1">
            <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-2">
              <span className="text-xl font-bold text-blue-400">{awayTeam[0]}</span>
            </div>
            <h3 className="font-semibold text-white">{awayTeam}</h3>
          </div>
        </div>

        {/* Match minute */}
        {(isLive || isHalfTime) && (
          <div className="flex items-center justify-center gap-3 mt-4">
            <Clock className="w-4 h-4 text-gray-400" />
            <input
              type="number"
              value={minuteInput}
              onChange={(e) => setMinuteInput(Number(e.target.value))}
              onBlur={handleUpdateMinute}
              className="w-20 bg-dark-200 border border-dark-50 text-white text-center px-2 py-1 rounded-lg text-lg font-mono"
              min="0"
              max="120"
            />
            <span className="text-gray-400 text-sm">min</span>
          </div>
        )}
      </motion.div>

      {/* Match Controls */}
      <div className="glass-card p-4">
        <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-3">Match Controls</h3>
        <div className="flex flex-wrap gap-3">
          {isUpcoming && (
            <button onClick={handleStartMatch} className="btn-primary flex items-center gap-2 !text-sm">
              <Play className="w-4 h-4" /> Start Match
            </button>
          )}
          {isLive && (
            <>
              <button onClick={handleHalfTime} className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-xl text-sm font-medium hover:bg-yellow-500/30 transition-all">
                <Pause className="w-4 h-4" /> Half Time
              </button>
              <button onClick={handleEndMatch} className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/30 transition-all">
                <Square className="w-4 h-4" /> End Match
              </button>
            </>
          )}
          {isHalfTime && (
            <>
              <button onClick={handleResumeMatch} className="btn-primary flex items-center gap-2 !text-sm">
                <Play className="w-4 h-4" /> Resume (2nd Half)
              </button>
              <button onClick={handleEndMatch} className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/30 transition-all">
                <Square className="w-4 h-4" /> End Match
              </button>
            </>
          )}
          {isCompleted && (
            <div className="text-sm text-green-400 flex items-center gap-2">
              ✓ Match completed
            </div>
          )}
        </div>
      </div>

      {/* Event Buttons */}
      {canAddEvents && (
        <div className="glass-card p-4">
          <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-3">Add Event</h3>
          <div className="flex flex-wrap gap-3">
            {eventTypes.map(et => (
              <button
                key={et.value}
                onClick={() => openEventForm(et.value)}
                className="flex items-center gap-2 px-4 py-2.5 bg-dark-200 hover:bg-dark-300 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all border border-dark-50"
              >
                <span className="text-base">{et.icon}</span>
                {et.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Event Form Modal */}
      <AnimatePresence>
        {showEventForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowEventForm(false); }}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="glass-card p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-white flex items-center gap-2">
                  <span className="text-lg">{eventTypes.find(e => e.value === eventForm.type)?.icon}</span>
                  Add {eventTypes.find(e => e.value === eventForm.type)?.label}
                </h2>
                <button onClick={() => setShowEventForm(false)} className="p-2 text-gray-400 hover:text-white rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddEvent} className="space-y-4">
                {/* Event type */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Event Type</label>
                  <select
                    value={eventForm.type}
                    onChange={(e) => setEventForm(p => ({ ...p, type: e.target.value }))}
                    className="input-field"
                  >
                    {eventTypes.map(et => (
                      <option key={et.value} value={et.value}>{et.icon} {et.label}</option>
                    ))}
                  </select>
                </div>

                {/* Team */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Team *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEventForm(p => ({ ...p, teamId: match.homeTeamId?._id, playerId: '', playerName: '' }))}
                      className={`px-3 py-2 rounded-xl text-sm transition-all ${
                        eventForm.teamId === match.homeTeamId?._id
                          ? 'bg-primary/20 text-primary border border-primary/30'
                          : 'bg-dark-200 text-gray-400 border border-transparent'
                      }`}
                    >
                      {homeTeam}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEventForm(p => ({ ...p, teamId: match.awayTeamId?._id, playerId: '', playerName: '' }))}
                      className={`px-3 py-2 rounded-xl text-sm transition-all ${
                        eventForm.teamId === match.awayTeamId?._id
                          ? 'bg-primary/20 text-primary border border-primary/30'
                          : 'bg-dark-200 text-gray-400 border border-transparent'
                      }`}
                    >
                      {awayTeam}
                    </button>
                  </div>
                </div>

                {/* Player */}
                {eventForm.teamId && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Player *</label>
                    <select
                      value={eventForm.playerId}
                      onChange={(e) => {
                        const selected = getTeamPlayers(eventForm.teamId).find(p => (p.playerId?._id || p.playerId) === e.target.value || p.playerId === e.target.value);
                        setEventForm(p => ({
                          ...p,
                          playerId: e.target.value,
                          playerName: selected?.playerName || '',
                        }));
                      }}
                      className="input-field"
                      required
                    >
                      <option value="">Select player</option>
                      {getTeamPlayers(eventForm.teamId).map(p => (
                        <option key={p.playerId?._id || p.playerId} value={p.playerId?._id || p.playerId}>
                          {p.playerName} {p.position ? `(${p.position})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Minute */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Minute</label>
                  <input
                    type="number"
                    value={eventForm.minute}
                    onChange={(e) => setEventForm(p => ({ ...p, minute: Number(e.target.value) }))}
                    className="input-field"
                    min="0"
                    max="120"
                  />
                </div>

                {/* Assist (for goals) */}
                {eventForm.type === 'GOAL' && eventForm.teamId && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Assist Player (optional)</label>
                    <select
                      value={eventForm.assistPlayerId}
                      onChange={(e) => {
                        const selected = getTeamPlayers(eventForm.teamId).find(p => (p.playerId?._id || p.playerId) === e.target.value || p.playerId === e.target.value);
                        setEventForm(p => ({
                          ...p,
                          assistPlayerId: e.target.value,
                          assistPlayerName: selected?.playerName || '',
                        }));
                      }}
                      className="input-field"
                    >
                      <option value="">No assist</option>
                      {getTeamPlayers(eventForm.teamId)
                        .filter(p => (p.playerId?._id || p.playerId) !== eventForm.playerId)
                        .map(p => (
                          <option key={p.playerId?._id || p.playerId} value={p.playerId?._id || p.playerId}>
                            {p.playerName}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {/* Substitution replacement */}
                {eventForm.type === 'SUBSTITUTION' && eventForm.teamId && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Player Going Off</label>
                    <select
                      value={eventForm.replacedPlayerId}
                      onChange={(e) => {
                        const selected = getTeamPlayers(eventForm.teamId).find(p => (p.playerId?._id || p.playerId) === e.target.value || p.playerId === e.target.value);
                        setEventForm(p => ({
                          ...p,
                          replacedPlayerId: e.target.value,
                          replacedPlayerName: selected?.playerName || '',
                        }));
                      }}
                      className="input-field"
                    >
                      <option value="">Select player</option>
                      {getTeamPlayers(eventForm.teamId)
                        .filter(p => (p.playerId?._id || p.playerId) !== eventForm.playerId)
                        .map(p => (
                          <option key={p.playerId?._id || p.playerId} value={p.playerId?._id || p.playerId}>
                            {p.playerName}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!eventForm.teamId || !eventForm.playerId}
                  className="btn-primary w-full !text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Event
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Match Timeline & Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-3">Timeline</h3>
          <MatchTimeline events={events} homeTeamId={match.homeTeamId?._id} />
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-3">Events ({events.length})</h3>
          <div className="glass-card divide-y divide-dark-50/30">
            {events.length > 0 ? events.map(event => (
              <div key={event._id} className="flex items-center justify-between px-4 py-3 hover:bg-dark-200/50">
                <div className="flex items-center gap-3">
                  <span className="text-primary font-mono font-bold text-sm w-10">{event.minute}'</span>
                  <span className="text-base">{
                    event.type === 'GOAL' ? '⚽' :
                    event.type === 'YELLOW_CARD' ? '🟨' :
                    event.type === 'RED_CARD' ? '🟥' : '🔄'
                  }</span>
                  <div>
                    <div className="text-sm text-white">{event.playerName}</div>
                    {event.assistPlayerName && (
                      <div className="text-xs text-gray-500">Assist: {event.assistPlayerName}</div>
                    )}
                  </div>
                </div>
                {!isCompleted && (
                  <button
                    onClick={() => handleDeleteEvent(event._id)}
                    className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )) : (
              <div className="p-4 text-center text-gray-500 text-sm">No events recorded</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMatchControl;
