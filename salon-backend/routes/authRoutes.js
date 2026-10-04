const express = require('express');
const authController = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', authController.login);
router.get('/me', protect, authController.getMe);

// Only Super Admins can create new admins
router.post('/create', protect, restrictTo('Super Admin'), authController.createAdmin);

// Admin Management Routes (Super Admin Only)
router.get('/admins', protect, restrictTo('Super Admin'), authController.getAllAdmins);
router.patch('/admins/:id', protect, restrictTo('Super Admin'), authController.updateAdmin);
router.delete('/admins/:id', protect, restrictTo('Super Admin'), authController.deleteAdmin);

module.exports = router;
