import express from 'express';
import { body, validationResult } from 'express-validator';
import Property from '../models/Property.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/properties
// @desc    Get all properties for owner
// @access  Private
router.get('/', protect, authorize('owner'), async (req, res) => {
  try {
    const properties = await Property.find({ ownerId: req.user._id }).populate('currentTenant');

    res.json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/properties/:id
// @desc    Get single property
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('currentTenant');

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Check authorization
    if (property.ownerId.toString() !== req.user._id.toString() && req.user.accountType !== 'owner') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({
      success: true,
      property,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/properties
// @desc    Create new property
// @access  Private
router.post(
  '/',
  protect,
  authorize('owner'),
  [
    body('name', 'Property name is required').trim().notEmpty(),
    body('location', 'Location is required').trim().notEmpty(),
    body('monthlyRent', 'Monthly rent is required').isNumeric(),
    body('propertyType', 'Property type is required').isIn(['apartment', 'house', 'condo', 'townhouse', 'commercial']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { name, location, address, propertyType, bedrooms, bathrooms, squareFeet, monthlyRent, securityDeposit, utilities, amenities, description, notes } = req.body;

      const property = new Property({
        ownerId: req.user._id,
        name,
        location,
        address,
        propertyType,
        bedrooms: bedrooms || 0,
        bathrooms: bathrooms || 0,
        squareFeet: squareFeet || 0,
        monthlyRent,
        securityDeposit: securityDeposit || 0,
        utilities: utilities || {},
        amenities: amenities || [],
        description,
        notes,
      });

      await property.save();

      res.status(201).json({
        success: true,
        property,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// @route   PUT /api/properties/:id
// @desc    Update property
// @access  Private
router.put('/:id', protect, authorize('owner'), async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Check authorization
    if (property.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Update fields
    const { name, location, address, propertyType, bedrooms, bathrooms, squareFeet, monthlyRent, securityDeposit, occupancyStatus, utilities, amenities, description, notes } = req.body;

    if (name) property.name = name;
    if (location) property.location = location;
    if (address) property.address = address;
    if (propertyType) property.propertyType = propertyType;
    if (bedrooms !== undefined) property.bedrooms = bedrooms;
    if (bathrooms !== undefined) property.bathrooms = bathrooms;
    if (squareFeet !== undefined) property.squareFeet = squareFeet;
    if (monthlyRent) property.monthlyRent = monthlyRent;
    if (securityDeposit !== undefined) property.securityDeposit = securityDeposit;
    if (occupancyStatus) property.occupancyStatus = occupancyStatus;
    if (utilities) property.utilities = utilities;
    if (amenities) property.amenities = amenities;
    if (description) property.description = description;
    if (notes) property.notes = notes;

    property = await property.save();

    res.json({
      success: true,
      property,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/properties/:id
// @desc    Delete property
// @access  Private
router.delete('/:id', protect, authorize('owner'), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Check authorization
    if (property.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Property.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Property deleted',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/properties/:id/maintenance-history
// @desc    Get property maintenance history
// @access  Private
router.get('/:id/maintenance-history', protect, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    res.json({
      success: true,
      maintenanceHistory: property.maintenanceHistory,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
