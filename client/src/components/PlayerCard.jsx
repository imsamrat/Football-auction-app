import { motion } from 'framer-motion';
import { User, Target, Shield, Star, TrendingUp } from 'lucide-react';
import { formatCurrency, getPositionColor, getPlayerInitials } from '../utils/helpers';

const PlayerCard = ({ player }) => {
  if (!player) {
    return (
      <div className="glass-card p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center text-gray-500">
          <User className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No player selected</p>
          <p className="text-sm">Waiting for auction to start</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Matches', value: player.matches || 0, icon: Shield },
    { label: 'Goals', value: player.goals || 0, icon: Target },
    { label: 'Assists', value: player.assists || 0, icon: TrendingUp },
    { label: 'Rating', value: player.rating?.toFixed(1) || '0.0', icon: Star },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden"
    >
      {/* Main card */}
      <div className="glass-card relative overflow-hidden">
        {/* Red accent top border */}
        <div className="h-1.5 bg-gradient-to-r from-primary via-red-400 to-primary" />

        {/* Background pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <polygon points="100,10 40,198 190,78 10,78 160,198" fill="currentColor" className="text-primary" />
          </svg>
        </div>

        <div className="p-6 relative">
          {/* Player number badge */}
          <div className="absolute top-4 right-4">
            <div className="w-16 h-16 bg-primary/10 border-2 border-primary/30 rounded-2xl flex items-center justify-center">
              <span className="text-3xl font-display font-black text-primary">
                {player.playerNumber}
              </span>
            </div>
          </div>

          {/* Player avatar */}
          <div className="flex items-start gap-5 mb-6">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="relative"
            >
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/30 to-dark-300 flex items-center justify-center border-2 border-primary/20 overflow-hidden">
                {player.photo ? (
                  <img src={player.photo} alt={player.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-display font-black text-white/80">
                    {getPlayerInitials(player.name)}
                  </span>
                )}
              </div>
              {/* Position badge */}
              <div className={`absolute -bottom-2 -right-2 px-2 py-0.5 rounded-lg text-[10px] font-bold ${getPositionColor(player.position)}`}>
                {player.position}
              </div>
            </motion.div>

            <div className="flex-1 min-w-0">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-display font-bold text-white truncate"
              >
                {player.name}
              </motion.h2>
              <p className="text-gray-400 text-sm mt-1">{player.division}</p>
              <div className="mt-3">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Base Price</span>
                <p className="text-xl font-display font-bold text-primary mt-0.5">
                  {formatCurrency(player.basePrice)}
                </p>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-3">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="bg-dark-200/50 rounded-xl p-3 text-center border border-dark-50/30"
              >
                <stat.icon className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                <p className="text-lg font-display font-bold text-white">{stat.value}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PlayerCard;
