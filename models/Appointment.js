const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  // Guest client info (no login required)
  clientName: {
    type: String,
    required: true,
    trim: true
  },
  clientPhone: {
    type: String,
    required: true,
    trim: true
  },
  clientEmail: {
    type: String,
    trim: true
  },
  stylist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String, // in HH:mm format
    required: true
  },
  endTime: {
    type: String, // in HH:mm format
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster querying of appointments by date and status
appointmentSchema.index({ date: 1, status: 1 });
appointmentSchema.index({ stylist: 1, date: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
