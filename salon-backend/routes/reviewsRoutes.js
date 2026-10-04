const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Review = require('../models/Review');
const ReviewCode = require('../models/ReviewCode');

// 1. Get all reviews for the Home page
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Admin: Generate a new 6-character code
router.post('/generate-code', async (req, res) => {
  try {
    const code = crypto.randomBytes(3).toString('hex').toUpperCase();
    const newCode = new ReviewCode({ code });
    await newCode.save();
    res.json({ code, message: "Code generated. Expires in 24 hours." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. NEW: Validate Code (for Step 1 of the frontend)
router.post('/validate-code', async (req, res) => {
  const { code } = req.body;
  try {
    const validCode = await ReviewCode.findOne({ code, isUsed: false });
    if (!validCode) {
      return res.status(400).json({ error: "Invalid or expired review code." });
    }
    res.json({ message: "Code is valid." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Customer: Submit Review (Saves review, DESTROYS code)
router.post('/submit', async (req, res) => {
  const { code, clientName, rating, text, memberType } = req.body;

  try {
    // Check if code exists and isn't used
    const validCode = await ReviewCode.findOne({ code, isUsed: false });
    if (!validCode) {
      return res.status(400).json({ error: "Invalid or expired review code." });
    }

    // Save the review
    const newReview = new Review({ clientName, rating, text, memberType });
    await newReview.save();

    // BURN THE CODE: Delete it completely from the database
    await ReviewCode.deleteOne({ _id: validCode._id });

    res.json({ message: "Review submitted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Admin: Get all currently active (unused) codes
router.get('/active-codes', async (req, res) => {
  try {
    // Find all unused codes, sorted newest first
    const activeCodes = await ReviewCode.find({ isUsed: false }).sort({ createdAt: -1 });
    res.json({ codes: activeCodes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;