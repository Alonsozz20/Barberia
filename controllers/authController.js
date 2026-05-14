const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc    Register new stylist (ADMIN ONLY)
// @route   POST /api/auth/register-stylist
// @access  Private/Admin
const registerStylist = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Por favor complete todos los campos requeridos' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'stylist',
      phone: phone || ''
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      });
    } else {
      res.status(400).json({ message: 'Datos no válidos' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// @desc    Authenticate user & get token (admin and stylists only)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    // Only admin and stylists can log in
    if (user.role !== 'admin' && user.role !== 'stylist') {
      return res.status(403).json({ message: 'Acceso no autorizado' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// @desc    Get all stylists
// @route   GET /api/auth/stylists
// @access  Public
const getStylists = async (req, res) => {
  try {
    const stylists = await User.find({ role: 'stylist' }).select('name email phone');
    res.json(stylists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// @desc    Delete a stylist (ADMIN ONLY)
// @route   DELETE /api/auth/stylists/:id
// @access  Private/Admin
const deleteStylist = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'stylist') {
      return res.status(404).json({ message: 'Estilista no encontrado' });
    }
    await user.deleteOne();
    res.json({ message: 'Estilista eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = {
  registerStylist,
  loginUser,
  getMe,
  getStylists,
  deleteStylist
};
