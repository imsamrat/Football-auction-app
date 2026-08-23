import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useSocket } from './SocketContext';
import { useSound } from '../hooks/useSound';
import { setCurrencySymbol } from '../utils/helpers';

const AuctionContext = createContext(null);

export const useAuction = () => {
  const context = useContext(AuctionContext);
  if (!context) throw new Error('useAuction must be used within AuctionProvider');
  return context;
};

export const AuctionProvider = ({ children }) => {
  const { socket, connected } = useSocket();
  const { playBidSound, playGoingOnceSound, playGoingTwiceSound, playFinalCallSound, playSoldSound, playStartSound, playTickSound } = useSound();

  const [auctionState, setAuctionState] = useState({
    auction: null,
    bids: [],
    nextPlayer: null,
    playerQueue: [],
    bidders: [],
    settings: null,
    totalPlayers: 0,
    completedPlayers: 0,
    breakMode: false,
    breakMessage: '',
  });

  const [remainingTime, setRemainingTime] = useState(0);
  const [stage, setStage] = useState('WAITING');
  const [soldData, setSoldData] = useState(null);
  const [unsoldData, setUnsoldData] = useState(null);
  const [lastBid, setLastBid] = useState(null);
  const timerRef = useRef(null);

  // Get current player from auction state
  const currentPlayer = auctionState.auction?.playerId || null;
  const currentAuction = auctionState.auction;
  const isLive = currentAuction?.status === 'LIVE';
  const isPaused = currentAuction?.status === 'PAUSED';

  // Local countdown timer (visual only, synced with server ticks)
  useEffect(() => {
    if (isLive && remainingTime > 0) {
      timerRef.current = setInterval(() => {
        setRemainingTime(prev => {
          const newVal = Math.max(0, prev - 1);
          if (newVal > 0) {
            playTickSound();
          }
          return newVal;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLive, remainingTime > 0]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const onState = (data) => {
      setAuctionState(data);
      // Sync currency symbol from settings
      if (data.settings?.currencySymbol) {
        setCurrencySymbol(data.settings.currencySymbol);
      }
      if (data.auction) {
        setRemainingTime(data.auction.remainingTime || 0);
        setStage(data.auction.stage || 'WAITING');
      } else {
        setRemainingTime(0);
        setStage('WAITING');
      }
      // Clear sold/unsold overlays when new auction starts
      if (data.auction?.status === 'LIVE') {
        setSoldData(null);
        setUnsoldData(null);
      }
    };

    const onTick = (data) => {
      setRemainingTime(data.remainingTime);
      setStage((prev) => {
        if (prev !== data.stage) {
          if (data.stage === 'GOING_ONCE') playGoingOnceSound();
          if (data.stage === 'GOING_TWICE') playGoingTwiceSound();
          if (data.stage === 'FINAL_CALL') playFinalCallSound();
        }
        return data.stage;
      });
      // Also update some auction fields
      setAuctionState(prev => ({
        ...prev,
        auction: prev.auction ? {
          ...prev.auction,
          currentBid: data.currentBid,
          highestBidderName: data.highestBidderName,
          highestBidderTeam: data.highestBidderTeam,
          totalBids: data.totalBids,
          remainingTime: data.remainingTime,
          stage: data.stage,
        } : null,
      }));
    };

    const onBid = (data) => {
      playBidSound();
      setLastBid(data.bid);
      setAuctionState(prev => ({
        ...prev,
        auction: prev.auction ? {
          ...prev.auction,
          currentBid: data.auction.currentBid,
          highestBidderName: data.auction.highestBidderName,
          highestBidderTeam: data.auction.highestBidderTeam,
          totalBids: data.auction.totalBids,
        } : null,
        bids: [data.bid, ...prev.bids].slice(0, 50),
      }));
      if (data.auction.remainingTime !== undefined) {
        setRemainingTime(data.auction.remainingTime);
      }
    };

    const onSold = (data) => {
      playSoldSound();
      setSoldData(data);
      setStage('SOLD');
      setRemainingTime(0);
    };

    const onUnsold = (data) => {
      setUnsoldData(data);
      setStage('UNSOLD');
      setRemainingTime(0);
    };

    const onStarted = (data) => {
      playStartSound();
      setSoldData(null);
      setUnsoldData(null);
      setLastBid(null);
      onState(data);
    };

    socket.on('auction:state', onState);
    socket.on('auction:tick', onTick);
    socket.on('auction:bid', onBid);
    socket.on('auction:sold', onSold);
    socket.on('auction:unsold', onUnsold);
    socket.on('auction:started', onStarted);
    socket.on('auction:paused', onState);
    socket.on('auction:resumed', onState);
    socket.on('auction:reset', onState);
    socket.on('auction:skipped', onState);
    socket.on('auction:nextPlayer', onState);
    socket.on('auction:breakStarted', onState);
    socket.on('auction:breakEnded', onState);

    return () => {
      socket.off('auction:state', onState);
      socket.off('auction:tick', onTick);
      socket.off('auction:bid', onBid);
      socket.off('auction:sold', onSold);
      socket.off('auction:unsold', onUnsold);
      socket.off('auction:started', onStarted);
      socket.off('auction:paused', onState);
      socket.off('auction:resumed', onState);
      socket.off('auction:reset', onState);
      socket.off('auction:skipped', onState);
      socket.off('auction:nextPlayer', onState);
      socket.off('auction:breakStarted', onState);
      socket.off('auction:breakEnded', onState);
    };
  }, [socket, playBidSound, playGoingOnceSound, playGoingTwiceSound, playFinalCallSound, playSoldSound, playStartSound, playTickSound]);

  const dismissSold = useCallback(() => setSoldData(null), []);
  const dismissUnsold = useCallback(() => setUnsoldData(null), []);

  return (
    <AuctionContext.Provider value={{
      ...auctionState,
      remainingTime,
      stage,
      soldData,
      unsoldData,
      lastBid,
      currentPlayer,
      currentAuction,
      isLive,
      isPaused,
      dismissSold,
      dismissUnsold,
    }}>
      {children}
    </AuctionContext.Provider>
  );
};
