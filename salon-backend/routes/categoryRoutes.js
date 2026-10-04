const express = require('express');
const router = express.Router();
const { 
  getCategories, 
  createCategory,
  updateCategory,
  deleteCategory,
  addService,
  updateService,
  deleteService
} = require('../controllers/categoryController');

// Category Routes
router.get('/', getCategories);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

// Nested Service Routes
router.post('/:catId/services', addService);
router.put('/:catId/services/:servId', updateService);
router.delete('/:catId/services/:servId', deleteService);

module.exports = router;