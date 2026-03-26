import express from 'express';
import { body, validationResult } from 'express-validator';
import Tenant from '../models/Tenant.js';
import Property from '../models/Property.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/tenants
// @desc    Get all tenants for owner
// @access  Private
router.get('/', protect, authorize('owner'), async (req, res) => {
  try {
    const tenants = await Tenant.find({ ownerId: req.user._id })
      .populate('assignedProperty')
      .populate('maintenanceRequests');

    res.json({
      success: true,
      count: tenants.length,
      tenants,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/tenants/:id
// @desc    Get single tenant
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id)
      .populate('assignedProperty')
      .populate('maintenanceRequests');

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    // Check authorization
    if (tenant.ownerId.toString() !== req.user._id.toString() && tenant.userId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({
      success: true,
      tenant,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/tenants
// @desc    Create new tenant
// @access  Private
router.post(
  '/',
  protect,
  authorize('owner'),
  [
    body('fullName', 'Full name is required').trim().notEmpty(),
    body('email', 'Valid email is required').isEmail(),
    body('assignedProperty', 'Property ID is required').notEmpty(),
    body('monthlyRent', 'Monthly rent is required').isNumeric(),
    body('leaseStartDate', 'Lease start date is required').isISO8601(),
    body('leaseEndDate', 'Lease end date is required').isISO8601(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { fullName, email, phone, assignedProperty, monthlyRent, leaseStartDate, leaseEndDate, securityDeposit, emergencyContact, occupants, notes } = req.body;

      // Verify property exists and belongs to owner
      const property = await Property.findById(assignedProperty);
      if (!property || property.ownerId.toString() !== req.user._id.toString()) {
        return res.status(400).json({ success: false, message: 'Invalid property' });
      }

      const tenant = new Tenant({
        ownerId: req.user._id,
        fullName,
        email,
        phone,
        assignedProperty,
        monthlyRent,
        leaseStartDate,
        leaseEndDate,
        securityDeposit: securityDeposit || 0,
        emergencyContact: emergencyContact || {},
        occupants: occupants || {},
        notes,
        rentStatus: 'pending',
      });

      await tenant.save();

      // Update property with current tenant
      property.currentTenant = tenant._id;
      property.occupancyStatus = 'occupied';
      property.leaseStartDate = leaseStartDate;
      property.leaseEndDate = leaseEndDate;
      await property.save();

      res.status(201).json({
        success: true,
        tenant,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// @route   PUT /api/tenants/:id
// @desc    Update tenant
// @access  Private
router.put('/:id', protect, authorize('owner'), async (req, res) => {
  try {
    let tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    // Check authorization
    if (tenant.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Update fields
    const { fullName, email, phone, rentStatus, monthlyRent, leaseStartDate, leaseEndDate, securityDeposit, emergencyContact, occupants, notes } = req.body;

    if (fullName) tenant.fullName = fullName;
    if (email) tenant.email = email;
    if (phone) tenant.phone = phone;
    if (rentStatus) tenant.rentStatus = rentStatus;
    if (monthlyRent) tenant.monthlyRent = monthlyRent;
    if (leaseStartDate) tenant.leaseStartDate = leaseStartDate;
    if (leaseEndDate) tenant.leaseEndDate = leaseEndDate;
    if (securityDeposit !== undefined) tenant.securityDeposit = securityDeposit;
    if (emergencyContact) tenant.emergencyContact = emergencyContact;
    if (occupants) tenant.occupants = occupants;
    if (notes) tenant.notes = notes;

    tenant = await tenant.save();

    res.json({
      success: true,
      tenant,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/tenants/:id
// @desc    Delete tenant
// @access  Private
router.delete('/:id', protect, authorize('owner'), async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    // Check authorization
    if (tenant.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Update property
    if (tenant.assignedProperty) {
      await Property.findByIdAndUpdate(tenant.assignedProperty, {
        currentTenant: null,
        occupancyStatus: 'vacant',
      });
    }

    await Tenant.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Tenant deleted',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/tenants/:id/payment-history
// @desc    Get tenant payment history
// @access  Private
router.get('/:id/payment-history', protect, async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    // Check authorization
    if (tenant.ownerId.toString() !== req.user._id.toString() && tenant.userId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({
      success: true,
      paymentHistory: tenant.paymentHistory,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/tenants/:id/rent-status
// @desc    Update tenant rent status
// @access  Private
router.put('/:id/rent-status', protect, authorize('owner'), async (req, res) => {
  try {
    const { rentStatus } = req.body;

    if (!['paid', 'pending', 'overdue'].includes(rentStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid rent status' });
    }

    const tenant = await Tenant.findByIdAndUpdate(req.params.id, { rentStatus }, { new: true });

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    res.json({
      success: true,
      tenant,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
