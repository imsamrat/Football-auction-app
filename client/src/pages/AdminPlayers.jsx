import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Search, X, Save } from 'lucide-react';
import { getPlayers, createPlayer, updatePlayer, deletePlayer } from '../services/playerService';
import { formatCurrency, getStatusBadge, getPositionColor } from '../utils/helpers';
import toast from 'react-hot-toast';

const AdminPlayers = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [form, setForm] = useState({
    playerNumber: '', name: '', position: 'STRIKER', division: '',
    basePrice: '', matches: 0, goals: 0, assists: 0, rating: 0, photo: ''
  });

  useEffect(() => { loadPlayers(); }, []);

  const loadPlayers = async () => {
    try {
      const { data } = await getPlayers();
      setPlayers(data);
    } catch (err) {
      toast.error('Failed to load players');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingPlayer(null);
    setForm({ playerNumber: '', name: '', position: 'STRIKER', division: '', basePrice: '', matches: 0, goals: 0, assists: 0, rating: 0, photo: '' });
    setShowModal(true);
  };

  const openEdit = (player) => {
    setEditingPlayer(player);
    setForm({
      playerNumber: player.playerNumber,
      name: player.name,
      position: player.position,
      division: player.division,
      basePrice: player.basePrice,
      matches: player.matches,
      goals: player.goals,
      assists: player.assists,
      rating: player.rating,
      photo: player.photo || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let submittedForm = { ...form };
      
      // Auto-convert Google Drive viewer links to direct image links
      if (submittedForm.photo && submittedForm.photo.includes('drive.google.com')) {
        let fileId = null;
        const matchD = submittedForm.photo.match(/\/d\/([a-zA-Z0-9_-]+)/);
        const matchId = submittedForm.photo.match(/id=([a-zA-Z0-9_-]+)/);
        
        if (matchD) fileId = matchD[1];
        else if (matchId) fileId = matchId[1];

        if (fileId) {
          // lh3.googleusercontent.com is the most reliable endpoint for embedding Google Drive images
          submittedForm.photo = `https://lh3.googleusercontent.com/d/${fileId}`;
        }
      }

      if (editingPlayer) {
        await updatePlayer(editingPlayer._id, submittedForm);
        toast.success('Player updated');
      } else {
        await createPlayer(submittedForm);
        toast.success('Player created');
      }
      setShowModal(false);
      loadPlayers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save player');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this player?')) return;
    try {
      await deletePlayer(id);
      toast.success('Player deleted');
      loadPlayers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete player');
    }
  };

  const filtered = players.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.playerNumber.toString().includes(search)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Players</h1>
          <p className="text-gray-400 mt-1">{players.length} players registered</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Player
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
          placeholder="Search players..."
        />
      </div>

      {/* Players table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-50/50">
                <th className="text-left text-xs text-gray-500 uppercase tracking-wider px-4 py-3">#</th>
                <th className="text-left text-xs text-gray-500 uppercase tracking-wider px-4 py-3">Name</th>
                <th className="text-left text-xs text-gray-500 uppercase tracking-wider px-4 py-3">Position</th>
                <th className="text-left text-xs text-gray-500 uppercase tracking-wider px-4 py-3">Division</th>
                <th className="text-right text-xs text-gray-500 uppercase tracking-wider px-4 py-3">Base Price</th>
                <th className="text-center text-xs text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-right text-xs text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((player) => (
                <tr key={player._id} className="border-b border-dark-50/30 hover:bg-dark-200/30 transition-colors">
                  <td className="px-4 py-3 font-bold text-primary">{player.playerNumber}</td>
                  <td className="px-4 py-3 font-semibold text-white">{player.name}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded ${getPositionColor(player.position)}`}>
                      {player.position}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{player.division}</td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-white">{formatCurrency(player.basePrice)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={getStatusBadge(player.status)}>{player.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(player)} className="p-1.5 hover:bg-dark-300 rounded-lg text-gray-400 hover:text-white transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(player._id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="p-4 border-b border-dark-50/50 flex items-center justify-between sticky top-0 bg-dark-100 z-10">
                <h3 className="font-display font-bold text-lg">
                  {editingPlayer ? 'Edit Player' : 'Add Player'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-dark-300 rounded-lg">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Player Number</label>
                    <input type="number" value={form.playerNumber} onChange={(e) => setForm({...form, playerNumber: e.target.value})} className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Position</label>
                    <select value={form.position} onChange={(e) => setForm({...form, position: e.target.value})} className="input-field">
                      <option value="GOALKEEPER">Goalkeeper</option>
                      <option value="DEFENDER">Defender</option>
                      <option value="MIDFIELDER">Midfielder</option>
                      <option value="STRIKER">Striker</option>
                      <option value="WINGER">Winger</option>
                      <option value="FORWARD">Forward</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Photo URL (Optional)</label>
                  <input type="url" value={form.photo} onChange={(e) => setForm({...form, photo: e.target.value})} className="input-field" placeholder="https://..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Division</label>
                    <input type="text" value={form.division} onChange={(e) => setForm({...form, division: e.target.value})} className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Base Price (৳)</label>
                    <input type="number" value={form.basePrice} onChange={(e) => setForm({...form, basePrice: e.target.value})} className="input-field" required />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Matches</label>
                    <input type="number" value={form.matches} onChange={(e) => setForm({...form, matches: e.target.value})} className="input-field text-center" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Goals</label>
                    <input type="number" value={form.goals} onChange={(e) => setForm({...form, goals: e.target.value})} className="input-field text-center" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Assists</label>
                    <input type="number" value={form.assists} onChange={(e) => setForm({...form, assists: e.target.value})} className="input-field text-center" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Rating</label>
                    <input type="number" step="0.1" max="10" value={form.rating} onChange={(e) => setForm({...form, rating: e.target.value})} className="input-field text-center" />
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" />
                  {editingPlayer ? 'Update Player' : 'Create Player'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPlayers;
