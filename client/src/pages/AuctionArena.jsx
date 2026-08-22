import { motion } from 'framer-motion';
import { Radio, Users } from 'lucide-react';
import { useAuction } from '../context/AuctionContext';
import PlayerCard from '../components/PlayerCard';
import AuctionPanel from '../components/AuctionPanel';
import BidHistory from '../components/BidHistory';
import ActiveBidders from '../components/ActiveBidders';
import PlayerQueue from '../components/PlayerQueue';
import SoldOverlay from '../components/SoldOverlay';
import { formatCurrency, getStageLabel, getStageColor } from '../utils/helpers';

const AuctionArena = () => {
  const {
    currentAuction, currentPlayer, isLive, isPaused,
    remainingTime, stage, totalPlayers, completedPlayers,
    nextPlayer, bidders,
  } = useAuction();

  return (
    <div className="min-h-screen">
      {/* Sold/Unsold overlay */}
      <SoldOverlay />

      {/* Top status bar */}
      <div className="bg-dark-100/80 backdrop-blur-sm border-b border-dark-50/50 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-4">
            {(isLive || isPaused) ? (
              <div className="badge-live">
                <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                LIVE AUCTION
              </div>
            ) : (
              <div className="badge-upcoming">
                <Radio className="w-3 h-3" />
                WAITING
              </div>
            )}

            {currentPlayer && (
              <span className="text-sm text-gray-400 hidden sm:inline">
                #{currentPlayer.playerNumber} {currentPlayer.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-400">
            {(isLive || isPaused) && (
              <>
                <span className={`font-bold ${getStageColor(stage)}`}>
                  {getStageLabel(stage)}
                </span>
                <span className="hidden sm:inline">
                  Bid: <span className="text-white font-bold">{formatCurrency(currentAuction?.currentBid || 0)}</span>
                </span>
              </>
            )}
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {completedPlayers}/{totalPlayers}
            </span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column - Player + Queue */}
          <div className="lg:col-span-5 space-y-6">
            <PlayerCard player={currentPlayer} />
            <div className="hidden lg:block">
              <PlayerQueue />
            </div>
          </div>

          {/* Center column - Auction Panel */}
          <div className="lg:col-span-4">
            <AuctionPanel />
          </div>

          {/* Right column - History + Bidders */}
          <div className="lg:col-span-3 space-y-6">
            <BidHistory />
            <ActiveBidders />
          </div>

          {/* Mobile: Queue */}
          <div className="lg:hidden">
            <PlayerQueue />
          </div>
        </div>

        {/* No active auction message */}
        {!isLive && !isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 glass-card p-8 text-center"
          >
            <Radio className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-display font-bold text-white mb-2">
              {nextPlayer ? 'Auction Not Started' : 'All Auctions Complete'}
            </h3>
            <p className="text-gray-400">
              {nextPlayer
                ? `Next player: #${nextPlayer.playerNumber} ${nextPlayer.name}. Waiting for admin to start the auction.`
                : 'All players have been auctioned. Check the results page for final standings.'
              }
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AuctionArena;
