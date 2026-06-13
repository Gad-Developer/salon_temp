const Category = require('../models/Category');

// GET /api/categories - Fetch all categories and their services
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching categories', error });
  }
};

// POST /api/categories - Create a new category with services (For testing/admin)
exports.createCategory = async (req, res) => {
  try {
    const newCategory = new Category(req.body);
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(400).json({ message: 'Error creating category', error });
  }
};