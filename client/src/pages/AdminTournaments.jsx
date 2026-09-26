import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Plus, Edit3, Trash2, Users, X, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import tournamentService from '../services/tournamentService';
import ConfirmModal from '../components/ConfirmModal';

const formatOptions = [
  { value: 'LEAGUE', label: 'League' },
  { value: 'KNOCKOUT', label: 'Knockout' },
  { value: 'LEAGUE_AND_KNOCKOUT', label: 'League & Knockout' },
];

const statusOptions = [
  { value: 'UPCOMING', label: 'Upcoming' },
  { value: 'ONGOING', label: 'Ongoing' },
  { value: 'COMPLETED', label: 'Completed' },
];

const defaultForm = {
  name: '', season: '', format: 'LEAGUE', status: 'UPCOMING',
  startDate: '', endDate: '', pointsForWin: 3, pointsForDraw: 1,
  pointsForLoss: 0, roundRobinType: 'SINGLE', teams: [],
};

const AdminTournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [availableTeams, setAvailableTeams] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tourns, teams] = await Promise.all([
        tournamentService.getTournaments(),
        tournamentService.getAvailableTeams(),
      ]);
      setTournaments(tourns);
      setAvailableTeams(teams);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      };

      if (editingId) {
        await tournamentService.updateTournament(editingId, payload);
        toast.success('Tournament updated');
      } else {
        await tournamentService.createTournament(payload);
        toast.success('Tournament created');
      }
      setShowForm(false);
      setEditingId(null);
      setForm(defaultForm);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleEdit = (tournament) => {
    setForm({
      name: tournament.name,
      season: tournament.season || '',
      format: tournament.format,
      status: tournament.status,
      startDate: tournament.startDate ? tournament.startDate.slice(0, 10) : '',
      endDate: tournament.endDate ? tournament.endDate.slice(0, 10) : '',
      pointsForWin: tournament.pointsForWin,
      pointsForDraw: tournament.pointsForDraw,
      pointsForLoss: tournament.pointsForLoss,
      roundRobinType: tournament.roundRobinType || 'SINGLE',
      teams: tournament.teams?.map(t => t._id || t) || [],
    });
    setEditingId(tournament._id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    try {
      await tournamentService.deleteTournament(deleteId);
      toast.success('Tournament deleted');
      setDeleteId(null);
      loadData();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const toggleTeam = (teamId) => {
    setForm(prev => ({
      ...prev,
      teams: prev.teams.includes(teamId)
        ? prev.teams.filter(id => id !== teamId)
        : [...prev.teams, teamId],
    }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ONGOING': return 'bg-green-500/20 text-green-400';
      case 'COMPLETED': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-blue-500/20 text-blue-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Tournaments</h1>
          <p className="text-sm text-gray-400 mt-1">Manage football tournaments</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(defaultForm); }}
          className="btn-primary flex items-center gap-2 !text-sm"
        >
          <Plus className="w-4 h-4" /> New Tournament
        </button>
      </div>

      {/* Tournament List */}
      <div className="grid gap-4">
        {tournaments.map((t, idx) => (
          <motion.div
            key={t._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="glass-card p-5"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">{t.name}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    {t.season && <span>{t.season}</span>}
                    <span className="capitalize">{t.format.replace(/_/g, ' ').toLowerCase()}</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {t.teams?.length || 0} teams
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getStatusBadge(t.status)}`}>
                  {t.status}
                </span>
                <button onClick={() => handleEdit(t)} className="p-2 text-gray-400 hover:text-white hover:bg-dark-200 rounded-lg transition-all">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteId(t._id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-dark-200 rounded-lg transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Teams preview */}
            {t.teams?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {t.teams.map(team => (
                  <span key={team._id || team} className="px-2 py-1 bg-dark-200 rounded-lg text-xs text-gray-300">
                    {team.team || team.name || '?'}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}

        {tournaments.length === 0 && (
          <div className="glass-card p-12 text-center">
            <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No tournaments yet. Create your first one!</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-display font-bold text-white">
                  {editingId ? 'Edit Tournament' : 'Create Tournament'}
                </h2>
                <button onClick={() => setShowForm(false)} className="p-2 text-gray-400 hover:text-white rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Tournament Name *</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                      required
                      className="input-field"
                      placeholder="e.g. TEX Football League 2026"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Season</label>
                    <input
                      value={form.season}
                      onChange={(e) => setForm(p => ({ ...p, season: e.target.value }))}
                      className="input-field"
                      placeholder="e.g. 2026"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Format</label>
                    <select
                      value={form.format}
                      onChange={(e) => setForm(p => ({ ...p, format: e.target.value }))}
                      className="input-field"
                    >
                      {formatOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm(p => ({ ...p, status: e.target.value }))}
                      className="input-field"
                    >
                      {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Round Robin</label>
                    <select
                      value={form.roundRobinType}
                      onChange={(e) => setForm(p => ({ ...p, roundRobinType: e.target.value }))}
                      className="input-field"
                    >
                      <option value="SINGLE">Single</option>
                      <option value="DOUBLE">Double</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm(p => ({ ...p, startDate: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">End Date</label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm(p => ({ ...p, endDate: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Points for Win</label>
                    <input
                      type="number"
                      value={form.pointsForWin}
                      onChange={(e) => setForm(p => ({ ...p, pointsForWin: Number(e.target.value) }))}
                      className="input-field"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Points for Draw</label>
                    <input
                      type="number"
                      value={form.pointsForDraw}
                      onChange={(e) => setForm(p => ({ ...p, pointsForDraw: Number(e.target.value) }))}
                      className="input-field"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Points for Loss</label>
                    <input
                      type="number"
                      value={form.pointsForLoss}
                      onChange={(e) => setForm(p => ({ ...p, pointsForLoss: Number(e.target.value) }))}
                      className="input-field"
                      min="0"
                    />
                  </div>
                </div>

                {/* Team Selection */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2">
                    Select Teams ({form.teams.length} selected)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {availableTeams.map(team => (
                      <button
                        key={team._id}
                        type="button"
                        onClick={() => toggleTeam(team._id)}
                        className={`px-3 py-2 rounded-xl text-sm text-left transition-all ${
                          form.teams.includes(team._id)
                            ? 'bg-primary/20 text-primary border border-primary/30'
                            : 'bg-dark-200 text-gray-400 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="font-medium">{team.team}</div>
                        <div className="text-xs opacity-60">{team.playersPurchased?.length || 0} players</div>
                      </button>
                    ))}
                  </div>
                  {availableTeams.length === 0 && (
                    <p className="text-xs text-gray-500">No teams available. Create bidders with team names first.</p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" className="btn-primary flex-1 !text-sm">
                    {editingId ? 'Update' : 'Create'} Tournament
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-dark !text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      {deleteId && (
        <ConfirmModal
          isOpen={!!deleteId}
          title="Delete Tournament"
          message="This will permanently delete this tournament and all its fixtures, matches, and events. This action cannot be undone."
          confirmText="Delete"
          isDanger={true}
          onConfirm={handleDelete}
          onClose={() => setDeleteId(null)}
        />
      )}
    </div>
  );
};

export default AdminTournaments;
