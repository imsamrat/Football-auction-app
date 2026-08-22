import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Eye, X, Clock } from 'lucide-react';
import { getResults, getPlayerBids } from '../services/auctionService';
import { formatCurrency, getStatusBadge } from '../utils/helpers';

const AdminResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBids, setSelectedBids] = useState(null);
  const [loadingBids, setLoadingBids] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => { loadResults(); }, []);

  const loadResults = async () => {
    try {
      const { data } = await getResults();
      setResults(data);
    } catch (err) {
      console.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const handleViewBids = async (result) => {
    try {
      setSelectedPlayer(result.playerName);
      setLoadingBids(true);
      setSelectedBids([]);
      // The playerId field might be an object or string depending on populate, safely get ID:
      const pId = result.playerId?._id || result.playerId;
      const { data } = await getPlayerBids(pId);
      setSelectedBids(data);
    } catch (err) {
      console.error('Failed to load bids', err);
      setSelectedBids(null);
    } finally {
      setLoadingBids(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-white">Auction Results</h1>
        <p className="text-gray-400 mt-1">{results.length} completed auctions</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-50/50">
                <th className="text-left text-xs text-gray-500 uppercase tracking-wider px-4 py-3">#</th>
                <th className="text-left text-xs text-gray-500 uppercase tracking-wider px-4 py-3">Player</th>
                <th className="text-left text-xs text-gray-500 uppercase tracking-wider px-4 py-3">Position</th>
                <th className="text-right text-xs text-gray-500 uppercase tracking-wider px-4 py-3">Base Price</th>
                <th className="text-right text-xs text-gray-500 uppercase tracking-wider px-4 py-3">Sold Price</th>
                <th className="text-left text-xs text-gray-500 uppercase tracking-wider px-4 py-3">Winner</th>
                <th className="text-center text-xs text-gray-500 uppercase tracking-wider px-4 py-3">Bids</th>
                <th className="text-center text-xs text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r._id} className="border-b border-dark-50/30 hover:bg-dark-200/30 transition-colors">
                  <td className="px-4 py-3 text-primary font-bold">{r.playerNumber}</td>
                  <td className="px-4 py-3 font-semibold text-white">{r.playerName}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{r.position}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-300">{formatCurrency(r.basePrice)}</td>
                  <td className="px-4 py-3 text-right font-bold text-primary">{r.status === 'SOLD' ? formatCurrency(r.finalPrice) : '—'}</td>
                  <td className="px-4 py-3 text-sm text-white">{r.bidderName || '—'}</td>
                  <td className="px-4 py-3 text-sm text-center">
                    <button
                      onClick={() => handleViewBids(r)}
                      disabled={r.totalBids === 0}
                      className={`flex items-center justify-center gap-1 mx-auto px-3 py-1.5 rounded-lg transition-colors ${
                        r.totalBids > 0
                          ? 'bg-dark-100 hover:bg-dark-50 text-white'
                          : 'text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                      {r.totalBids}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center"><span className={getStatusBadge(r.status)}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bid Details Modal */}
      {selectedBids !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-200 border border-dark-50/50 rounded-2xl w-full max-w-lg overflow-hidden shadow-xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-dark-50/50 bg-dark-100/50">
              <div>
                <h3 className="text-xl font-display font-bold text-white">Bid History</h3>
                <p className="text-sm text-gray-400 mt-1">{selectedPlayer}</p>
              </div>
              <button
                onClick={() => setSelectedBids(null)}
                className="p-2 text-gray-400 hover:text-white hover:bg-dark-50 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {loadingBids ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : selectedBids.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  No bids found.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedBids.map((bid, i) => (
                    <div
                      key={bid._id}
                      className={`flex items-center justify-between p-4 rounded-xl border ${
                        i === 0
                          ? 'bg-primary/10 border-primary/30'
                          : 'bg-dark-100/50 border-dark-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          i === 0 ? 'bg-primary text-white' : 'bg-dark-50 text-gray-400'
                        }`}>
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-bold text-white">{bid.bidderName}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {new Date(bid.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div className={`font-display font-bold text-lg ${
                        i === 0 ? 'text-primary' : 'text-gray-300'
                      }`}>
                        {formatCurrency(bid.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminResults;
