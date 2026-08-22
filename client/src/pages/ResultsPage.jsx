import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, DollarSign, TrendingUp, BarChart3 } from 'lucide-react';
import { getStats } from '../services/auctionService';
import { getResults } from '../services/auctionService';
import { formatCurrency, getStatusBadge } from '../utils/helpers';

const ResultsPage = () => {
  const [stats, setStats] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [statsRes, resultsRes] = await Promise.all([getStats(), getResults()]);
      setStats(statsRes.data);
      setResults(resultsRes.data);
    } catch (err) {
      console.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const statCards = [
    { label: 'Total Players', value: stats?.totalPlayers || 0, icon: Users, color: 'text-blue-400' },
    { label: 'Sold', value: stats?.soldPlayers || 0, icon: Trophy, color: 'text-green-400' },
    { label: 'Unsold', value: stats?.unsoldPlayers || 0, icon: BarChart3, color: 'text-yellow-400' },
    { label: 'Total Value', value: formatCurrency(stats?.totalAuctionValue || 0), icon: DollarSign, color: 'text-primary' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
          <Trophy className="w-8 h-8 text-primary" />
          Auction Results
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5"
          >
            <stat.icon className={`w-6 h-6 ${stat.color} mb-3`} />
            <p className="text-2xl font-display font-bold text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Highest sale */}
      {stats?.highestSale && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 mb-8 border-l-4 border-l-primary"
        >
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="text-sm text-gray-400 uppercase tracking-wider">Highest Sale</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-display font-bold text-white">{stats.highestSale.playerName}</p>
              <p className="text-sm text-gray-400">Won by {stats.highestSale.bidderName}</p>
            </div>
            <p className="text-3xl font-display font-bold text-primary">{formatCurrency(stats.highestSale.finalPrice)}</p>
          </div>
        </motion.div>
      )}

      {/* Results table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-50/50">
                <th className="text-left text-xs text-gray-500 uppercase tracking-wider px-4 py-3">Player</th>
                <th className="text-left text-xs text-gray-500 uppercase tracking-wider px-4 py-3">Position</th>
                <th className="text-right text-xs text-gray-500 uppercase tracking-wider px-4 py-3">Base</th>
                <th className="text-right text-xs text-gray-500 uppercase tracking-wider px-4 py-3">Sold Price</th>
                <th className="text-left text-xs text-gray-500 uppercase tracking-wider px-4 py-3">Winner</th>
                <th className="text-center text-xs text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r._id} className="border-b border-dark-50/30 hover:bg-dark-200/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-bold">#{r.playerNumber}</span>
                      <span className="font-semibold text-white">{r.playerName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{r.position}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-400">{formatCurrency(r.basePrice)}</td>
                  <td className="px-4 py-3 text-right font-bold text-primary">
                    {r.status === 'SOLD' ? formatCurrency(r.finalPrice) : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-white">{r.bidderName || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={getStatusBadge(r.status)}>{r.status}</span>
                  </td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    No auction results yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default ResultsPage;
