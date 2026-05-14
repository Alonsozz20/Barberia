
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['barberia', 'manicura', 'pintado', 'lizado', 'tratamiento', 'otro'],
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  stylists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Service', serviceSchema);

