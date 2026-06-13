const Appointment = require('../models/Appointment');

// POST /api/appointments
exports.createAppointment = async (req, res) => {
  try {
    const { 
      serviceId, 
      professionalId, 
      date, 
      time, 
      clientName, 
      clientPhone, 
      totalPrice 
    } = req.body;

    // Create and save the new booking
    const newAppointment = new Appointment({
      serviceId,
      professionalId,
      date,
      time,
      clientName,
      clientPhone,
      totalPrice
    });

    const savedAppointment = await newAppointment.save();
    
    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment: savedAppointment
    });
  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ message: 'Failed to create appointment', error });
  }
};

// GET /api/appointments (For the Admin Dashboard later)
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch appointments', error });
  }
};


// PATCH /api/appointments/:id/status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(200).json({ message: 'Status updated', appointment: updatedAppointment });
  } catch (error) {
    res.status(500).json({ message: 'Error updating appointment status', error: error.message });
  }
};

// PATCH /api/appointments/:id (For updating date/time)
exports.updateAppointmentDetails = async (req, res) => {
  try {
    const { date, time } = req.body;
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id, 
      { date, time }, 
      { new: true }
    );
    if (!updatedAppointment) return res.status(404).json({ message: 'Appointment not found' });
    res.status(200).json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating appointment', error: error.message });
  }
};

// DELETE /api/appointments/:id
exports.deleteAppointment = async (req, res) => {
  try {
    const deletedAppt = await Appointment.findByIdAndDelete(req.params.id);
    if (!deletedAppt) return res.status(404).json({ message: 'Appointment not found' });
    res.status(200).json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting appointment', error: error.message });
  }
};