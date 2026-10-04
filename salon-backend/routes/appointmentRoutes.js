const express = require('express');
const router = express.Router();
// Import your existing methods plus the new one
const { 
  createAppointment, 
  getAppointments, 
  updateAppointmentStatus, 
  updateAppointmentDetails, 
  deleteAppointment,
  assignProfessional // NEW
} = require('../controllers/appointmentController');

const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getAppointments)
  .post(createAppointment);

// Route to update specific appointment status
router.route('/:id/status')
  .patch(protect, updateAppointmentStatus);

router.route('/:id/assign')
  .patch(protect, assignProfessional);

router.route('/:id')
  .patch(protect, updateAppointmentDetails)
  .delete(protect, deleteAppointment);

module.exports = router;