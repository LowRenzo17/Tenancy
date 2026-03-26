import express from 'express';
import { body, validationResult } from 'express-validator';
import Maintenance from '../models/Maintenance.js';
import Tenant from '../models/Tenant.js';
import { protect, authorize } from '../middleware/auth.js';
import { sendMaintenanceNotificationEmail } from '../utils/emailUtils.js';

const router = express.Router();

// @route   GET /api/maintenance
// @desc    Get all maintenance requests
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};

    if (req.user.accountType === 'owner') {
      query.ownerId = req.user._id;
    } else if (req.user.accountType === 'tenant') {
      query.tenantId = req.user._id;
    }

    const maintenance = await Maintenance.find(query)
      .populate('propertyId')
      .populate('tenantId')
      .sort('-createdAt');

    res.json({
      success: true,
      count: maintenance.length,
      maintenance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/maintenance/:id
// @desc    Get single maintenance request
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id)
      .populate('propertyId')
      .populate('tenantId');

    if (!maintenance) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found' });
    }

    // Check authorization
    if (maintenance.ownerId.toString() !== req.user._id.toString() && maintenance.tenantId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({
      success: true,
      maintenance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/maintenance
// @desc    Create new maintenance request
// @access  Private
router.post(
  '/',
  protect,
  [
    body('title', 'Title is required').trim().notEmpty(),
    body('description', 'Description is required').trim().notEmpty(),
    body('category', 'Category is required').isIn(['plumbing', 'electrical', 'hvac', 'structural', 'appliance', 'other']),
    body('propertyId', 'Property ID is required').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { title, description, category, priority, propertyId, tenantId, estimatedCost, notes } = req.body;

      let ownerId = req.user._id;

      // If tenant is creating request, find owner from property
      if (req.user.accountType === 'tenant') {
        const tenant = await Tenant.findOne({ userId: req.user._id });
        if (tenant) {
          ownerId = tenant.ownerId;
        }
      }

      const maintenance = new Maintenance({
        propertyId,
        tenantId: tenantId || null,
        ownerId,
        title,
        description,
        category,
        priority: priority || 'medium',
        estimatedCost: estimatedCost || 0,
        notes,
      });

      await maintenance.save();

      // Add to tenant's maintenance requests if applicable
      if (tenantId) {
        await Tenant.findByIdAndUpdate(tenantId, {
          $push: { maintenanceRequests: maintenance._id },
        });

        // Send notification email
        const tenant = await Tenant.findById(tenantId);
        if (tenant) {
          await sendMaintenanceNotificationEmail(tenant.email, title, 'pending');
        }
      }

      res.status(201).json({
        success: true,
        maintenance,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// @route   PUT /api/maintenance/:id
// @desc    Update maintenance request
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let maintenance = await Maintenance.findById(req.params.id);

    if (!maintenance) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found' });
    }

    // Check authorization
    if (maintenance.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Update fields
    const { title, description, category, priority, status, startDate, completionDate, estimatedCost, actualCost, contractor, notes } = req.body;

    if (title) maintenance.title = title;
    if (description) maintenance.description = description;
    if (category) maintenance.category = category;
    if (priority) maintenance.priority = priority;
    if (status) maintenance.status = status;
    if (startDate) maintenance.startDate = startDate;
    if (completionDate) maintenance.completionDate = completionDate;
    if (estimatedCost !== undefined) maintenance.estimatedCost = estimatedCost;
    if (actualCost !== undefined) maintenance.actualCost = actualCost;
    if (contractor) maintenance.contractor = contractor;
    if (notes) maintenance.notes = notes;

    maintenance = await maintenance.save();

    // Send notification email if status changed
    if (status && maintenance.tenantId) {
      const tenant = await Tenant.findById(maintenance.tenantId);
      if (tenant) {
        await sendMaintenanceNotificationEmail(tenant.email, maintenance.title, status);
      }
    }

    res.json({
      success: true,
      maintenance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/maintenance/:id
// @desc    Delete maintenance request
// @access  Private
router.delete('/:id', protect, authorize('owner'), async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);

    if (!maintenance) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found' });
    }

    // Check authorization
    if (maintenance.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Remove from tenant's maintenance requests
    if (maintenance.tenantId) {
      await Tenant.findByIdAndUpdate(maintenance.tenantId, {
        $pull: { maintenanceRequests: maintenance._id },
      });
    }

    await Maintenance.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Maintenance request deleted',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/maintenance/property/:propertyId
// @desc    Get maintenance requests for a property
// @access  Private
router.get('/property/:propertyId', protect, async (req, res) => {
  try {
    const maintenance = await Maintenance.find({ propertyId: req.params.propertyId })
      .populate('tenantId')
      .sort('-createdAt');

    res.json({
      success: true,
      count: maintenance.length,
      maintenance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
