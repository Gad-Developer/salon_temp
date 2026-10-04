const Review = require('../models/Review');
const ReviewCode = require('../models/ReviewCode');
const crypto = require('crypto');

// Get all unused codes
exports.getActiveCodes = async (req, res) => {
  try {
    const activeCodes = await ReviewCode.find({ isUsed: false }).sort({ createdAt: -1 });
    res.status(200).json({ codes: activeCodes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Generate a new 24h code
exports.generateCode = async (req, res) => {
  try {
    const code = crypto.randomBytes(3).toString('hex').toUpperCase(); // e.g., "A1B2C3"
    const newCode = new ReviewCode({ code });
    await newCode.save();
    res.status(201).json({ code: newCode.code });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all reviews for the Inbox
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a review (Admin moderation)
exports.deleteReview = async (req, res) => {
  try {
    const deletedReview = await Review.findByIdAndDelete(req.params.id);
    if (!deletedReview) return res.status(404).json({ error: 'Review not found' });
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};