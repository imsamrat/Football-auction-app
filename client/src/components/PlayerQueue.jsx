import { motion } from 'framer-motion';
import { ListOrdered } from 'lucide-react';
import { useAuction } from '../context/AuctionContext';
import { getPlayerInitials, getPositionColor } from '../utils/helpers';

const PlayerQueue = () => {
  const { playerQueue, currentPlayer } = useAuction();
  const currentPlayerId = currentPlayer?._id;

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-dark-50/50">
        <h3 className="font-display font-bold text-sm uppercase tracking-wider text-gray-400 flex items-center gap-2">
          <ListOrdered className="w-4 h-4" />
          Player Queue
          <span className="ml-auto text-xs bg-dark-200 px-2 py-0.5 rounded-full">
            {playerQueue?.length || 0}
          </span>
        </h3>
      </div>

      <div className="max-h-[300px] overflow-y-auto">
        {(!playerQueue || playerQueue.length === 0) ? (
          <div className="p-6 text-center text-gray-500 text-sm">
            No upcoming players
          </div>
        ) : (
          playerQueue.map((player, index) => {
            const isCurrent = currentPlayerId && player._id === currentPlayerId;
            return (
              <motion.div
                key={player._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-3 px-4 py-3 border-b border-dark-50/30 ${
                  isCurrent ? 'bg-primary/10 border-l-2 border-l-primary' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  isCurrent ? 'bg-primary text-white' : 'bg-dark-200 text-gray-400'
                }`}>
                  #{player.playerNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isCurrent ? 'text-white' : 'text-gray-300'}`}>
                    {player.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${getPositionColor(player.position)}`}>
                      {player.position}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] text-primary font-bold">NOW</span>
                    )}
                    {index === 0 && !isCurrent && (
                      <span className="text-[10px] text-yellow-400 font-bold">NEXT</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PlayerQueue;
