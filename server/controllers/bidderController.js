const Bidder = require('../models/Bidder');

// Get all bidders
exports.getBidders = async (req, res, next) => {
  try {
    const bidders = await Bidder.find().sort({ bidderNumber: 1 });
    res.json(bidders);
  } catch (error) {
    next(error);
  }
};

// Get single bidder
exports.getBidder = async (req, res, next) => {
  try {
    const bidder = await Bidder.findById(req.params.id);
    if (!bidder) return res.status(404).json({ message: 'Bidder not found' });
    res.json(bidder);
  } catch (error) {
    next(error);
  }
};

// Create bidder
exports.createBidder = async (req, res, next) => {
  try {
    const { name, bidderNumber, team, password, budget } = req.body;

    const bidder = await Bidder.create({
      name,
      bidderNumber,
      team,
      password: password || '1234',
      budget,
      remainingBudget: budget,
    });

    res.status(201).json(bidder);
  } catch (error) {
    next(error);
  }
};

// Update bidder
exports.updateBidder = async (req, res, next) => {
  try {
    const updateData = { ...req.body };

    // If budget is updated, recalculate remaining
    if (updateData.budget !== undefined) {
      const bidder = await Bidder.findById(req.params.id);
      if (!bidder) return res.status(404).json({ message: 'Bidder not found' });
      updateData.remainingBudget = updateData.budget - bidder.totalSpent;
    }

    // Don't hash if password field isn't being changed
    if (updateData.password) {
      // We need to use save() to trigger the pre-save hook for hashing
      const bidder = await Bidder.findById(req.params.id);
      if (!bidder) return res.status(404).json({ message: 'Bidder not found' });
      Object.assign(bidder, updateData);
      await bidder.save();
      return res.json(bidder);
    }

    const bidder = await Bidder.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!bidder) return res.status(404).json({ message: 'Bidder not found' });
    res.json(bidder);
  } catch (error) {
    next(error);
  }
};

// Delete bidder
exports.deleteBidder = async (req, res, next) => {
  try {
    const bidder = await Bidder.findById(req.params.id);
    if (!bidder) return res.status(404).json({ message: 'Bidder not found' });
    if (bidder.playersPurchased.length > 0) {
      return res.status(400).json({ message: 'Cannot delete bidder with purchased players' });
    }
    await bidder.deleteOne();
    res.json({ message: 'Bidder deleted' });
  } catch (error) {
    next(error);
  }
};

// Get bidder dashboard data (for logged-in bidder)
exports.getBidderDashboard = async (req, res, next) => {
  try {
    const bidder = await Bidder.findById(req.user.id).populate('playersPurchased.playerId');
    if (!bidder) return res.status(404).json({ message: 'Bidder not found' });
    res.json(bidder);
  } catch (error) {
    next(error);
  }
};
