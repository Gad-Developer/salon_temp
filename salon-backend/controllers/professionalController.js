const Professional = require('../models/Professional');

// GET /api/professionals
exports.getProfessionals = async (req, res) => {
  try {
    const professionals = await Professional.find({ isActive: true });
    res.status(200).json(professionals);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching professionals', error });
  }
};

// POST /api/professionals (For testing/admin)
exports.createProfessional = async (req, res) => {
  try {
    const newProfessional = new Professional(req.body);
    const savedProfessional = await newProfessional.save();
    res.status(201).json(savedProfessional);
  } catch (error) {
    res.status(400).json({ message: 'Error creating professional', error });
  }
};