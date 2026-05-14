const asyncHandler = require('express-async-handler');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Service = require('../models/Service');

// @desc    Create new appointment (PUBLIC - no auth required)
// @route   POST /api/appointments
// @access  Public
const createAppointment = asyncHandler(async (req, res) => {
  const { clientName, clientPhone, clientEmail, stylistId, serviceId, date, startTime, notes } = req.body;

  // Validate input
  if (!clientName || !clientPhone || !stylistId || !serviceId || !date || !startTime) {
    res.status(400);
    throw new Error('Por favor complete todos los campos requeridos');
  }

  // Check if stylist exists and is a stylist
  const stylist = await User.findById(stylistId);
  if (!stylist || stylist.role !== 'stylist') {
    res.status(400);
    throw new Error('Estilista no válido');
  }

  // Check if service exists
  const service = await Service.findById(serviceId);
  if (!service) {
    res.status(400);
    throw new Error('Servicio no válido');
  }

  // Calculate end time based on service duration
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + service.duration;
  const endHours = Math.floor(totalMinutes / 60);
  const endMins = totalMinutes % 60;
  const endTimeString = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;

  // Check for overlapping appointments for the stylist at the same time
  const appointmentDate = new Date(date);
  appointmentDate.setHours(0, 0, 0, 0);

  const overlapping = await Appointment.findOne({
    stylist: stylistId,
    date: appointmentDate,
    status: { $nin: ['cancelled', 'no-show'] },
    $or: [
      { startTime: { $lt: endTimeString }, endTime: { $gt: startTime } }
    ]
  });

  if (overlapping) {
    res.status(400);
    throw new Error('El horario seleccionado no está disponible');
  }

  // Create appointment
  const appointment = await Appointment.create({
    clientName,
    clientPhone,
    clientEmail: clientEmail || '',
    stylist: stylistId,
    service: serviceId,
    date: appointmentDate,
    startTime,
    endTime: endTimeString,
    notes: notes || '',
    price: service.price
  });

  if (appointment) {
    const populated = await Appointment.findById(appointment._id)
      .populate('stylist', 'name')
      .populate('service', 'name category duration price');
    res.status(201).json(populated);
  } else {
    res.status(400);
    throw new Error('Datos de cita no válidos');
  }
});

// @desc    Get stylist's appointments
// @route   GET /api/appointments/stylist/:stylistId
// @access  Private (stylist or admin)
const getStylistAppointments = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin' && req.user.id !== req.params.stylistId) {
    res.status(403);
    throw new Error('No autorizado para ver estas citas');
  }

  const { date, status } = req.query;
  let filter = { stylist: req.params.stylistId };

  if (date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    filter.date = d;
  }

  if (status) {
    filter.status = status;
  }

  const appointments = await Appointment.find(filter)
    .populate('service', 'name category duration price')
    .sort({ date: 1, startTime: 1 });
  res.json(appointments);
});

// @desc    Get all appointments (admin only)
// @route   GET /api/appointments
// @access  Private/Admin
const getAllAppointments = asyncHandler(async (req, res) => {
  const { date, status, stylist } = req.query;
  let filter = {};

  if (date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    filter.date = d;
  }
  if (status) filter.status = status;
  if (stylist) filter.stylist = stylist;

  const appointments = await Appointment.find(filter)
    .populate('stylist', 'name')
    .populate('service', 'name category duration price')
    .sort({ date: -1, startTime: 1 });
  res.json(appointments);
});

// @desc    Update appointment status (stylist)
// @route   PUT /api/appointments/:id/status
// @access  Private (stylist or admin)
const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error('Cita no encontrada');
  }

  // Only the assigned stylist or admin can update
  if (req.user.role !== 'admin' && appointment.stylist.toString() !== req.user.id) {
    res.status(403);
    throw new Error('No autorizado para actualizar esta cita');
  }

  const { status } = req.body;
  if (!['pending', 'confirmed', 'completed', 'cancelled', 'no-show'].includes(status)) {
    res.status(400);
    throw new Error('Estado no válido');
  }

  appointment.status = status;
  const updated = await appointment.save();
  
  const populated = await Appointment.findById(updated._id)
    .populate('stylist', 'name')
    .populate('service', 'name category duration price');

  res.json(populated);
});

// @desc    Get available time slots for a stylist on a specific date
// @route   GET /api/appointments/availability/:stylistId
// @access  Public
const getAvailability = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const { stylistId } = req.params;

  if (!date) {
    res.status(400);
    throw new Error('Se requiere una fecha');
  }

  const stylist = await User.findById(stylistId);
  if (!stylist || stylist.role !== 'stylist') {
    res.status(400);
    throw new Error('Estilista no válido');
  }

  const appointmentDate = new Date(date);
  appointmentDate.setHours(0, 0, 0, 0);

  // Get all appointments for this stylist on this date
  const appointments = await Appointment.find({
    stylist: stylistId,
    date: appointmentDate,
    status: { $nin: ['cancelled', 'no-show'] }
  }).populate('service', 'duration');

  // Generate all possible time slots (9:00 AM - 8:00 PM, every 30 minutes)
  const allSlots = [];
  for (let h = 9; h < 20; h++) {
    allSlots.push(`${String(h).padStart(2, '0')}:00`);
    allSlots.push(`${String(h).padStart(2, '0')}:30`);
  }

  // Filter out occupied slots
  const occupiedRanges = appointments.map(apt => ({
    start: apt.startTime,
    end: apt.endTime
  }));

  const availableSlots = allSlots.filter(slot => {
    return !occupiedRanges.some(range => {
      return slot >= range.start && slot < range.end;
    });
  });

  res.json({ date, stylistId, availableSlots });
});

// @desc    Get daily earnings for a stylist
// @route   GET /api/appointments/earnings/:stylistId
// @access  Private (stylist or admin)
const getDailyEarnings = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin' && req.user.id !== req.params.stylistId) {
    res.status(403);
    throw new Error('No autorizado');
  }

  const { date } = req.query;
  const targetDate = date ? new Date(date) : new Date();
  targetDate.setHours(0, 0, 0, 0);

  const completedAppointments = await Appointment.find({
    stylist: req.params.stylistId,
    date: targetDate,
    status: 'completed'
  }).populate('service', 'name price');

  const totalEarnings = completedAppointments.reduce((sum, apt) => sum + apt.price, 0);
  const totalClients = completedAppointments.length;

  res.json({
    date: targetDate,
    totalEarnings,
    totalClients,
    appointments: completedAppointments
  });
});

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private/Admin
const deleteAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error('Cita no encontrada');
  }

  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Solo el administrador puede eliminar citas');
  }

  await appointment.deleteOne();
  res.json({ message: 'Cita eliminada' });
});

module.exports = {
  createAppointment,
  getStylistAppointments,
  getAllAppointments,
  updateAppointmentStatus,
  getAvailability,
  getDailyEarnings,
  deleteAppointment
};
