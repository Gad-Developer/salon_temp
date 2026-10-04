const Appointment = require('../models/Appointment');

// POST /api/appointments
exports.createAppointment = async (req, res) => {
  try {
    const { 
      services, 
      packageId,
      isPackage,
      professionalId, 
      branchId,
      date, 
      time, 
      clientName, 
      clientPhone, 
      totalPrice 
    } = req.body;

    const newAppointment = new Appointment({
      services: isPackage ? [] : services,
      packageId: isPackage ? packageId : null,
      isPackage: isPackage || false,
      professionalId: professionalId === 'any' ? null : professionalId,
      branchId,
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
    res.status(500).json({ message: 'Failed to create appointment', error: error.message });
  }
};

// GET /api/appointments
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('branchId', 'nameEn nameAr')
      .populate('professionalId', 'nameEn nameAr avatar') // Added avatar for UI
      .populate('packageId', 'nameEn nameAr')
      .sort({ createdAt: -1 });
      
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch appointments', error: error.message });
  }
};

// PATCH /api/appointments/:id/status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const adminName = req.admin?.name || req.body.adminName || 'Admin';

    const validStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    // Push the audit log entry
    appointment.status = status;
    appointment.auditLog.push({
      action: `Status changed to ${status}`,
      note: note || 'No note provided',
      adminName
    });

    await appointment.save();

    // Re-fetch with populated fields for the frontend
    const updatedAppt = await Appointment.findById(req.params.id)
      .populate('branchId', 'nameEn nameAr')
      .populate('professionalId', 'nameEn nameAr avatar')
      .populate('packageId', 'nameEn nameAr');

    res.status(200).json({ message: 'Status updated', appointment: updatedAppt });
  } catch (error) {
    res.status(500).json({ message: 'Error updating status', error: error.message });
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

// PATCH /api/appointments/:id/assign
exports.assignProfessional = async (req, res) => {
  try {
    const { professionalId, note } = req.body;
    const adminName = req.admin?.name || req.body.adminName || 'Admin';

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    appointment.professionalId = professionalId || null;
    
    appointment.auditLog.push({
      action: professionalId ? `Professional Assigned/Reassigned` : `Professional Unassigned`,
      note: note || 'No note provided',
      adminName
    });

    await appointment.save();

    const updatedAppt = await Appointment.findById(req.params.id)
      .populate('branchId', 'nameEn nameAr')
      .populate('professionalId', 'nameEn nameAr avatar')
      .populate('packageId', 'nameEn nameAr');

    res.status(200).json({ message: 'Professional assigned', appointment: updatedAppt });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning professional', error: error.message });
  }
};