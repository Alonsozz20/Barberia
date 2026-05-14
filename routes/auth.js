const express = require('express');
const router = express.Router();
const {
  registerStylist,
  loginUser,
  getMe,
  getStylists,
  deleteStylist
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/login', loginUser);
router.get('/stylists', getStylists);

// Protected routes
router.get('/me', protect, getMe);
router.post('/register-stylist', protect, authorize('admin'), registerStylist);
router.delete('/stylists/:id', protect, authorize('admin'), deleteStylist);

module.exports = router;
