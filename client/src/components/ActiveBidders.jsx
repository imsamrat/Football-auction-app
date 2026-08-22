import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { useAuction } from '../context/AuctionContext';

const ActiveBidders = () => {
  const { bidders, currentAuction } = useAuction();
  const highestBidderId = currentAuction?.highestBidderId;

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-dark-50/50">
        <h3 className="font-display font-bold text-sm uppercase tracking-wider text-gray-400 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Active Bidders
          <span className="ml-auto text-xs bg-dark-200 px-2 py-0.5 rounded-full">
            {bidders?.length || 0}
          </span>
        </h3>
      </div>

      <div className="max-h-[300px] overflow-y-auto">
        {(!bidders || bidders.length === 0) ? (
          <div className="p-6 text-center text-gray-500 text-sm">
            No active bidders
          </div>
        ) : (
          bidders.map((bidder, index) => {
            const isHighest = highestBidderId && bidder._id === highestBidderId;
            return (
              <motion.div
                key={bidder._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center justify-between px-4 py-3 border-b border-dark-50/30 ${
                  isHighest ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      isHighest ? 'bg-primary text-white' : 'bg-dark-200 text-gray-400'
                    }`}>
                      {bidder.bidderNumber}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-dark-100 ${
                      isHighest ? 'bg-green-400' : 'bg-gray-600'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isHighest ? 'text-white' : 'text-gray-300'}`}>
                      {bidder.name}
                    </p>
                    <p className="text-xs text-gray-500">{bidder.team}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{formatCurrency(bidder.remainingBudget)}</p>
                  <p className="text-[10px] text-gray-600">remaining</p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ActiveBidders;
