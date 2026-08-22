import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { getResults } from '../services/auctionService';
import { formatCurrency, getStatusBadge } from '../utils/helpers';

const AdminResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

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
                  <td className="px-4 py-3 text-sm text-center text-gray-300">{r.totalBids}</td>
                  <td className="px-4 py-3 text-center"><span className={getStatusBadge(r.status)}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminResults;
