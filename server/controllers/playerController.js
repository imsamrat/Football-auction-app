const Player = require('../models/Player');

// Get all players
exports.getPlayers = async (req, res, next) => {
  try {
    const { status, position, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (position) filter.position = position;
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const players = await Player.find(filter).sort({ auctionOrder: 1 });
    res.json(players);
  } catch (error) {
    next(error);
  }
};

// Get single player
exports.getPlayer = async (req, res, next) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ message: 'Player not found' });
    res.json(player);
  } catch (error) {
    next(error);
  }
};

// Create player
exports.createPlayer = async (req, res, next) => {
  try {
    const { playerNumber, name, position, division, basePrice, matches, goals, assists, rating, auctionOrder } = req.body;

    // Auto-assign auctionOrder if not provided
    let order = auctionOrder;
    if (!order) {
      const lastPlayer = await Player.findOne().sort({ auctionOrder: -1 });
      order = lastPlayer ? lastPlayer.auctionOrder + 1 : 1;
    }

    const player = await Player.create({
      playerNumber,
      name,
      position,
      division,
      basePrice,
      matches: matches || 0,
      goals: goals || 0,
      assists: assists || 0,
      rating: rating || 0,
      auctionOrder: order,
    });

    res.status(201).json(player);
  } catch (error) {
    next(error);
  }
};

// Update player
exports.updatePlayer = async (req, res, next) => {
  try {
    const player = await Player.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!player) return res.status(404).json({ message: 'Player not found' });
    res.json(player);
  } catch (error) {
    next(error);
  }
};

// Delete player
exports.deletePlayer = async (req, res, next) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ message: 'Player not found' });
    if (player.status === 'SOLD' || player.status === 'LIVE') {
      return res.status(400).json({ message: 'Cannot delete a player that is sold or in live auction' });
    }
    await player.deleteOne();
    res.json({ message: 'Player deleted' });
  } catch (error) {
    next(error);
  }
};

// Reorder players
exports.reorderPlayers = async (req, res, next) => {
  try {
    const { orders } = req.body; // [{ id, auctionOrder }]
    if (!Array.isArray(orders)) {
      return res.status(400).json({ message: 'Orders must be an array' });
    }

    const bulkOps = orders.map(({ id, auctionOrder }) => ({
      updateOne: {
        filter: { _id: id },
        update: { auctionOrder },
      },
    }));

    await Player.bulkWrite(bulkOps);
    const players = await Player.find().sort({ auctionOrder: 1 });
    res.json(players);
  } catch (error) {
    next(error);
  }
};

// Get player queue (upcoming + current)
exports.getPlayerQueue = async (req, res, next) => {
  try {
    const players = await Player.find({ status: { $in: ['UPCOMING', 'LIVE'] } })
      .sort({ auctionOrder: 1 })
      .select('playerNumber name position division basePrice status auctionOrder photo');
    res.json(players);
  } catch (error) {
    next(error);
  }
};
