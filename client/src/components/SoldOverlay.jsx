import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, X } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { useAuction } from '../context/AuctionContext';

const SoldOverlay = () => {
  const { soldData, unsoldData, dismissSold, dismissUnsold } = useAuction();

  useEffect(() => {
    if (soldData) {
      // Fire confetti
      const duration = 3000;
      const end = Date.now() + duration;
      const colors = ['#E5232A', '#FFD700', '#FFFFFF'];

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors,
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();

      // Auto dismiss after 6 seconds
      const timer = setTimeout(() => dismissSold(), 6000);
      return () => clearTimeout(timer);
    }
  }, [soldData, dismissSold]);

  useEffect(() => {
    if (unsoldData) {
      const timer = setTimeout(() => dismissUnsold(), 4000);
      return () => clearTimeout(timer);
    }
  }, [unsoldData, dismissUnsold]);

  return (
    <AnimatePresence>
      {soldData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center"
          onClick={dismissSold}
        >
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.3, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className="text-center max-w-lg mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* SOLD badge */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary to-red-600 rounded-full flex items-center justify-center shadow-2xl shadow-primary/40">
                <Trophy className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', damping: 10 }}
              className="text-7xl sm:text-8xl font-display font-black text-primary mb-4"
            >
              SOLD!
            </motion.h1>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              <p className="text-2xl font-display font-bold text-white">
                {soldData.playerName}
              </p>
              <div className="w-16 h-0.5 bg-primary/50 mx-auto" />
              <p className="text-sm text-gray-400 uppercase tracking-widest">Sold To</p>
              <p className="text-xl font-bold text-white">{soldData.bidderName}</p>
              {soldData.bidderTeam && (
                <p className="text-sm text-gray-400">{soldData.bidderTeam}</p>
              )}
              <motion.p
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: 'spring' }}
                className="text-5xl font-display font-black text-primary mt-4"
              >
                {formatCurrency(soldData.finalPrice)}
              </motion.p>
              <p className="text-xs text-gray-500">
                {soldData.totalBids} total bids
              </p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={dismissSold}
              className="mt-8 px-6 py-2 bg-dark-200 text-gray-400 rounded-lg hover:bg-dark-300 transition-colors text-sm"
            >
              Continue
            </motion.button>
          </motion.div>
        </motion.div>
      )}

      {unsoldData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center"
          onClick={dismissUnsold}
        >
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.3, opacity: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            className="text-center max-w-lg mx-4"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-dark-300 rounded-full flex items-center justify-center">
              <X className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-5xl font-display font-black text-yellow-400 mb-4">UNSOLD</h1>
            <p className="text-xl font-display font-bold text-white">
              {unsoldData.playerName}
            </p>
            <p className="text-gray-400 mt-2 text-sm">No valid bids were placed</p>
            <button
              onClick={dismissUnsold}
              className="mt-6 px-6 py-2 bg-dark-200 text-gray-400 rounded-lg hover:bg-dark-300 transition-colors text-sm"
            >
              Continue
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SoldOverlay;
