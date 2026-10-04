const Professional = require('../models/Professional');

// GET /api/professionals
exports.getProfessionals = async (req, res) => {
  try {
    const filter = req.query.all === 'true' ? {} : { isActive: true };
    const professionals = await Professional.find(filter).sort({ createdAt: -1 });
    res.status(200).json(professionals);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching professionals', error: error.message });
  }
};

// POST /api/professionals
exports.createProfessional = async (req, res) => {
  try {
    const newProfessional = new Professional(req.body);
    const savedProfessional = await newProfessional.save();
    res.status(201).json(savedProfessional);
  } catch (error) {
    res.status(400).json({ message: 'Error creating professional', error: error.message });
  }
};

// PUT /api/professionals/:id
exports.updateProfessional = async (req, res) => {
  try {
    const updatedProfessional = await Professional.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProfessional) return res.status(404).json({ message: 'Professional not found' });
    res.status(200).json(updatedProfessional);
  } catch (error) {
    res.status(400).json({ message: 'Error updating professional', error: error.message });
  }
};

// DELETE /api/professionals/:id
exports.deleteProfessional = async (req, res) => {
  try {
    const deletedProfessional = await Professional.findByIdAndDelete(req.params.id);
    if (!deletedProfessional) return res.status(404).json({ message: 'Professional not found' });
    res.status(200).json({ message: 'Professional deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting professional', error: error.message });
  }
};