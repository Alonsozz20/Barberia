const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.SERVER_PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/appointments', require('./routes/appointments'));

app.get('/', (req, res) => {
  res.json({ message: 'Salon Appointment API' });
});

// Connect to MongoDB first, then start server
const startServer = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/salonapp';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

startServer();
