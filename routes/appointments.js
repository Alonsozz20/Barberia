const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getStylistAppointments,
  getAllAppointments,
  updateAppointmentStatus,
  getAvailability,
  getDailyEarnings,
  deleteAppointment
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

// Public routes (client booking - no auth required)
router.post('/', createAppointment);
router.get('/availability/:stylistId', getAvailability);

// Protected routes
router.get('/', protect, authorize('admin'), getAllAppointments);
router.get('/stylist/:stylistId', protect, getStylistAppointments);
router.get('/earnings/:stylistId', protect, getDailyEarnings);
router.put('/:id/status', protect, updateAppointmentStatus);
router.delete('/:id', protect, authorize('admin'), deleteAppointment);

module.exports = router;
