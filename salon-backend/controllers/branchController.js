const Branch = require('../models/Branch');

// Get branches (Admin sees all, Public sees active)
exports.getBranches = async (req, res) => {
  try {
    const filter = req.query.all === 'true' ? {} : { isActive: true };
    const branches = await Branch.find(filter).sort({ createdAt: 1 });
    res.status(200).json(branches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching branches', error: error.message });
  }
};

// Create a new branch (for Admin setup/Postman)
exports.createBranch = async (req, res) => {
  try {
    const newBranch = new Branch(req.body);
    const savedBranch = await newBranch.save();
    res.status(201).json(savedBranch);
  } catch (error) {
    res.status(400).json({ message: 'Error creating branch', error: error.message });
  }
};

// Update an existing branch (for Admin Dashboard)
exports.updateBranch = async (req, res) => {
  try {
    const updatedBranch = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedBranch) return res.status(404).json({ message: 'Branch not found' });
    res.status(200).json(updatedBranch);
  } catch (error) {
    res.status(400).json({ message: 'Error updating branch', error: error.message });
  }
};

// Delete a branch (for Admin Dashboard)
exports.deleteBranch = async (req, res) => {
  try {
    const deletedBranch = await Branch.findByIdAndDelete(req.params.id);
    if (!deletedBranch) return res.status(404).json({ message: 'Branch not found' });
    res.status(200).json({ message: 'Branch deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting branch', error: error.message });
  }
};