const asyncHandler = require('express-async-handler');
const Service = require('../models/Service');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
const getServices = asyncHandler(async (req, res) => {
  const { category } = req.query;
  
  let filter = {};
  if (category) {
    filter.category = category;
  }
  
  const services = await Service.find(filter).populate('stylists', 'name');
  res.json(services);
});

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
const getServiceById = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id).populate('stylists', 'name');
  
  if (service) {
    res.json(service);
  } else {
    res.status(404);
    throw new Error('Service not found');
  }
});

// @desc    Create service
// @route   POST /api/services
// @access  Private/Admin
const createService = asyncHandler(async (req, res) => {
  const { name, category, description, duration, price, stylists } = req.body;
  
  const service = await Service.create({
    name,
    category,
    description,
    duration,
    price,
    stylists: stylists || []
  });
  
  if (service) {
    res.status(201).json(service);
  } else {
    res.status(400);
    throw new Error('Invalid service data');
  }
});

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private/Admin
const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  
  if (service) {
    service.name = req.body.name || service.name;
    service.category = req.body.category || service.category;
    service.description = req.body.description || service.description;
    service.duration = req.body.duration || service.duration;
    service.price = req.body.price || service.price;
    service.stylists = req.body.stylists || service.stylists;
    
    const updatedService = await service.save();
    res.json(updatedService);
  } else {
    res.status(404);
    throw new Error('Service not found');
  }
});

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private/Admin
const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  
  if (service) {
    await service.deleteOne();
    res.json({ message: 'Service removed' });
  } else {
    res.status(404);
    throw new Error('Service not found');
  }
});

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService
};
