const AuctionSeason = require('../models/AuctionSeason');
const Player = require('../models/Player');
const Bidder = require('../models/Bidder');
const Auction = require('../models/Auction');
const AuctionResult = require('../models/AuctionResult');
const Bid = require('../models/Bid');

// Get all seasons
exports.getSeasons = async (req, res, next) => {
  try {
    const seasons = await AuctionSeason.find().sort({ createdAt: -1 });

    // Add data counts for each season
    const seasonsWithCounts = await Promise.all(seasons.map(async (season) => {
      const playerCount = await Player.countDocuments({ auctionSeasonId: season._id });
      const bidderCount = await Bidder.countDocuments({ auctionSeasonId: season._id });
      const soldCount = await AuctionResult.countDocuments({ auctionSeasonId: season._id, status: 'SOLD' });
      const unsoldCount = await AuctionResult.countDocuments({ auctionSeasonId: season._id, status: 'UNSOLD' });
      return {
        ...season.toObject(),
        playerCount,
        bidderCount,
        soldCount,
        unsoldCount,
      };
    }));

    res.json(seasonsWithCounts);
  } catch (error) {
    next(error);
  }
};

// Get active season
exports.getActiveSeason = async (req, res, next) => {
  try {
    const season = await AuctionSeason.findOne({ status: 'ACTIVE' });
    res.json(season);
  } catch (error) {
    next(error);
  }
};

// Create season
exports.createSeason = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Season name is required' });
    }

    // Check if this is the first season
    const existingCount = await AuctionSeason.countDocuments();
    const isFirst = existingCount === 0;

    const season = await AuctionSeason.create({
      name: name.trim(),
      status: isFirst ? 'ACTIVE' : 'INACTIVE',
    });

    // If this is the first season, migrate all existing unlinked data to it
    if (isFirst) {
      await migrateExistingData(season._id);
    }

    res.status(201).json(season);
  } catch (error) {
    next(error);
  }
};

// Update season name
exports.updateSeason = async (req, res, next) => {
  try {
    const { name } = req.body;
    const season = await AuctionSeason.findById(req.params.id);
    if (!season) return res.status(404).json({ message: 'Season not found' });

    if (name) season.name = name.trim();
    await season.save();
    res.json(season);
  } catch (error) {
    next(error);
  }
};

// Delete season (only if INACTIVE)
exports.deleteSeason = async (req, res, next) => {
  try {
    const season = await AuctionSeason.findById(req.params.id);
    if (!season) return res.status(404).json({ message: 'Season not found' });

    if (season.status === 'ACTIVE') {
      return res.status(400).json({ message: 'Cannot delete the active season. Activate another season first.' });
    }

    // Check if there is linked data
    const playerCount = await Player.countDocuments({ auctionSeasonId: season._id });
    const bidderCount = await Bidder.countDocuments({ auctionSeasonId: season._id });
    if (playerCount > 0 || bidderCount > 0) {
      return res.status(400).json({
        message: `Cannot delete season with existing data (${playerCount} players, ${bidderCount} bidders). Remove all data first.`,
      });
    }

    await season.deleteOne();
    res.json({ message: 'Season deleted' });
  } catch (error) {
    next(error);
  }
};

// Activate a season (deactivate all others)
exports.activateSeason = async (req, res, next) => {
  try {
    const season = await AuctionSeason.findById(req.params.id);
    if (!season) return res.status(404).json({ message: 'Season not found' });

    // Check no live auction in the current active season
    const currentActive = await AuctionSeason.findOne({ status: 'ACTIVE' });
    if (currentActive) {
      const liveAuction = await Auction.findOne({
        auctionSeasonId: currentActive._id,
        status: { $in: ['LIVE', 'PAUSED'] },
      });
      if (liveAuction) {
        return res.status(400).json({ message: 'Cannot switch season while an auction is live. Complete or reset the current auction first.' });
      }
    }

    // Deactivate all seasons
    await AuctionSeason.updateMany({}, { status: 'INACTIVE' });

    // Activate the selected one
    season.status = 'ACTIVE';
    await season.save();

    res.json(season);
  } catch (error) {
    next(error);
  }
};

/**
 * Migrate all existing records that have no auctionSeasonId to the given season.
 * This runs when the first season is created to preserve existing data.
 */
async function migrateExistingData(seasonId) {
  const filter = { $or: [{ auctionSeasonId: null }, { auctionSeasonId: { $exists: false } }] };
  const update = { $set: { auctionSeasonId: seasonId } };

  await Player.updateMany(filter, update);
  await Bidder.updateMany(filter, update);
  await Auction.updateMany(filter, update);
  await AuctionResult.updateMany(filter, update);
  await Bid.updateMany(filter, update);

  console.log(`📦 Migrated existing data to season: ${seasonId}`);
}
