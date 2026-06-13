const express = require('express');
const router = express.Router();
const { getPackages, createPackage } = require('../controllers/packageController');

router.get('/', getPackages);
router.post('/', createPackage);

module.exports = router;