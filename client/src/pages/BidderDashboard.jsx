import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Users, ShoppingBag, TrendingUp, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getBidderDashboard } from '../services/bidderService';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

const BidderDashboard = () => {
  const { user } = useAuth();
  const [bidder, setBidder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try {
      const { data } = await getBidderDashboard();
      setBidder(data);
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  const stats = [
    { label: 'Budget', value: formatCurrency(bidder?.budget || 0), icon: Wallet, color: 'text-blue-400' },
    { label: 'Spent', value: formatCurrency(bidder?.totalSpent || 0), icon: DollarSign, color: 'text-primary' },
    { label: 'Remaining', value: formatCurrency(bidder?.remainingBudget || 0), icon: TrendingUp, color: 'text-green-400' },
    { label: 'Players', value: bidder?.playersPurchased?.length || 0, icon: Users, color: 'text-purple-400' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="glass-card p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-display font-black text-2xl">
            {bidder?.bidderNumber}
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">{bidder?.name}</h1>
            <p className="text-gray-400">{bidder?.team}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
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

      {/* Budget bar */}
      <div className="glass-card p-6 mb-8">
        <div className="flex justify-between mb-2 text-sm">
          <span className="text-gray-400">Budget Usage</span>
          <span className="text-white font-bold">
            {bidder?.budget > 0 ? Math.round((bidder.totalSpent / bidder.budget) * 100) : 0}%
          </span>
        </div>
        <div className="w-full h-3 bg-dark-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${bidder?.budget > 0 ? (bidder.totalSpent / bidder.budget) * 100 : 0}%` }}
            transition={{ duration: 1 }}
            className="h-full bg-gradient-to-r from-primary to-red-400 rounded-full"
          />
        </div>
      </div>

      {/* Purchased players */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-dark-50/50">
          <h3 className="font-display font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Purchased Players
          </h3>
        </div>
        {bidder?.playersPurchased?.length > 0 ? (
          <div className="divide-y divide-dark-50/30">
            {bidder.playersPurchased.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-white">{p.playerName}</p>
                  <p className="text-xs text-gray-500">{new Date(p.purchasedAt).toLocaleString()}</p>
                </div>
                <span className="font-display font-bold text-primary">{formatCurrency(p.price)}</span>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No players purchased yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BidderDashboard;
