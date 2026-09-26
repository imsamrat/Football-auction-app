import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

const TopScorers = ({ scorers = [], title = 'Top Goal Scorers', limit = 10 }) => {
  const displayed = scorers.slice(0, limit);

  if (!displayed.length) {
    return (
      <div className="glass-card p-6 text-center text-gray-500 text-sm">
        No goals scored yet.
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-dark-50/50 flex items-center gap-2">
        <Trophy className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-white text-sm">{title}</h3>
      </div>
      <div className="divide-y divide-dark-50/30">
        {displayed.map((scorer, idx) => (
          <motion.div
            key={scorer.playerId || idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="flex items-center gap-3 px-4 py-3 hover:bg-dark-200/50 transition-colors"
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              idx === 0 ? 'bg-yellow-500 text-black' :
              idx === 1 ? 'bg-gray-400 text-black' :
              idx === 2 ? 'bg-amber-700 text-white' :
              'bg-dark-300 text-gray-400'
            }`}>
              {scorer.rank || idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-white text-sm truncate">{scorer.playerName}</div>
              <div className="text-xs text-gray-500">{scorer.teamName}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-500">{scorer.matches}M</div>
              <div className="text-lg font-bold text-primary font-mono min-w-[28px] text-right">
                {scorer.goals}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TopScorers;
