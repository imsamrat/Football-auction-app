import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand, X, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useAuction } from '../context/AuctionContext';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

const BidButton = () => {
  const { user, isBidder, isAuthenticated } = useAuth();
  const { emit } = useSocket();
  const { currentAuction, isLive } = useAuction();
  const [showModal, setShowModal] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const currentBid = currentAuction?.currentBid || 0;
  const basePrice = currentAuction?.basePrice || 0;
  const bidIncrement = currentAuction?.bidIncrement || 500;
  const nextBid = currentBid > 0 ? currentBid + bidIncrement : basePrice + bidIncrement;

  const handleRaiseHand = () => {
    if (!isAuthenticated || !isBidder) {
      toast.error('Please login as a bidder to place bids');
      return;
    }
    if (!isLive) {
      toast.error('No active auction');
      return;
    }
    setBidAmount(nextBid.toString());
    setShowModal(true);
  };

  const handleBid = () => {
    const amount = parseInt(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid bid amount');
      return;
    }
    if (amount < nextBid) {
      toast.error(`Minimum bid is ${formatCurrency(nextBid)}`);
      return;
    }

    setLoading(true);
    emit('bid:place', { amount }, (response) => {
      setLoading(false);
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success(`Bid placed: ${formatCurrency(amount)}`);
        setShowModal(false);
      }
    });
  };

  const baseValue = currentBid > 0 ? currentBid : basePrice;
  // Use exact jump amounts
  const quickBids = [10000, 20000, 50000, 100000];

  if (!isLive) return null;

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleRaiseHand}
        className="w-full py-4 bg-gradient-to-r from-primary to-red-600 text-white font-display font-bold text-lg rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all flex items-center justify-center gap-3"
      >
        <Hand className="w-6 h-6" />
        RAISE HAND
      </motion.button>

      {/* Bid Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card w-full max-w-md overflow-hidden"
            >
              <div className="bg-gradient-to-r from-primary/20 to-transparent p-4 flex items-center justify-between border-b border-dark-50/50">
                <h3 className="font-display font-bold text-lg">Place Your Bid</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 hover:bg-dark-300 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Current info */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Current Bid:</span>
                  <span className="font-bold text-white">{formatCurrency(currentBid || basePrice)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Bidder:</span>
                  <span className="font-bold text-primary">{user?.name}</span>
                </div>

                {/* Bid input via +/- */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2 text-center">Bid Amount</label>
                  <div className="flex items-center justify-between bg-dark-200 border border-dark-50/50 rounded-xl p-2">
                    <button
                      onClick={() => {
                        const val = parseInt(bidAmount) || nextBid;
                        const newVal = val - 10000;
                        if (newVal >= nextBid) {
                          setBidAmount(newVal.toString());
                        } else {
                          setBidAmount(nextBid.toString());
                        }
                      }}
                      className="p-3 bg-dark-300 hover:bg-dark-50 rounded-lg text-gray-300 transition-colors"
                    >
                      <span className="text-2xl font-bold leading-none select-none">-</span>
                    </button>
                    <div className="flex-1 text-center text-3xl font-display font-bold text-white">
                      {formatCurrency(parseInt(bidAmount) || 0)}
                    </div>
                    <button
                      onClick={() => {
                        const val = parseInt(bidAmount) || nextBid;
                        setBidAmount((val + 10000).toString());
                      }}
                      className="p-3 bg-dark-300 hover:bg-dark-50 rounded-lg text-gray-300 transition-colors"
                    >
                      <span className="text-2xl font-bold leading-none select-none">+</span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Minimum: {formatCurrency(nextBid)}
                  </p>
                </div>

                {/* Quick bid buttons */}
                <div className="grid grid-cols-2 gap-2">
                  {quickBids.map((jump) => {
                    const amount = baseValue + jump;
                    return (
                      <button
                        key={jump}
                        onClick={() => setBidAmount(amount.toString())}
                        className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                          parseInt(bidAmount) === amount
                            ? 'bg-primary text-white'
                            : 'bg-dark-200 text-gray-300 hover:bg-dark-300 border border-dark-50'
                        }`}
                      >
                        +{formatCurrency(jump)}
                      </button>
                    );
                  })}
                </div>

                {/* Submit */}
                <button
                  onClick={handleBid}
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-primary to-red-600 text-white font-display font-bold rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      CONFIRM BID — {formatCurrency(parseInt(bidAmount) || 0)}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BidButton;
