const Auction = require('../models/Auction');
const AuctionResult = require('../models/AuctionResult');
const Player = require('../models/Player');
const Bid = require('../models/Bid');
const Bidder = require('../models/Bidder');

// Get current auction state
exports.getCurrentAuction = async (req, res, next) => {
  try {
    const auction = await Auction.findOne({
      status: { $in: ['LIVE', 'PAUSED'] }
    }).populate('playerId');

    if (!auction) {
      // Find the next upcoming player
      const nextPlayer = await Player.findOne({ status: 'UPCOMING' }).sort({ auctionOrder: 1 });
      return res.json({ auction: null, nextPlayer });
    }

    // Get bids for this auction
    const bids = await Bid.find({ auctionId: auction._id })
      .sort({ createdAt: -1 })
      .limit(50);

    // Calculate remaining time from server timestamps
    let remainingTime = 0;
    if (auction.status === 'LIVE' && auction.endTime) {
      remainingTime = Math.max(0, Math.ceil((auction.endTime.getTime() - Date.now()) / 1000));
    } else if (auction.status === 'PAUSED') {
      remainingTime = auction.remainingTimeWhenPaused || 0;
    }

    res.json({
      auction: {
        ...auction.toObject(),
        remainingTime,
      },
      bids,
    });
  } catch (error) {
    next(error);
  }
};

// Get auction results
exports.getResults = async (req, res, next) => {
  try {
    const results = await AuctionResult.find()
      .sort({ createdAt: -1 })
      .populate('playerId', 'playerNumber name photo position');
    res.json(results);
  } catch (error) {
    next(error);
  }
};

// Get auction stats
exports.getStats = async (req, res, next) => {
  try {
    const totalPlayers = await Player.countDocuments();
    const soldPlayers = await Player.countDocuments({ status: 'SOLD' });
    const unsoldPlayers = await Player.countDocuments({ status: 'UNSOLD' });
    const upcomingPlayers = await Player.countDocuments({ status: 'UPCOMING' });

    const soldResults = await AuctionResult.find({ status: 'SOLD' });

    const totalAuctionValue = soldResults.reduce((sum, r) => sum + r.finalPrice, 0);
    const highestSale = soldResults.length > 0
      ? soldResults.reduce((max, r) => r.finalPrice > max.finalPrice ? r : max, soldResults[0])
      : null;

    const bidders = await Bidder.find().sort({ totalSpent: -1 });

    res.json({
      totalPlayers,
      soldPlayers,
      unsoldPlayers,
      upcomingPlayers,
      totalAuctionValue,
      highestSale: highestSale ? {
        playerName: highestSale.playerName,
        finalPrice: highestSale.finalPrice,
        bidderName: highestSale.bidderName,
      } : null,
      bidders: bidders.map(b => ({
        id: b._id,
        name: b.name,
        team: b.team,
        totalSpent: b.totalSpent,
        playersPurchased: b.playersPurchased.length,
        remainingBudget: b.remainingBudget,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// Get single auction result
exports.getResult = async (req, res, next) => {
  try {
    const result = await AuctionResult.findById(req.params.id).populate('playerId');
    if (!result) return res.status(404).json({ message: 'Result not found' });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get bids for a specific player
exports.getPlayerBids = async (req, res, next) => {
  try {
    const bids = await Bid.find({ playerId: req.params.playerId }).sort({ amount: -1 });
    res.json(bids);
  } catch (error) {
    next(error);
  }
};
