const Bid = require('../models/Bid');
const Auction = require('../models/Auction');
const Bidder = require('../models/Bidder');
const Settings = require('../models/Settings');
const { getActiveSeasonId } = require('../utils/seasonHelper');

// Calculate dynamic bid increment based on current bid amount and tier thresholds
function getBidIncrement(currentBidAmount, settings) {
  const tier3Lower = settings.bidIncrementTier3Lower ?? (settings.bidIncrementTier2Threshold || 1000000);
  const tier2Lower = settings.bidIncrementTier2Lower ?? (settings.bidIncrementTier1Threshold || 500000);

  if (currentBidAmount >= tier3Lower) {
    return settings.bidIncrementTier3 || 30000;
  } else if (currentBidAmount >= tier2Lower) {
    return settings.bidIncrementTier2 || 20000;
  } else {
    return settings.bidIncrementTier1 || 10000;
  }
}

class BidService {
  constructor(auctionTimerService) {
    this.auctionTimerService = auctionTimerService;
  }

  async placeBid(bidderId, amount) {
    // 1. Get current auction
    const auction = await Auction.findById(this.auctionTimerService.currentAuctionId);
    if (!auction) {
      throw new Error('No active auction');
    }
    if (auction.status !== 'LIVE') {
      throw new Error('Auction is not currently live');
    }

    // 2. Check timer hasn't expired (server-side check)
    const remainingMs = auction.endTime.getTime() - Date.now();
    if (remainingMs <= 0) {
      throw new Error('Auction has ended');
    }

    // 3. Validate bidder
    const bidder = await Bidder.findById(bidderId);
    if (!bidder) {
      throw new Error('Bidder not found');
    }
    if (bidder.status !== 'ACTIVE') {
      throw new Error('Bidder is inactive');
    }

    // 4. Validate amount using dynamic tiered increment
    const settings = await Settings.findOne() || {};
    const effectiveBid = auction.currentBid > 0 ? auction.currentBid : auction.basePrice;
    const dynamicIncrement = getBidIncrement(effectiveBid, settings);
    const minBid = auction.currentBid > 0
      ? auction.currentBid + dynamicIncrement
      : auction.basePrice + dynamicIncrement;

    // If no bids yet, first bid must be at least basePrice
    if (auction.totalBids === 0 && amount < auction.basePrice) {
      throw new Error(`Bid must be at least $${auction.basePrice.toLocaleString()}`);
    }

    if (auction.totalBids > 0 && amount < minBid) {
      throw new Error(`Bid must be at least $${minBid.toLocaleString()} (current bid + $${dynamicIncrement.toLocaleString()} increment)`);
    }

    // 5. Check budget
    if (amount > bidder.remainingBudget) {
      throw new Error(`Insufficient budget. Remaining: $${bidder.remainingBudget.toLocaleString()}`);
    }

    // 6. Prevent same bidder from bidding against themselves
    if (auction.highestBidderId && auction.highestBidderId.toString() === bidderId.toString()) {
      throw new Error('You are already the highest bidder');
    }

    // 7. Create bid record
    const auctionSeasonId = await getActiveSeasonId();
    const bid = await Bid.create({
      auctionSeasonId,
      playerId: auction.playerId,
      auctionId: auction._id,
      bidderId: bidder._id,
      bidderName: bidder.name,
      bidderTeam: bidder.team,
      amount,
    });

    // 8. Update auction with new dynamic increment for next bid
    const newIncrement = getBidIncrement(amount, settings);
    auction.currentBid = amount;
    auction.highestBidderId = bidder._id;
    auction.highestBidderName = bidder.name;
    auction.highestBidderTeam = bidder.team;
    auction.totalBids += 1;
    auction.bidIncrement = newIncrement;

    // 9. Reset timer to full duration on new bid
    auction.endTime = new Date(Date.now() + (settings.auctionDuration || 30) * 1000);

    await auction.save();

    return {
      bid: bid.toObject(),
      auction: {
        currentBid: auction.currentBid,
        highestBidderName: auction.highestBidderName,
        highestBidderTeam: auction.highestBidderTeam,
        totalBids: auction.totalBids,
        bidIncrement: auction.bidIncrement,
        remainingTime: Math.max(0, Math.ceil((auction.endTime.getTime() - Date.now()) / 1000)),
      },
    };
  }
}

module.exports = BidService;
