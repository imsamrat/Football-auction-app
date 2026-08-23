import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, Edit2, Trash2, CheckCircle2, XCircle, AlertCircle, PlayCircle } from 'lucide-react';
import seasonService from '../services/auctionSeasonService';
import toast from 'react-hot-toast';

const AdminSeasons = () => {
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchSeasons();
  }, []);

  const fetchSeasons = async () => {
    try {
      const data = await seasonService.getSeasons();
      setSeasons(data);
    } catch (error) {
      toast.error('Failed to fetch seasons');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (season = null) => {
    if (season) {
      setEditingSeason(season);
      setFormData({ name: season.name });
    } else {
      setEditingSeason(null);
      setFormData({ name: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSeason(null);
    setFormData({ name: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      if (editingSeason) {
        await seasonService.updateSeason(editingSeason._id, formData);
        toast.success('Season updated successfully');
      } else {
        await seasonService.createSeason(formData);
        toast.success('Season created successfully');
      }
      handleCloseModal();
      fetchSeasons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this season? This cannot be undone.')) {
      try {
        await seasonService.deleteSeason(id);
        toast.success('Season deleted');
        fetchSeasons();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete season');
      }
    }
  };

  const handleActivate = async (id) => {
    if (window.confirm('Are you sure you want to activate this season? This will change the active dataset across the entire application.')) {
      try {
        await seasonService.activateSeason(id);
        toast.success('Season activated successfully');
        // Refresh page to reload all contexts and states with the new season data
        window.location.reload();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to activate season');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center bg-dark-100 p-6 rounded-2xl border border-dark-50/50">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Auction Seasons</h1>
          <p className="text-gray-400">Manage your auction seasons and switch active contexts.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Season
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {seasons.map((season) => (
          <motion.div
            key={season._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative bg-dark-100 rounded-2xl border p-6 transition-all ${
              season.status === 'ACTIVE' 
                ? 'border-primary shadow-[0_0_15px_rgba(255,107,0,0.1)]' 
                : 'border-dark-50/50 hover:border-primary/30'
            }`}
          >
            {/* Status Badge */}
            <div className="absolute top-4 right-4 flex gap-2">
              {season.status === 'ACTIVE' ? (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-primary border border-primary/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ACTIVE
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-dark-200 text-gray-400 border border-dark-50">
                  INACTIVE
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                season.status === 'ACTIVE' ? 'bg-primary/20 text-primary' : 'bg-dark-200 text-gray-400'
              }`}>
                <Calendar className="w-6 h-6" />
              </div>
              <div className="pr-20">
                <h3 className="text-xl font-bold text-white truncate" title={season.name}>{season.name}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(season.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-dark-200 rounded-lg p-3">
                <div className="text-2xl font-bold text-white">{season.playerCount || 0}</div>
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Players</div>
              </div>
              <div className="bg-dark-200 rounded-lg p-3">
                <div className="text-2xl font-bold text-white">{season.bidderCount || 0}</div>
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Bidders</div>
              </div>
              <div className="bg-dark-200 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-400">{season.soldCount || 0}</div>
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Sold</div>
              </div>
              <div className="bg-dark-200 rounded-lg p-3">
                <div className="text-2xl font-bold text-red-400">{season.unsoldCount || 0}</div>
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Unsold</div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-dark-50/50">
              {season.status !== 'ACTIVE' && (
                <button
                  onClick={() => handleActivate(season._id)}
                  className="flex-1 btn bg-green-500/10 text-green-500 hover:bg-green-500/20 py-2 flex items-center justify-center gap-2"
                >
                  <PlayCircle className="w-4 h-4" />
                  Activate
                </button>
              )}
              
              <button
                onClick={() => handleOpenModal(season)}
                className="flex-1 btn bg-dark-200 text-gray-300 hover:text-white hover:bg-dark-300 py-2 flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>

              {season.status !== 'ACTIVE' && (
                <button
                  onClick={() => handleDelete(season._id)}
                  className="p-2 btn bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg flex items-center justify-center"
                  title="Delete Season"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        ))}

        {seasons.length === 0 && (
          <div className="col-span-full py-12 text-center bg-dark-100 rounded-2xl border border-dark-50/50">
            <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Seasons Found</h3>
            <p className="text-gray-400 mb-6">Create your first season to get started. Existing data will be automatically migrated to it.</p>
            <button
              onClick={() => handleOpenModal()}
              className="btn btn-primary"
            >
              Create First Season
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-dark-100 rounded-2xl w-full max-w-md border border-dark-50 shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-dark-50">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-display font-bold text-white">
                    {editingSeason ? 'Edit Season' : 'Create New Season'}
                  </h2>
                  <button onClick={handleCloseModal} className="text-gray-400 hover:text-white transition-colors">
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">
                    Season Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-dark-200 border border-dark-50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="e.g., Tex 2026-27 Season"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                {!editingSeason && seasons.length === 0 && (
                  <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 flex gap-3 text-primary">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-bold mb-1">First Season Creation</p>
                      <p className="opacity-90">All existing players, bidders, and auction records will be automatically assigned to this new season.</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 btn bg-dark-200 text-white hover:bg-dark-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="flex-1 btn btn-primary flex justify-center items-center"
                  >
                    {submitLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      editingSeason ? 'Update' : 'Create'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminSeasons;
