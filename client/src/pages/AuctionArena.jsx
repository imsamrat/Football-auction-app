import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Users, Maximize, Minimize, Coffee } from 'lucide-react';
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
    nextPlayer, bidders, breakMode, breakMessage,
  } = useAuction();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const arenaRef = useRef(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      arenaRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen mode: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div ref={arenaRef} className="min-h-screen bg-dark-300 overflow-y-auto">
      {/* Sold/Unsold overlay */}
      <SoldOverlay />

      {/* Break mode overlay */}
      <AnimatePresence>
        {breakMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
          >
            {/* Animated background dots */}
            <div className="absolute inset-0 overflow-hidden opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
                backgroundSize: '30px 30px',
              }} />
            </div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="text-center z-10 px-8"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              >
                <Coffee className="w-20 h-20 mx-auto mb-6 text-yellow-400" />
              </motion.div>
              <h2 className="text-5xl sm:text-6xl font-display font-black text-white mb-4 tracking-tight">
                {breakMessage}
              </h2>
              <p className="text-xl text-gray-400 font-medium">
                Auction will resume shortly
              </p>
              <div className="mt-8 flex items-center justify-center gap-2">
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
                  className="w-3 h-3 bg-yellow-400 rounded-full"
                />
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
                  className="w-3 h-3 bg-yellow-400 rounded-full"
                />
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.6 }}
                  className="w-3 h-3 bg-yellow-400 rounded-full"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
            <button 
              onClick={toggleFullscreen}
              className="p-1.5 ml-2 hover:bg-dark-50 rounded-lg text-gray-400 hover:text-white transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
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
