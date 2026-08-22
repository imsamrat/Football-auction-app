const Bid = require('../models/Bid');
const Auction = require('../models/Auction');
const Bidder = require('../models/Bidder');
const Settings = require('../models/Settings');

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

    // 4. Validate amount
    const settings = await Settings.findOne() || { bidIncrement: 500 };
    const minBid = auction.currentBid > 0
      ? auction.currentBid + auction.bidIncrement
      : auction.basePrice + auction.bidIncrement;

    // If no bids yet, first bid must be at least basePrice
    if (auction.totalBids === 0 && amount < auction.basePrice) {
      throw new Error(`Bid must be at least ৳${auction.basePrice.toLocaleString()}`);
    }

    if (auction.totalBids > 0 && amount < minBid) {
      throw new Error(`Bid must be at least ৳${minBid.toLocaleString()} (current bid + ৳${auction.bidIncrement.toLocaleString()} increment)`);
    }

    // Validate bid follows increment steps
    const effectiveBase = auction.totalBids === 0 ? auction.basePrice : auction.currentBid;
    if (auction.totalBids > 0 && (amount - effectiveBase) % auction.bidIncrement !== 0) {
      throw new Error(`Bid must be in increments of ৳${auction.bidIncrement.toLocaleString()}`);
    }

    // 5. Check budget
    if (amount > bidder.remainingBudget) {
      throw new Error(`Insufficient budget. Remaining: ৳${bidder.remainingBudget.toLocaleString()}`);
    }

    // 6. Prevent same bidder from bidding against themselves
    if (auction.highestBidderId && auction.highestBidderId.toString() === bidderId.toString()) {
      throw new Error('You are already the highest bidder');
    }

    // 7. Create bid record
    const bid = await Bid.create({
      playerId: auction.playerId,
      auctionId: auction._id,
      bidderId: bidder._id,
      bidderName: bidder.name,
      bidderTeam: bidder.team,
      amount,
    });

    // 8. Update auction
    auction.currentBid = amount;
    auction.highestBidderId = bidder._id;
    auction.highestBidderName = bidder.name;
    auction.highestBidderTeam = bidder.team;
    auction.totalBids += 1;

    // 9. Check for bid extension
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    if (settings.bidExtensionEnabled && remainingSeconds <= settings.bidExtensionThreshold) {
      await this.auctionTimerService.extendTimer(settings.bidExtensionTime);
      // Re-fetch auction to get updated endTime
      const updatedAuction = await Auction.findById(auction._id);
      if (updatedAuction) {
        auction.endTime = updatedAuction.endTime;
      }
    }

    await auction.save();

    return {
      bid: bid.toObject(),
      auction: {
        currentBid: auction.currentBid,
        highestBidderName: auction.highestBidderName,
        highestBidderTeam: auction.highestBidderTeam,
        totalBids: auction.totalBids,
        remainingTime: Math.max(0, Math.ceil((auction.endTime.getTime() - Date.now()) / 1000)),
      },
    };
  }
}

module.exports = BidService;
