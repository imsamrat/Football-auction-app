import { motion } from 'framer-motion';
import { TrendingUp, Hash, DollarSign, Users } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { useAuction } from '../context/AuctionContext';
import CountdownTimer from './CountdownTimer';
import BidButton from './BidButton';

const AuctionPanel = () => {
  const { currentAuction, isLive, isPaused, stage, settings } = useAuction();

  const currentBid = currentAuction?.currentBid || 0;
  const basePrice = currentAuction?.basePrice || 0;
  const totalBids = currentAuction?.totalBids || 0;
  const highestBidderName = currentAuction?.highestBidderName || '—';
  const highestBidderTeam = currentAuction?.highestBidderTeam || '';

  // Dynamic bid increment based on tier
  const effectiveBid = currentBid > 0 ? currentBid : basePrice;
  const tier1Threshold = settings?.bidIncrementTier1Threshold || 500000;
  const tier2Threshold = settings?.bidIncrementTier2Threshold || 1000000;
  let bidIncrement = settings?.bidIncrementTier1 || 10000;
  if (effectiveBid >= tier2Threshold) {
    bidIncrement = settings?.bidIncrementTier3 || 30000;
  } else if (effectiveBid >= tier1Threshold) {
    bidIncrement = settings?.bidIncrementTier2 || 20000;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/20 to-transparent p-4 border-b border-dark-50/50">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            LIVE BIDDING
          </h3>
          {(isLive || isPaused) && (
            <div className="badge-live">
              <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              LIVE
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Timer */}
        <CountdownTimer />

        {/* Current Bid */}
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Current Bid</p>
          <motion.div
            key={currentBid}
            initial={{ scale: 1.1, color: '#E5232A' }}
            animate={{ scale: 1, color: '#ffffff' }}
            transition={{ duration: 0.3 }}
            className="text-4xl sm:text-5xl font-display font-black"
          >
            {currentBid > 0 ? formatCurrency(currentBid) : formatCurrency(basePrice)}
          </motion.div>
          {currentBid > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              +{formatCurrency(currentBid - basePrice)} from base
            </p>
          )}
        </div>

        {/* Highest Bidder */}
        {currentBid > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark-200/50 rounded-xl p-4 text-center border border-primary/20"
          >
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Highest Bidder</p>
            <p className="text-lg font-bold text-white">{highestBidderName}</p>
            {highestBidderTeam && (
              <p className="text-xs text-gray-400">{highestBidderTeam}</p>
            )}
          </motion.div>
        )}

        {/* Bid info row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-dark-200/30 rounded-lg p-3 text-center">
            <Hash className="w-4 h-4 mx-auto mb-1 text-gray-500" />
            <p className="text-lg font-bold text-white">{totalBids}</p>
            <p className="text-[10px] text-gray-500 uppercase">Bids</p>
          </div>
          <div className="bg-dark-200/30 rounded-lg p-3 text-center">
            <DollarSign className="w-4 h-4 mx-auto mb-1 text-gray-500" />
            <p className="text-sm font-bold text-white">{formatCurrency(basePrice)}</p>
            <p className="text-[10px] text-gray-500 uppercase">Base</p>
          </div>
          <div className="bg-dark-200/30 rounded-lg p-3 text-center">
            <TrendingUp className="w-4 h-4 mx-auto mb-1 text-gray-500" />
            <p className="text-sm font-bold text-white">{formatCurrency(bidIncrement)}</p>
            <p className="text-[10px] text-gray-500 uppercase">Increment</p>
          </div>
        </div>

        {/* Bid button */}
        <BidButton />
      </div>
    </motion.div>
  );
};

export default AuctionPanel;
