const Category = require('../models/Category');
const Service = require('../models/Service'); // Added Service Model

// ==========================================
// CATEGORY CRUD
// ==========================================

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().lean();
    const services = await Service.find().lean();

    // Reconstruct the nested structure the frontend expects
    const populatedCategories = categories.map(cat => ({
      ...cat,
      services: services.filter(s => s.categoryId.toString() === cat._id.toString())
    }));

    res.json(populatedCategories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const newCat = new Category(req.body);
    await newCat.save();
    res.status(201).json({ ...newCat.toObject(), services: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const updatedCat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedCat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    // Delete the category AND all associated services
    await Category.findByIdAndDelete(req.params.id);
    await Service.deleteMany({ categoryId: req.params.id });
    res.json({ message: "Category and associated services deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==========================================
// INDEPENDENT SERVICES CRUD
// ==========================================

exports.addService = async (req, res) => {
  try {
    const newService = new Service({
      ...req.body,
      categoryId: req.params.catId
    });
    await newService.save();
    res.status(201).json(newService);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const updatedService = await Service.findByIdAndUpdate(
      req.params.servId, 
      req.body, 
      { new: true }
    );
    if (!updatedService) return res.status(404).json({ error: "Service not found" });
    res.json(updatedService);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const deletedService = await Service.findByIdAndDelete(req.params.servId);
    if (!deletedService) return res.status(404).json({ error: "Service not found" });
    res.json({ message: "Service deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};