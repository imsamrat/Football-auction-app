import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { getBidders, createBidder, updateBidder, deleteBidder } from '../services/bidderService';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

const AdminBidders = () => {
  const [bidders, setBidders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBidder, setEditingBidder] = useState(null);
  const [form, setForm] = useState({ name: '', bidderNumber: '', team: '', password: '', budget: '' });

  useEffect(() => { loadBidders(); }, []);

  const loadBidders = async () => {
    try {
      const { data } = await getBidders();
      setBidders(data);
    } catch (err) {
      toast.error('Failed to load bidders');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingBidder(null);
    setForm({ name: '', bidderNumber: '', team: '', password: '1234', budget: '' });
    setShowModal(true);
  };

  const openEdit = (bidder) => {
    setEditingBidder(bidder);
    setForm({ name: bidder.name, bidderNumber: bidder.bidderNumber, team: bidder.team, password: '', budget: bidder.budget });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (editingBidder && !payload.password) delete payload.password;
      if (editingBidder) {
        await updateBidder(editingBidder._id, payload);
        toast.success('Bidder updated');
      } else {
        await createBidder(payload);
        toast.success('Bidder created');
      }
      setShowModal(false);
      loadBidders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save bidder');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this bidder?')) return;
    try {
      await deleteBidder(id);
      toast.success('Bidder deleted');
      loadBidders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Bidders</h1>
          <p className="text-gray-400 mt-1">{bidders.length} bidders registered</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Bidder
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-50/50">
                <th className="text-left text-xs text-gray-500 uppercase tracking-wider px-4 py-3">#</th>
                <th className="text-left text-xs text-gray-500 uppercase tracking-wider px-4 py-3">Name</th>
                <th className="text-left text-xs text-gray-500 uppercase tracking-wider px-4 py-3">Team</th>
                <th className="text-right text-xs text-gray-500 uppercase tracking-wider px-4 py-3">Budget</th>
                <th className="text-right text-xs text-gray-500 uppercase tracking-wider px-4 py-3">Spent</th>
                <th className="text-right text-xs text-gray-500 uppercase tracking-wider px-4 py-3">Remaining</th>
                <th className="text-right text-xs text-gray-500 uppercase tracking-wider px-4 py-3">Players</th>
                <th className="text-right text-xs text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bidders.map((bidder) => (
                <tr key={bidder._id} className="border-b border-dark-50/30 hover:bg-dark-200/30 transition-colors">
                  <td className="px-4 py-3 font-bold text-primary">{bidder.bidderNumber}</td>
                  <td className="px-4 py-3 font-semibold text-white">{bidder.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{bidder.team}</td>
                  <td className="px-4 py-3 text-sm text-right text-white">{formatCurrency(bidder.budget)}</td>
                  <td className="px-4 py-3 text-sm text-right text-primary font-bold">{formatCurrency(bidder.totalSpent)}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-300">{formatCurrency(bidder.remainingBudget)}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-300">{bidder.playersPurchased?.length || 0}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(bidder)} className="p-1.5 hover:bg-dark-300 rounded-lg text-gray-400 hover:text-white transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(bidder._id)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors">
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

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card w-full max-w-md"
            >
              <div className="p-4 border-b border-dark-50/50 flex items-center justify-between">
                <h3 className="font-display font-bold text-lg">{editingBidder ? 'Edit Bidder' : 'Add Bidder'}</h3>
                <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-dark-300 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Bidder Number</label>
                    <input type="number" value={form.bidderNumber} onChange={(e) => setForm({...form, bidderNumber: e.target.value})} className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Budget (৳)</label>
                    <input type="number" value={form.budget} onChange={(e) => setForm({...form, budget: e.target.value})} className="input-field" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Team</label>
                  <input type="text" value={form.team} onChange={(e) => setForm({...form, team: e.target.value})} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Password {editingBidder && '(leave blank to keep current)'}</label>
                  <input type="text" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className="input-field" {...(!editingBidder && { required: true })} />
                </div>
                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" /> {editingBidder ? 'Update' : 'Create'} Bidder
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBidders;
