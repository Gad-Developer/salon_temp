const express = require('express');
const router = express.Router();
// Import your existing methods plus the new one
const { createAppointment, getAppointments, updateAppointmentStatus, updateAppointmentDetails, deleteAppointment } = require('../controllers/appointmentController');

router.route('/')
  .get(getAppointments)
  .post(createAppointment);

// NEW: Route to update specific appointment status
router.route('/:id/status')
  .patch(updateAppointmentStatus);

router.route('/:id')
  .patch(updateAppointmentDetails)
  .delete(deleteAppointment);

module.exports = router;