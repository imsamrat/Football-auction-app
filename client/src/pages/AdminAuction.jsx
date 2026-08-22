import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipForward, CheckCircle, XCircle, ChevronRight, Radio, Settings } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuction } from '../context/AuctionContext';
import { formatCurrency, formatTime, getStageLabel, getStageColor, getPlayerInitials, getPositionColor } from '../utils/helpers';
import PlayerCard from '../components/PlayerCard';
import BidHistory from '../components/BidHistory';
import SoldOverlay from '../components/SoldOverlay';
import toast from 'react-hot-toast';

const AdminAuction = () => {
  const { emit } = useSocket();
  const {
    currentAuction, currentPlayer, isLive, isPaused,
    remainingTime, stage, bids, bidders,
    nextPlayer, playerQueue, totalPlayers, completedPlayers,
    settings
  } = useAuction();

  const isLoaded = currentAuction?.status === 'UPCOMING';

  const emitAction = (event, data = {}) => {
    emit(event, data, (response) => {
      if (response?.error) {
        toast.error(response.error);
      }
    });
  };

  const handleStart = () => {
    const playerId = currentPlayer?._id || nextPlayer?._id;
    if (!playerId) {
      toast.error('No player available');
      return;
    }
    emitAction('auction:start', { playerId });
    toast.success('Auction started!');
  };

  return (
    <div>
      <SoldOverlay />

      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-white">Auction Control</h1>
        <p className="text-gray-400 mt-1">Manage the live auction</p>
      </div>

      {/* Status bar */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Radio className={`w-4 h-4 ${isLive ? 'text-red-400 animate-pulse' : 'text-gray-500'}`} />
            <span className={isLive ? 'text-red-400 font-bold' : 'text-gray-400'}>
              {isLive ? 'LIVE' : isPaused ? 'PAUSED' : 'IDLE'}
            </span>
          </div>
          <span className="text-gray-600">|</span>
          <span className="text-gray-400">
            Players: <span className="text-white font-bold">{completedPlayers}/{totalPlayers}</span>
          </span>
          {(isLive || isPaused) && (
            <>
              <span className="text-gray-600">|</span>
              <span className="text-gray-400">
                Bid: <span className="text-primary font-bold">{formatCurrency(currentAuction?.currentBid || 0)}</span>
              </span>
              <span className="text-gray-600">|</span>
              <span className="text-gray-400">
                Bidder: <span className="text-white font-bold">{currentAuction?.highestBidderName || '—'}</span>
              </span>
              <span className="text-gray-600">|</span>
              <span className={`font-bold ${getStageColor(stage)}`}>
                {formatTime(remainingTime)} — {getStageLabel(stage)}
              </span>
              <span className="text-gray-600">|</span>
              <span className="text-gray-400">
                Bids: <span className="text-white font-bold">{currentAuction?.totalBids || 0}</span>
              </span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left - Player */}
        <div className="lg:col-span-4">
          <PlayerCard player={currentPlayer} />

          {/* Next player preview */}
          {nextPlayer && !isLive && !isPaused && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 mt-4"
            >
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Next Player</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {nextPlayer.playerNumber}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{nextPlayer.name}</p>
                  <p className="text-xs text-gray-400">{nextPlayer.position} · {formatCurrency(nextPlayer.basePrice)}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Center - Controls + Bid history */}
        <div className="lg:col-span-4 space-y-6">
          {/* Controls */}
          <div className="glass-card p-6">
            <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-4 font-bold">Auction Controls</h3>

            <div className="grid grid-cols-2 gap-3">
              {!isLive && !isPaused ? (
                <button onClick={handleStart} className="col-span-2 btn-primary flex items-center justify-center gap-2 !py-4">
                  <Play className="w-5 h-5" />
                  START AUCTION
                </button>
              ) : (
                <>
                  {isLive && (
                    <button onClick={() => emitAction('auction:pause')} className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                      <Pause className="w-4 h-4" /> PAUSE
                    </button>
                  )}
                  {isPaused && (
                    <button onClick={() => emitAction('auction:resume')} className="bg-green-500/20 text-green-400 hover:bg-green-500/30 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                      <Play className="w-4 h-4" /> RESUME
                    </button>
                  )}
                  <button onClick={() => emitAction('auction:reset')} className="bg-dark-200 text-gray-300 hover:bg-dark-300 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 border border-dark-50">
                    <RotateCcw className="w-4 h-4" /> RESET
                  </button>
                  <button onClick={() => emitAction('auction:markSold')} className="bg-green-500/20 text-green-400 hover:bg-green-500/30 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" /> SOLD
                  </button>
                  <button onClick={() => emitAction('auction:markUnsold')} className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                    <XCircle className="w-4 h-4" /> UNSOLD
                  </button>
                  <button onClick={() => emitAction('auction:skip')} className="col-span-2 bg-dark-200 text-gray-300 hover:bg-dark-300 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 border border-dark-50">
                    <SkipForward className="w-4 h-4" /> SKIP PLAYER
                  </button>
                </>
              )}
            </div>

            {!isLive && !isPaused && !isLoaded && (
              <button onClick={() => emitAction('auction:nextPlayer')} className="w-full mt-3 btn-dark flex items-center justify-center gap-2">
                <ChevronRight className="w-4 h-4" /> LOAD NEXT PLAYER
              </button>
            )}
          </div>

          <BidHistory />
        </div>

        {/* Right - Player Queue + Bidders */}
        <div className="lg:col-span-4 space-y-6">
          {/* Queue */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-dark-50/50">
              <h3 className="text-sm text-gray-400 uppercase tracking-wider font-bold">Player Queue</h3>
            </div>
            <div className="max-h-[250px] overflow-y-auto">
              {playerQueue?.map((p, i) => (
                <div key={p._id} className="flex items-center gap-3 px-4 py-2.5 border-b border-dark-50/30 hover:bg-dark-200/30">
                  <span className="text-xs font-bold text-primary w-6">#{p.playerNumber}</span>
                  <span className="text-sm text-white flex-1 truncate">{p.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${getPositionColor(p.position)}`}>{p.position}</span>
                </div>
              ))}
              {(!playerQueue || playerQueue.length === 0) && (
                <div className="p-4 text-center text-gray-500 text-sm">No upcoming players</div>
              )}
            </div>
          </div>

          {/* Bidders */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-dark-50/50">
              <h3 className="text-sm text-gray-400 uppercase tracking-wider font-bold">Active Bidders</h3>
            </div>
            <div className="max-h-[250px] overflow-y-auto">
              {bidders?.map((b) => (
                <div key={b._id} className={`flex items-center justify-between px-4 py-2.5 border-b border-dark-50/30 ${currentAuction?.highestBidderId === b._id ? 'bg-primary/5' : ''}`}>
                  <div>
                    <p className="text-sm font-semibold text-white">{b.name}</p>
                    <p className="text-xs text-gray-500">{b.team}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-300">{formatCurrency(b.remainingBudget)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuction;
