import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, DollarSign, Trophy, BarChart3 } from 'lucide-react';
import { getStats } from '../services/auctionService';
import { formatCurrency } from '../utils/helpers';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Players', value: stats?.totalPlayers || 0, icon: Users, color: 'text-blue-400' },
    { label: 'Sold', value: stats?.soldPlayers || 0, icon: Trophy, color: 'text-green-400' },
    { label: 'Unsold', value: stats?.unsoldPlayers || 0, icon: BarChart3, color: 'text-yellow-400' },
    { label: 'Upcoming', value: stats?.upcomingPlayers || 0, icon: TrendingUp, color: 'text-purple-400' },
    { label: 'Total Value', value: formatCurrency(stats?.totalAuctionValue || 0), icon: DollarSign, color: 'text-primary' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Auction overview and statistics</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
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
          transition={{ delay: 0.5 }}
          className="glass-card p-6 mb-8"
        >
          <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-3">Highest Sale</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-display font-bold text-white">{stats.highestSale.playerName}</p>
              <p className="text-sm text-gray-400">Won by {stats.highestSale.bidderName}</p>
            </div>
            <p className="text-3xl font-display font-bold text-primary">{formatCurrency(stats.highestSale.finalPrice)}</p>
          </div>
        </motion.div>
      )}

      {/* Bidder standings */}
      {stats?.bidders?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card overflow-hidden"
        >
          <div className="p-4 border-b border-dark-50/50">
            <h3 className="font-display font-bold text-white">Bidder Standings</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-50/50">
                  <th className="text-left text-xs text-gray-500 uppercase tracking-wider px-4 py-3">Bidder</th>
                  <th className="text-left text-xs text-gray-500 uppercase tracking-wider px-4 py-3">Team</th>
                  <th className="text-right text-xs text-gray-500 uppercase tracking-wider px-4 py-3">Spent</th>
                  <th className="text-right text-xs text-gray-500 uppercase tracking-wider px-4 py-3">Remaining</th>
                  <th className="text-right text-xs text-gray-500 uppercase tracking-wider px-4 py-3">Players</th>
                </tr>
              </thead>
              <tbody>
                {stats.bidders.map((bidder) => (
                  <tr key={bidder.id} className="border-b border-dark-50/30 hover:bg-dark-200/30">
                    <td className="px-4 py-3 text-sm font-semibold text-white">{bidder.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{bidder.team}</td>
                    <td className="px-4 py-3 text-sm text-right text-primary font-bold">{formatCurrency(bidder.totalSpent)}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-300">{formatCurrency(bidder.remainingBudget)}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-300">{bidder.playersPurchased}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminDashboard;
