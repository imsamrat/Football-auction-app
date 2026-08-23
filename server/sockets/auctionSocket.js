const jwt = require('jsonwebtoken');
const config = require('../config');
const AuctionTimerService = require('../services/auctionTimerService');
const BidService = require('../services/bidService');

module.exports = function setupAuctionSocket(io) {
  const auctionTimerService = new AuctionTimerService(io);
  const bidService = new BidService(auctionTimerService);

  // Store services on io for access from routes if needed
  io.auctionTimerService = auctionTimerService;
  io.bidService = bidService;

  // Socket.IO middleware for optional authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, config.jwtSecret);
        socket.user = decoded;
      } catch (err) {
        // Token invalid, but we still allow connection for public viewing
        socket.user = null;
      }
    } else {
      socket.user = null;
    }
    next();
  });

  io.on('connection', async (socket) => {
    console.log(`🔌 Client connected: ${socket.id} (${socket.user ? socket.user.role + ': ' + (socket.user.name || socket.user.username) : 'public'})`);

    // Send current state on connect
    try {
      const fullState = await auctionTimerService.getFullState();
      socket.emit('auction:state', fullState);
    } catch (err) {
      console.error('Error sending initial state:', err.message);
    }

    // ─── BIDDER EVENTS ───

    socket.on('bid:place', async (data, callback) => {
      try {
        if (!socket.user || socket.user.role !== 'bidder') {
          const err = 'Authentication required. Please login as a bidder.';
          socket.emit('auction:error', { message: err });
          if (callback) callback({ error: err });
          return;
        }

        const { amount } = data;
        const result = await bidService.placeBid(socket.user.id, amount);

        // Broadcast to all
        io.emit('auction:bid', {
          bid: result.bid,
          auction: result.auction,
        });

        // Send updated full state
        const fullState = await auctionTimerService.getFullState();
        io.emit('auction:state', fullState);

        if (callback) callback({ success: true, bid: result.bid });
      } catch (error) {
        const msg = error.message || 'Bid failed';
        socket.emit('auction:error', { message: msg });
        if (callback) callback({ error: msg });
      }
    });

    // ─── ADMIN EVENTS ───

    const requireAdmin = (callback) => {
      if (!socket.user || socket.user.role !== 'admin') {
        const err = 'Admin access required';
        socket.emit('auction:error', { message: err });
        if (callback) callback({ error: err });
        return false;
      }
      return true;
    };

    socket.on('auction:start', async (data, callback) => {
      if (!requireAdmin(callback)) return;
      try {
        const { playerId } = data;
        const state = await auctionTimerService.startAuction(playerId);
        if (callback) callback({ success: true });
      } catch (error) {
        socket.emit('auction:error', { message: error.message });
        if (callback) callback({ error: error.message });
      }
    });

    socket.on('auction:pause', async (data, callback) => {
      if (!requireAdmin(callback)) return;
      try {
        await auctionTimerService.pauseAuction();
        if (callback) callback({ success: true });
      } catch (error) {
        socket.emit('auction:error', { message: error.message });
        if (callback) callback({ error: error.message });
      }
    });

    socket.on('auction:resume', async (data, callback) => {
      if (!requireAdmin(callback)) return;
      try {
        await auctionTimerService.resumeAuction();
        if (callback) callback({ success: true });
      } catch (error) {
        socket.emit('auction:error', { message: error.message });
        if (callback) callback({ error: error.message });
      }
    });

    socket.on('auction:reset', async (data, callback) => {
      if (!requireAdmin(callback)) return;
      try {
        await auctionTimerService.resetAuction();
        if (callback) callback({ success: true });
      } catch (error) {
        socket.emit('auction:error', { message: error.message });
        if (callback) callback({ error: error.message });
      }
    });

    socket.on('auction:skip', async (data, callback) => {
      if (!requireAdmin(callback)) return;
      try {
        await auctionTimerService.skipPlayer();
        if (callback) callback({ success: true });
      } catch (error) {
        socket.emit('auction:error', { message: error.message });
        if (callback) callback({ error: error.message });
      }
    });

    socket.on('auction:markSold', async (data, callback) => {
      if (!requireAdmin(callback)) return;
      try {
        await auctionTimerService.markSold();
        if (callback) callback({ success: true });
      } catch (error) {
        socket.emit('auction:error', { message: error.message });
        if (callback) callback({ error: error.message });
      }
    });

    socket.on('auction:markUnsold', async (data, callback) => {
      if (!requireAdmin(callback)) return;
      try {
        await auctionTimerService.markUnsold();
        if (callback) callback({ success: true });
      } catch (error) {
        socket.emit('auction:error', { message: error.message });
        if (callback) callback({ error: error.message });
      }
    });

    socket.on('auction:nextPlayer', async (data, callback) => {
      if (!requireAdmin(callback)) return;
      try {
        await auctionTimerService.loadNextPlayer();
        if (callback) callback({ success: true });
      } catch (error) {
        socket.emit('auction:error', { message: error.message });
        if (callback) callback({ error: error.message });
      }
    });

    socket.on('auction:loadPlayer', async (data, callback) => {
      if (!requireAdmin(callback)) return;
      try {
        await auctionTimerService.loadSpecificPlayer(data.playerId);
        if (callback) callback({ success: true });
      } catch (error) {
        socket.emit('auction:error', { message: error.message });
        if (callback) callback({ error: error.message });
      }
    });

    socket.on('auction:getState', async (data, callback) => {
      try {
        const fullState = await auctionTimerService.getFullState();
        socket.emit('auction:state', fullState);
        if (callback) callback({ success: true });
      } catch (error) {
        if (callback) callback({ error: error.message });
      }
    });

    socket.on('auction:startBreak', async (data, callback) => {
      if (!requireAdmin(callback)) return;
      try {
        const { message } = data;
        await auctionTimerService.startBreak(message);
        if (callback) callback({ success: true });
      } catch (error) {
        socket.emit('auction:error', { message: error.message });
        if (callback) callback({ error: error.message });
      }
    });

    socket.on('auction:endBreak', async (data, callback) => {
      if (!requireAdmin(callback)) return;
      try {
        await auctionTimerService.endBreak();
        if (callback) callback({ success: true });
      } catch (error) {
        socket.emit('auction:error', { message: error.message });
        if (callback) callback({ error: error.message });
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return { auctionTimerService, bidService };
};
