import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { useAuction } from '../context/AuctionContext';

const BidHistory = () => {
  const { bids } = useAuction();

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-dark-50/50">
        <h3 className="font-display font-bold text-sm uppercase tracking-wider text-gray-400 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Bid History
        </h3>
      </div>

      <div className="max-h-[300px] overflow-y-auto">
        {bids.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm">
            No bids yet
          </div>
        ) : (
          <AnimatePresence>
            {bids.map((bid, index) => (
              <motion.div
                key={bid._id || index}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className={`flex items-center justify-between px-4 py-3 border-b border-dark-50/30 ${
                  index === 0 ? 'bg-primary/5' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-primary/20 text-primary' : 'bg-dark-200 text-gray-400'
                  }`}>
                    #{bids.length - index}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${index === 0 ? 'text-white' : 'text-gray-300'}`}>
                      {bid.bidderName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(bid.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <span className={`font-display font-bold ${index === 0 ? 'text-primary text-lg' : 'text-white text-sm'}`}>
                  {formatCurrency(bid.amount)}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default BidHistory;
