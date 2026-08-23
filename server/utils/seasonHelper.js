const AuctionSeason = require('../models/AuctionSeason');

/**
 * Get the _id of the currently ACTIVE auction season.
 * Returns null if no season exists (backward-compatible: queries without season filter).
 */
async function getActiveSeasonId() {
  const season = await AuctionSeason.findOne({ status: 'ACTIVE' }).select('_id');
  return season ? season._id : null;
}

/**
 * Get the full active season document.
 */
async function getActiveSeason() {
  return await AuctionSeason.findOne({ status: 'ACTIVE' });
}

/**
 * Build a season filter for MongoDB queries.
 * If an active season exists, returns { auctionSeasonId: seasonId }.
 * If no season exists, returns {} (no filter — backward compatible).
 */
async function getSeasonFilter() {
  const seasonId = await getActiveSeasonId();
  if (seasonId) return { auctionSeasonId: seasonId };
  return {};
}

module.exports = { getActiveSeasonId, getActiveSeason, getSeasonFilter };
