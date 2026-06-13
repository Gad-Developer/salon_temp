const express = require('express');
const router = express.Router();
const { getProfessionals, createProfessional } = require('../controllers/professionalController');

router.get('/', getProfessionals);
router.post('/', createProfessional);

module.exports = router;