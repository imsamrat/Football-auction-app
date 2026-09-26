import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Wand2, Trash2, Edit3, X, MapPin, Clock, Plus, ArrowRightLeft, Play } from 'lucide-react';
import toast from 'react-hot-toast';
import tournamentService from '../services/tournamentService';
import FixtureCard from '../components/tournament/FixtureCard';
import ConfirmModal from '../components/ConfirmModal';

const AdminFixtures = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editMatch, setEditMatch] = useState(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState(null);

  // Auto-generate form state
  const [generateForm, setGenerateForm] = useState({
    defaultVenue: '',
    startDate: '',
    matchesPerDay: 2,
    kickoffTimes: ['16:00', '18:00'],
  });

  // Manual fixture form state
  const [manualForm, setManualForm] = useState({
    homeTeamId: '',
    awayTeamId: '',
    round: 1,
    matchNumber: 1,
    matchDate: '',
    kickoffTime: '16:00',
    venue: '',
  });

  useEffect(() => {
    loadTournaments();
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      loadFixtures();
    }
  }, [selectedTournament]);

  const loadTournaments = async () => {
    try {
      const data = await tournamentService.getTournaments();
      setTournaments(data);
      if (data.length > 0) {
        const ongoing = data.find(t => t.status === 'ONGOING');
        setSelectedTournament(ongoing || data[0]);
      }
    } catch (err) {
      toast.error('Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  };

  const loadFixtures = async () => {
    try {
      const data = await tournamentService.getFixtures(selectedTournament._id);
      setFixtures(data);
    } catch (err) {
      console.error('Failed to load fixtures:', err);
    }
  };

  // Open manual fixture modal with smart defaults
  const handleOpenManualModal = () => {
    const teams = selectedTournament?.teams || [];
    const maxRound = fixtures.length > 0 ? Math.max(...fixtures.map(f => f.round || 1)) : 1;
    const maxMatchNum = fixtures.length > 0 ? Math.max(...fixtures.map(f => f.matchNumber || 0)) : 0;
    const lastVenue = fixtures.find(f => f.venue)?.venue || 'Tex Sports Ground';

    setManualForm({
      homeTeamId: teams[0]?._id || '',
      awayTeamId: teams[1]?._id || '',
      round: maxRound,
      matchNumber: maxMatchNum + 1,
      matchDate: new Date().toISOString().slice(0, 10),
      kickoffTime: '16:00',
      venue: lastVenue,
    });
    setShowManualForm(true);
  };

  // Create manual fixture
  const handleCreateManualFixture = async (e) => {
    e.preventDefault();
    if (!manualForm.homeTeamId || !manualForm.awayTeamId) {
      toast.error('Please select both Home and Away teams');
      return;
    }
    if (manualForm.homeTeamId === manualForm.awayTeamId) {
      toast.error('Home and Away teams must be different');
      return;
    }

    try {
      await tournamentService.createMatch({
        tournamentId: selectedTournament._id,
        homeTeamId: manualForm.homeTeamId,
        awayTeamId: manualForm.awayTeamId,
        round: Number(manualForm.round) || 1,
        matchNumber: Number(manualForm.matchNumber) || (fixtures.length + 1),
        matchDate: manualForm.matchDate ? new Date(manualForm.matchDate).toISOString() : null,
        kickoffTime: manualForm.kickoffTime,
        venue: manualForm.venue,
      });
      toast.success('Manual fixture added successfully!');
      setShowManualForm(false);
      loadFixtures();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create fixture');
    }
  };

  // Auto-generate fixtures
  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      await tournamentService.generateFixtures(selectedTournament._id, generateForm);
      toast.success('Fixtures generated automatically!');
      setShowGenerateForm(false);
      loadFixtures();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate fixtures');
    }
  };

  // Delete all fixtures
  const handleDeleteAll = async () => {
    try {
      await tournamentService.deleteFixtures(selectedTournament._id);
      toast.success('All fixtures deleted');
      setConfirmDeleteAll(false);
      setFixtures([]);
    } catch (err) {
      toast.error('Failed to delete fixtures');
    }
  };

  // Delete a single fixture
  const handleDeleteSingleMatch = async () => {
    if (!matchToDelete) return;
    try {
      await tournamentService.deleteMatch(matchToDelete._id);
      toast.success('Fixture deleted');
      setMatchToDelete(null);
      if (showEditForm && editMatch?._id === matchToDelete._id) {
        setShowEditForm(false);
        setEditMatch(null);
      }
      loadFixtures();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete fixture');
    }
  };

  // Open edit modal
  const openEditModal = (match) => {
    setEditMatch({
      ...match,
      homeTeamId: match.homeTeamId?._id || match.homeTeamId,
      awayTeamId: match.awayTeamId?._id || match.awayTeamId,
      matchDate: match.matchDate ? match.matchDate.slice(0, 10) : '',
      kickoffTime: match.kickoffTime || '',
      venue: match.venue || '',
      round: match.round || 1,
      matchNumber: match.matchNumber || 1,
      status: match.status || 'UPCOMING',
    });
    setShowEditForm(true);
  };

  // Update fixture
  const handleEditMatch = async (e) => {
    e.preventDefault();
    if (editMatch.homeTeamId === editMatch.awayTeamId) {
      toast.error('Home and Away teams must be different');
      return;
    }
    try {
      await tournamentService.updateMatch(editMatch._id, {
        homeTeamId: editMatch.homeTeamId,
        awayTeamId: editMatch.awayTeamId,
        matchDate: editMatch.matchDate ? new Date(editMatch.matchDate).toISOString() : null,
        kickoffTime: editMatch.kickoffTime,
        venue: editMatch.venue,
        round: Number(editMatch.round),
        matchNumber: Number(editMatch.matchNumber),
        status: editMatch.status,
      });
      toast.success('Fixture updated successfully');
      setShowEditForm(false);
      setEditMatch(null);
      loadFixtures();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update fixture');
    }
  };

  const handleMatchClick = (match) => {
    if (match.status === 'LIVE' || match.status === 'HALF_TIME' || match.status === 'COMPLETED') {
      navigate(`/admin/match-control/${match._id}`);
    } else {
      openEditModal(match);
    }
  };

  // Helper to swap home and away teams
  const swapTeamsInForm = (setter) => {
    setter(prev => ({
      ...prev,
      homeTeamId: prev.awayTeamId,
      awayTeamId: prev.homeTeamId,
    }));
  };

  // Group fixtures by round
  const roundGroups = {};
  for (const f of fixtures) {
    const key = `Round ${f.round}`;
    if (!roundGroups[key]) roundGroups[key] = [];
    roundGroups[key].push(f);
  }

  const teams = selectedTournament?.teams || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Automatic and Manual Options */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Fixtures</h1>
          <p className="text-sm text-gray-400 mt-1">Manage tournament fixtures automatically or manually</p>
        </div>

        {/* Action Buttons: Auto vs Manual */}
        <div className="flex items-center flex-wrap gap-2.5">
          {fixtures.length > 0 && (
            <button
              onClick={() => setConfirmDeleteAll(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all"
              title="Delete all fixtures for this tournament"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete All
            </button>
          )}

          {/* Manual Option */}
          <button
            onClick={handleOpenManualModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-dark-200 text-white hover:bg-dark-100 hover:border-primary/50 border border-white/10 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Manual Fixture</span>
          </button>

          {/* Automatic Option */}
          <button
            onClick={() => setShowGenerateForm(true)}
            className="btn-primary flex items-center gap-2 !text-sm shadow-lg shadow-primary/20"
          >
            <Wand2 className="w-4 h-4" />
            <span>Auto Generate</span>
          </button>
        </div>
      </div>

      {/* Tournament selector */}
      {tournaments.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {tournaments.map(t => (
            <button
              key={t._id}
              onClick={() => setSelectedTournament(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                selectedTournament?._id === t._id
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-dark-200 text-gray-400 hover:text-white'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      {/* Fixtures by round */}
      {Object.keys(roundGroups).length > 0 ? (
        Object.entries(roundGroups).map(([round, matches]) => (
          <div key={round} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <span>{round}</span>
                <span className="text-xs font-normal text-gray-600">({matches.length} {matches.length === 1 ? 'match' : 'matches'})</span>
              </h3>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {matches.map(match => (
                <div key={match._id} className="relative group">
                  <FixtureCard match={match} onClick={handleMatchClick} />
                  
                  {/* Card quick actions on hover */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(match);
                      }}
                      className="p-1.5 rounded-lg bg-dark-100/90 text-gray-300 hover:text-white hover:bg-dark-200 border border-white/10 transition-all shadow-md"
                      title="Edit Fixture"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMatchToDelete(match);
                      }}
                      className="p-1.5 rounded-lg bg-dark-100/90 text-red-400 hover:text-red-300 hover:bg-red-500/20 border border-white/10 transition-all shadow-md"
                      title="Delete Fixture"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        /* Empty State with Both Options */
        <div className="glass-card p-12 text-center max-w-xl mx-auto space-y-4">
          <Calendar className="w-14 h-14 text-gray-600 mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-white">No fixtures created yet</h3>
            <p className="text-xs text-gray-400 mt-1">
              Choose whether you want to automatically generate a round-robin schedule or add fixtures manually.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleOpenManualModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-dark-200 text-white hover:bg-dark-100 border border-white/10 transition-all"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Manual Fixture</span>
            </button>
            <button
              onClick={() => setShowGenerateForm(true)}
              className="btn-primary flex items-center gap-2 !text-sm"
            >
              <Wand2 className="w-4 h-4" />
              <span>Auto Generate</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. AUTO-GENERATE FIXTURES MODAL */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showGenerateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowGenerateForm(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="glass-card p-6 w-full max-w-md border border-white/10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/20 text-primary">
                    <Wand2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-white">Automatic Generator</h2>
                    <p className="text-xs text-gray-400">Generate round-robin fixtures automatically</p>
                  </div>
                </div>
                <button onClick={() => setShowGenerateForm(false)} className="p-2 text-gray-400 hover:text-white rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-dark-200 rounded-xl text-xs space-y-1">
                <div className="text-gray-400">Tournament: <span className="text-white font-medium">{selectedTournament?.name}</span></div>
                <div className="text-gray-400">Teams: <span className="text-white font-medium">{teams.length} teams</span></div>
                <div className="text-gray-400">Schedule Type: <span className="text-primary font-medium capitalize">{selectedTournament?.roundRobinType?.toLowerCase()} Round Robin</span></div>
              </div>

              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Default Venue</label>
                  <input
                    value={generateForm.defaultVenue}
                    onChange={(e) => setGenerateForm(p => ({ ...p, defaultVenue: e.target.value }))}
                    className="input-field"
                    placeholder="e.g. Tex Sports Ground"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={generateForm.startDate}
                      onChange={(e) => setGenerateForm(p => ({ ...p, startDate: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Matches Per Day</label>
                    <input
                      type="number"
                      value={generateForm.matchesPerDay}
                      onChange={(e) => setGenerateForm(p => ({ ...p, matchesPerDay: Number(e.target.value) }))}
                      className="input-field"
                      min="1"
                      max="10"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="btn-primary flex-1 !text-sm">
                    Generate Fixtures
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGenerateForm(false)}
                    className="btn-dark !text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* 2. MANUAL ADD FIXTURE MODAL */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showManualForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowManualForm(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="glass-card p-6 w-full max-w-lg border border-white/10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-white">Add Manual Fixture</h2>
                    <p className="text-xs text-gray-400">Manually schedule a match between two teams</p>
                  </div>
                </div>
                <button onClick={() => setShowManualForm(false)} className="p-2 text-gray-400 hover:text-white rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateManualFixture} className="space-y-4">
                {/* Team selection with Swap button */}
                <div className="p-3 bg-dark-200/80 rounded-xl border border-white/5 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-400 mb-1 font-medium">Home Team *</label>
                      <select
                        value={manualForm.homeTeamId}
                        onChange={(e) => setManualForm(p => ({ ...p, homeTeamId: e.target.value }))}
                        className="input-field text-sm"
                        required
                      >
                        <option value="">Select Home Team</option>
                        {teams.map(t => (
                          <option key={t._id} value={t._id}>
                            {t.team || t.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex justify-center md:col-span-1 pt-4">
                      <button
                        type="button"
                        onClick={() => swapTeamsInForm(setManualForm)}
                        className="p-2 rounded-lg bg-dark-100 hover:bg-dark-300 text-gray-400 hover:text-white border border-white/10 transition-all"
                        title="Swap Home and Away teams"
                      >
                        <ArrowRightLeft className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-400 mb-1 font-medium">Away Team *</label>
                      <select
                        value={manualForm.awayTeamId}
                        onChange={(e) => setManualForm(p => ({ ...p, awayTeamId: e.target.value }))}
                        className="input-field text-sm"
                        required
                      >
                        <option value="">Select Away Team</option>
                        {teams.map(t => (
                          <option key={t._id} value={t._id}>
                            {t.team || t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Round & Match Number */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Round Number *</label>
                    <input
                      type="number"
                      value={manualForm.round}
                      onChange={(e) => setManualForm(p => ({ ...p, round: e.target.value }))}
                      className="input-field"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Match Number</label>
                    <input
                      type="number"
                      value={manualForm.matchNumber}
                      onChange={(e) => setManualForm(p => ({ ...p, matchNumber: e.target.value }))}
                      className="input-field"
                      min="1"
                    />
                  </div>
                </div>

                {/* Date & Kickoff Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Match Date</label>
                    <input
                      type="date"
                      value={manualForm.matchDate}
                      onChange={(e) => setManualForm(p => ({ ...p, matchDate: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Kickoff Time</label>
                    <input
                      type="text"
                      value={manualForm.kickoffTime}
                      onChange={(e) => setManualForm(p => ({ ...p, kickoffTime: e.target.value }))}
                      className="input-field"
                      placeholder="e.g. 16:00"
                    />
                  </div>
                </div>

                {/* Venue */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Venue</label>
                  <input
                    value={manualForm.venue}
                    onChange={(e) => setManualForm(p => ({ ...p, venue: e.target.value }))}
                    className="input-field"
                    placeholder="e.g. Tex Sports Ground"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" className="btn-primary flex-1 !text-sm">
                    Create Fixture
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowManualForm(false)}
                    className="btn-dark !text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* 3. EDIT FIXTURE MODAL */}
      {/* ============================================================ */}
      <AnimatePresence>
        {showEditForm && editMatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) { setShowEditForm(false); setEditMatch(null); } }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="glass-card p-6 w-full max-w-lg border border-white/10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-white">Edit Fixture</h2>
                    <p className="text-xs text-gray-400">Update match details, teams, or schedule</p>
                  </div>
                </div>
                <button onClick={() => { setShowEditForm(false); setEditMatch(null); }} className="p-2 text-gray-400 hover:text-white rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditMatch} className="space-y-4">
                {/* Team selection with Swap */}
                <div className="p-3 bg-dark-200/80 rounded-xl border border-white/5 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-400 mb-1 font-medium">Home Team</label>
                      <select
                        value={editMatch.homeTeamId}
                        onChange={(e) => setEditMatch(p => ({ ...p, homeTeamId: e.target.value }))}
                        className="input-field text-sm"
                        required
                      >
                        {teams.map(t => (
                          <option key={t._id} value={t._id}>
                            {t.team || t.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex justify-center md:col-span-1 pt-4">
                      <button
                        type="button"
                        onClick={() => swapTeamsInForm(setEditMatch)}
                        className="p-2 rounded-lg bg-dark-100 hover:bg-dark-300 text-gray-400 hover:text-white border border-white/10 transition-all"
                        title="Swap Home and Away teams"
                      >
                        <ArrowRightLeft className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-400 mb-1 font-medium">Away Team</label>
                      <select
                        value={editMatch.awayTeamId}
                        onChange={(e) => setEditMatch(p => ({ ...p, awayTeamId: e.target.value }))}
                        className="input-field text-sm"
                        required
                      >
                        {teams.map(t => (
                          <option key={t._id} value={t._id}>
                            {t.team || t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Round & Match Number */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Round</label>
                    <input
                      type="number"
                      value={editMatch.round}
                      onChange={(e) => setEditMatch(p => ({ ...p, round: e.target.value }))}
                      className="input-field"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Match Number</label>
                    <input
                      type="number"
                      value={editMatch.matchNumber}
                      onChange={(e) => setEditMatch(p => ({ ...p, matchNumber: e.target.value }))}
                      className="input-field"
                      min="1"
                    />
                  </div>
                </div>

                {/* Date & Kickoff Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Date</label>
                    <input
                      type="date"
                      value={editMatch.matchDate}
                      onChange={(e) => setEditMatch(p => ({ ...p, matchDate: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Kickoff Time</label>
                    <input
                      value={editMatch.kickoffTime}
                      onChange={(e) => setEditMatch(p => ({ ...p, kickoffTime: e.target.value }))}
                      className="input-field"
                      placeholder="16:00"
                    />
                  </div>
                </div>

                {/* Venue & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Venue</label>
                    <input
                      value={editMatch.venue}
                      onChange={(e) => setEditMatch(p => ({ ...p, venue: e.target.value }))}
                      className="input-field"
                      placeholder="Stadium name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Status</label>
                    <select
                      value={editMatch.status}
                      onChange={(e) => setEditMatch(p => ({ ...p, status: e.target.value }))}
                      className="input-field"
                    >
                      <option value="UPCOMING">Upcoming</option>
                      <option value="POSTPONED">Postponed</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button type="submit" className="btn-primary flex-1 !text-sm">
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigate(`/admin/match-control/${editMatch._id}`);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 transition-all"
                  >
                    <Play className="w-3.5 h-3.5" /> Match Control
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMatchToDelete(editMatch);
                    }}
                    className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all"
                    title="Delete this match"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete All Confirmation Modal */}
      {confirmDeleteAll && (
        <ConfirmModal
          title="Delete All Fixtures"
          message="This will permanently delete ALL fixtures and match events for this tournament. This cannot be undone."
          confirmLabel="Delete All"
          onConfirm={handleDeleteAll}
          onCancel={() => setConfirmDeleteAll(false)}
        />
      )}

      {/* Delete Single Match Confirmation Modal */}
      {matchToDelete && (
        <ConfirmModal
          title="Delete Fixture"
          message={`Are you sure you want to delete Match ${matchToDelete.matchNumber || ''}: ${matchToDelete.homeTeamId?.team || 'Home'} vs ${matchToDelete.awayTeamId?.team || 'Away'}?`}
          confirmLabel="Delete Fixture"
          onConfirm={handleDeleteSingleMatch}
          onCancel={() => setMatchToDelete(null)}
        />
      )}
    </div>
  );
};

export default AdminFixtures;
