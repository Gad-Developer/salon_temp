const express = require('express');
const router = express.Router();
const { 
  getProfessionals, 
  createProfessional,
  updateProfessional,
  deleteProfessional
} = require('../controllers/professionalController');

router.route('/')
  .get(getProfessionals)
  .post(createProfessional);

router.route('/:id')
  .put(updateProfessional)
  .delete(deleteProfessional);

module.exports = router;