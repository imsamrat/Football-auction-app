const Auction = require('../models/Auction');
const Player = require('../models/Player');
const Bidder = require('../models/Bidder');
const AuctionResult = require('../models/AuctionResult');
const Settings = require('../models/Settings');

class AuctionTimerService {
  constructor(io) {
    this.io = io;
    this.tickInterval = null;
    this.currentAuctionId = null;
    this.autoAuctionTimeout = null;
  }

  async getSettings() {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    return settings;
  }

  getStage(remainingTime, totalDuration) {
    if (remainingTime <= 0) return 'SOLD';
    const thirdDuration = totalDuration / 3;
    if (remainingTime > thirdDuration * 2) return 'GOING_ONCE';
    if (remainingTime > thirdDuration) return 'GOING_TWICE';
    return 'FINAL_CALL';
  }

  async startAuction(playerId) {
    // Check if there's already a live auction
    let auction = await Auction.findOne({ status: { $in: ['LIVE', 'PAUSED'] } });
    if (auction) {
      throw new Error('Another auction is already in progress');
    }

    const player = await Player.findById(playerId);
    if (!player) throw new Error('Player not found');
    if (player.status !== 'UPCOMING') throw new Error('Player is not available for auction');

    const settings = await this.getSettings();
    const duration = settings.auctionDuration * 1000; // ms

    const now = new Date();
    const endTime = new Date(now.getTime() + duration);

    auction = await Auction.findOne({ playerId: player._id, status: 'UPCOMING' });
    if (auction) {
      auction.startTime = now;
      auction.endTime = endTime;
      auction.currentBid = 0;
      auction.stage = 'GOING_ONCE';
      auction.status = 'LIVE';
      await auction.save();
    } else {
      auction = await Auction.create({
        playerId: player._id,
        startTime: now,
        endTime,
        currentBid: 0,
        basePrice: player.basePrice,
        bidIncrement: settings.bidIncrement,
        stage: 'GOING_ONCE',
        status: 'LIVE',
      });
    }

    // Update player status
    player.status = 'LIVE';
    await player.save();

    this.currentAuctionId = auction._id;
    this.startTicking();

    // Broadcast auction started
    const fullState = await this.getFullState();
    this.io.emit('auction:started', fullState);
    this.io.emit('auction:state', fullState);

    return fullState;
  }

  async pauseAuction() {
    const auction = await Auction.findById(this.currentAuctionId);
    if (!auction || auction.status !== 'LIVE') {
      throw new Error('No live auction to pause');
    }

    const remainingMs = Math.max(0, auction.endTime.getTime() - Date.now());
    const remainingTime = Math.ceil(remainingMs / 1000);

    auction.status = 'PAUSED';
    auction.stage = 'PAUSED';
    auction.pausedAt = new Date();
    auction.remainingTimeWhenPaused = remainingTime;
    await auction.save();

    this.stopTicking();

    const fullState = await this.getFullState();
    this.io.emit('auction:paused', fullState);
    this.io.emit('auction:state', fullState);

    return fullState;
  }

  async resumeAuction() {
    const auction = await Auction.findById(this.currentAuctionId);
    if (!auction || auction.status !== 'PAUSED') {
      throw new Error('No paused auction to resume');
    }

    const remainingMs = (auction.remainingTimeWhenPaused || 0) * 1000;
    const now = new Date();
    auction.endTime = new Date(now.getTime() + remainingMs);
    auction.status = 'LIVE';
    auction.pausedAt = null;
    auction.remainingTimeWhenPaused = null;

    // Recalculate stage
    const settings = await this.getSettings();
    const remainingTime = Math.ceil(remainingMs / 1000);
    auction.stage = this.getStage(remainingTime, settings.auctionDuration);

    await auction.save();

    this.startTicking();

    const fullState = await this.getFullState();
    this.io.emit('auction:resumed', fullState);
    this.io.emit('auction:state', fullState);

    return fullState;
  }

  async resetAuction() {
    const auction = await Auction.findById(this.currentAuctionId);
    if (!auction) throw new Error('No auction to reset');

    this.stopTicking();

    // Reset player status
    const player = await Player.findById(auction.playerId);
    if (player) {
      player.status = 'UPCOMING';
      await player.save();
    }

    // Delete bids for this auction
    const Bid = require('../models/Bid');
    await Bid.deleteMany({ auctionId: auction._id });

    // Delete the auction
    await auction.deleteOne();
    this.currentAuctionId = null;

    const fullState = await this.getFullState();
    this.io.emit('auction:reset', fullState);
    this.io.emit('auction:state', fullState);

    return fullState;
  }

  async skipPlayer() {
    const auction = await Auction.findById(this.currentAuctionId);
    if (auction) {
      this.stopTicking();

      const player = await Player.findById(auction.playerId);
      if (player) {
        player.status = 'UNSOLD';
        await player.save();
      }

      // Save result
      await AuctionResult.create({
        playerId: auction.playerId,
        playerName: player ? player.name : 'Unknown',
        playerNumber: player ? player.playerNumber : 0,
        position: player ? player.position : '',
        division: player ? player.division : '',
        basePrice: auction.basePrice,
        finalPrice: 0,
        totalBids: auction.totalBids,
        status: 'UNSOLD',
        auctionStartTime: auction.startTime,
        auctionEndTime: new Date(),
      });

      auction.status = 'COMPLETED';
      auction.stage = 'UNSOLD';
      auction.completedAt = new Date();
      await auction.save();

      this.currentAuctionId = null;
    }

    const fullState = await this.getFullState();
    this.io.emit('auction:skipped', fullState);
    this.io.emit('auction:state', fullState);

    return fullState;
  }

  async markSold() {
    const auction = await Auction.findById(this.currentAuctionId);
    if (!auction) throw new Error('No auction in progress');

    this.stopTicking();
    await this.finalizeAuction(auction, true);

    return await this.getFullState();
  }

  async markUnsold() {
    const auction = await Auction.findById(this.currentAuctionId);
    if (!auction) throw new Error('No auction in progress');

    this.stopTicking();
    await this.finalizeAuction(auction, false);

    return await this.getFullState();
  }

  async finalizeAuction(auction, forceSold = null) {
    const player = await Player.findById(auction.playerId);
    const hasBids = auction.totalBids > 0 && auction.highestBidderId;

    let isSold;
    if (forceSold !== null) {
      isSold = forceSold && hasBids;
    } else {
      isSold = hasBids;
    }

    if (isSold) {
      // Mark player as SOLD
      if (player) {
        player.status = 'SOLD';
        await player.save();
      }

      // Update bidder
      const bidder = await Bidder.findById(auction.highestBidderId);
      if (bidder) {
        const price = auction.currentBid;
        bidder.totalSpent += price;
        bidder.remainingBudget = bidder.budget - bidder.totalSpent;
        bidder.playersPurchased.push({
          playerId: auction.playerId,
          playerName: player ? player.name : 'Unknown',
          price,
        });
        await bidder.save();
      }

      // Save auction result
      await AuctionResult.create({
        playerId: auction.playerId,
        playerName: player ? player.name : 'Unknown',
        playerNumber: player ? player.playerNumber : 0,
        position: player ? player.position : '',
        division: player ? player.division : '',
        bidderId: auction.highestBidderId,
        bidderName: auction.highestBidderName,
        bidderTeam: auction.highestBidderTeam,
        basePrice: auction.basePrice,
        finalPrice: auction.currentBid,
        totalBids: auction.totalBids,
        status: 'SOLD',
        auctionStartTime: auction.startTime,
        auctionEndTime: new Date(),
      });

      auction.status = 'COMPLETED';
      auction.stage = 'SOLD';
      auction.finalPrice = auction.currentBid;
      auction.completedAt = new Date();
      await auction.save();

      // Broadcast SOLD
      this.io.emit('auction:sold', {
        playerId: auction.playerId,
        playerName: player ? player.name : 'Unknown',
        playerNumber: player ? player.playerNumber : 0,
        bidderName: auction.highestBidderName,
        bidderTeam: auction.highestBidderTeam,
        finalPrice: auction.currentBid,
        totalBids: auction.totalBids,
      });
    } else {
      // Mark player as UNSOLD
      if (player) {
        player.status = 'UNSOLD';
        await player.save();
      }

      await AuctionResult.create({
        playerId: auction.playerId,
        playerName: player ? player.name : 'Unknown',
        playerNumber: player ? player.playerNumber : 0,
        position: player ? player.position : '',
        division: player ? player.division : '',
        basePrice: auction.basePrice,
        finalPrice: 0,
        totalBids: auction.totalBids,
        status: 'UNSOLD',
        auctionStartTime: auction.startTime,
        auctionEndTime: new Date(),
      });

      auction.status = 'COMPLETED';
      auction.stage = 'UNSOLD';
      auction.finalPrice = 0;
      auction.completedAt = new Date();
      await auction.save();

      this.io.emit('auction:unsold', {
        playerId: auction.playerId,
        playerName: player ? player.name : 'Unknown',
        playerNumber: player ? player.playerNumber : 0,
      });
    }

    this.currentAuctionId = null;

    // Check for auto-auction
    const settings = await this.getSettings();
    if (settings.autoAuction) {
      this.autoAuctionTimeout = setTimeout(async () => {
        try {
          const nextPlayer = await Player.findOne({ status: 'UPCOMING' }).sort({ auctionOrder: 1 });
          if (nextPlayer) {
            await this.startAuction(nextPlayer._id);
          }
        } catch (err) {
          console.error('Auto auction error:', err.message);
        }
      }, (settings.autoAuctionDelay || 5) * 1000);
    }

    // Emit updated state
    const fullState = await this.getFullState();
    this.io.emit('auction:state', fullState);
  }

  startTicking() {
    this.stopTicking();
    this.tickInterval = setInterval(() => this.tick(), 1000);
  }

  stopTicking() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  async tick() {
    try {
      const auction = await Auction.findById(this.currentAuctionId);
      if (!auction || auction.status !== 'LIVE') {
        this.stopTicking();
        return;
      }

      const remainingMs = Math.max(0, auction.endTime.getTime() - Date.now());
      const remainingTime = Math.ceil(remainingMs / 1000);
      const settings = await this.getSettings();
      const stage = this.getStage(remainingTime, settings.auctionDuration);

      // Update stage if changed
      if (auction.stage !== stage) {
        auction.stage = stage;
        await auction.save();
      }

      if (remainingTime <= 0) {
        // Auction time is up
        this.stopTicking();
        await this.finalizeAuction(auction);
        return;
      }

      // Broadcast tick
      this.io.emit('auction:tick', {
        remainingTime,
        stage,
        currentBid: auction.currentBid,
        highestBidderName: auction.highestBidderName,
        highestBidderTeam: auction.highestBidderTeam,
        totalBids: auction.totalBids,
      });
    } catch (error) {
      console.error('Tick error:', error.message);
    }
  }

  async extendTimer(seconds) {
    const auction = await Auction.findById(this.currentAuctionId);
    if (!auction || auction.status !== 'LIVE') return;

    auction.endTime = new Date(auction.endTime.getTime() + seconds * 1000);
    await auction.save();
  }

  async getFullState() {
    const auction = await Auction.findOne({
      status: { $in: ['UPCOMING', 'LIVE', 'PAUSED'] }
    }).populate('playerId');

    const nextPlayer = await Player.findOne({ status: 'UPCOMING' }).sort({ auctionOrder: 1 });
    const playerQueue = await Player.find({ status: 'UPCOMING' }).sort({ auctionOrder: 1 }).limit(10);
    const bidders = await Bidder.find({ status: 'ACTIVE' }).sort({ bidderNumber: 1 });
    const settings = await this.getSettings();

    // Count players
    const totalPlayers = await Player.countDocuments();
    const completedPlayers = await Player.countDocuments({ status: { $in: ['SOLD', 'UNSOLD'] } });

    let auctionData = null;
    let bids = [];

    if (auction) {
      const Bid = require('../models/Bid');
      bids = await Bid.find({ auctionId: auction._id }).sort({ createdAt: -1 }).limit(50);

      let remainingTime = 0;
      if (auction.status === 'LIVE' && auction.endTime) {
        remainingTime = Math.max(0, Math.ceil((auction.endTime.getTime() - Date.now()) / 1000));
      } else if (auction.status === 'PAUSED') {
        remainingTime = auction.remainingTimeWhenPaused || 0;
      }

      auctionData = {
        ...auction.toObject(),
        remainingTime,
      };
    }

    return {
      auction: auctionData,
      bids,
      nextPlayer,
      playerQueue,
      bidders: bidders.map(b => ({
        _id: b._id,
        name: b.name,
        bidderNumber: b.bidderNumber,
        team: b.team,
        budget: b.budget,
        remainingBudget: b.remainingBudget,
        totalSpent: b.totalSpent,
        playersPurchased: b.playersPurchased.length,
      })),
      settings,
      totalPlayers,
      completedPlayers,
    };
  }

  async loadNextPlayer() {
    let auction = await Auction.findOne({ status: { $in: ['UPCOMING', 'LIVE', 'PAUSED'] } });
    if (auction) {
      return await this.getFullState(); // Already loaded or active
    }

    const nextPlayer = await Player.findOne({ status: 'UPCOMING' }).sort({ auctionOrder: 1 });
    if (!nextPlayer) {
      throw new Error('No more players available');
    }

    auction = await Auction.create({
      playerId: nextPlayer._id,
      basePrice: nextPlayer.basePrice,
      status: 'UPCOMING',
      stage: 'WAITING',
      currentBid: 0,
      totalBids: 0,
    });
    this.currentAuctionId = auction._id;

    const fullState = await this.getFullState();
    this.io.emit('auction:nextPlayer', fullState);
    this.io.emit('auction:state', fullState);

    return fullState;
  }

  cleanup() {
    this.stopTicking();
    if (this.autoAuctionTimeout) {
      clearTimeout(this.autoAuctionTimeout);
    }
  }
}

module.exports = AuctionTimerService;
