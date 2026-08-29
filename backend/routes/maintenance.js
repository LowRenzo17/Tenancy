import express from 'express';
import { body, validationResult } from 'express-validator';
import Maintenance from '../models/Maintenance.js';
import Tenant from '../models/Tenant.js';
import Property from '../models/Property.js';
import { protect, authorize } from '../middleware/auth.js';
import { sendMaintenanceNotificationEmail } from '../utils/emailUtils.js';
import { emitToUsers } from '../utils/realtime.js';

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
      const tenantRecord = await Tenant.findOne({ userId: req.user._id });
      if (tenantRecord) {
        query.tenantId = tenantRecord._id;
      } else {
        return res.json({ success: true, count: 0, maintenance: [] });
      }
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);
    const skip = (page - 1) * limit;
    const total = await Maintenance.countDocuments(query);

    const maintenance = await Maintenance.find(query)
      .populate('propertyId')
      .populate('tenantId')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      page,
      limit,
      total,
      count: maintenance.length,
      maintenance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
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
    let isAuthorized = false;
    if (maintenance.ownerId.toString() === req.user._id.toString()) {
      isAuthorized = true;
    } else if (req.user.accountType === 'tenant') {
      const tenantRecord = await Tenant.findOne({ userId: req.user._id });
      // maintenance.tenantId is populated, so its _id must be accessed
      if (tenantRecord && maintenance.tenantId?._id?.toString() === tenantRecord._id.toString()) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
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
    body('title', 'Title is required').trim().notEmpty().isLength({ max: 200 }),
    body('description', 'Description is required').trim().notEmpty().isLength({ max: 2000 }),
    body('category', 'Category is required').isIn(['plumbing', 'electrical', 'hvac', 'structural', 'appliance', 'other']),
    body('propertyId', 'Property ID is required').notEmpty(),
    body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes must be shorter than 1000 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { title, description, category, priority, propertyId, estimatedCost, notes } = req.body;

      let ownerId = req.user._id;
      let actualTenantId = null;
      const property = await Property.findById(propertyId).select('ownerId currentTenant');

      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }

      // If tenant is creating request, find owner & tenant details automatically
      if (req.user.accountType === 'tenant') {
        const tenant = await Tenant.findOne({ userId: req.user._id });
        if (!tenant || tenant.assignedProperty?.toString() !== property._id.toString()) {
          return res.status(403).json({ success: false, message: 'Not authorized for this property' });
        }
        ownerId = tenant.ownerId;
        actualTenantId = tenant._id;
      } else if (req.user.accountType === 'owner') {
        if (property.ownerId.toString() !== req.user._id.toString()) {
          return res.status(403).json({ success: false, message: 'Not authorized for this property' });
        }
        actualTenantId = property.currentTenant || null;
      } else {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      const maintenance = new Maintenance({
        propertyId,
        tenantId: actualTenantId,
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
      if (actualTenantId) {
        await Tenant.findByIdAndUpdate(actualTenantId, {
          $push: { maintenanceRequests: maintenance._id },
        });

        // Send notification email
        const tenant = await Tenant.findById(actualTenantId);
        if (tenant) {
          await sendMaintenanceNotificationEmail(tenant.email, title, 'pending');
        }
      }

      // Emit socket event for real-time update
      const io = req.app.get('io');
      if (io) {
        const tenant = actualTenantId ? await Tenant.findById(actualTenantId).select('userId') : null;
        emitToUsers(io, 'maintenance-created', maintenance, [ownerId, tenant?.userId]);
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
router.put(
  '/:id',
  protect,
  [
    body('title').optional().trim().isLength({ max: 200 }),
    body('description').optional().trim().isLength({ max: 2000 }),
    body('category').optional().isIn(['plumbing', 'electrical', 'hvac', 'structural', 'appliance', 'other']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'emergency']),
    body('status').optional().isIn(['pending', 'in-progress', 'completed', 'cancelled']),
    body('startDate').optional().isISO8601(),
    body('completionDate').optional().isISO8601(),
    body('estimatedCost').optional().isNumeric(),
    body('actualCost').optional().isNumeric(),
    body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes must be shorter than 1000 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      let maintenance = await Maintenance.findById(req.params.id);

    if (!maintenance) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found' });
    }

    // Check authorization
    let isAuthorized = false;
    let isOwner = false;
    
    if (maintenance.ownerId.toString() === req.user._id.toString()) {
      isAuthorized = true;
      isOwner = true;
    } else if (req.user.accountType === 'tenant') {
      const tenantRecord = await Tenant.findOne({ userId: req.user._id });
      if (tenantRecord && maintenance.tenantId?.toString() === tenantRecord._id.toString()) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Update fields
    const { title, description, category, priority, status, startDate, completionDate, estimatedCost, actualCost, contractor, notes } = req.body;

    if (title) maintenance.title = title;
    if (description) maintenance.description = description;
    if (category) maintenance.category = category;
    if (priority) maintenance.priority = priority;

    const isCompleting = isOwner && status === 'completed' && maintenance.status !== 'completed';

    if (isOwner) {
      if (status) maintenance.status = status;
      if (startDate) maintenance.startDate = startDate;
      if (completionDate) maintenance.completionDate = completionDate;
      if (isCompleting && !completionDate) maintenance.completionDate = new Date();
      if (estimatedCost !== undefined) maintenance.estimatedCost = estimatedCost;
      if (actualCost !== undefined) maintenance.actualCost = actualCost;
      if (contractor) maintenance.contractor = contractor;
      if (notes) maintenance.notes = notes;
    }

    maintenance = await maintenance.save();

    if (isCompleting) {
      await Property.findByIdAndUpdate(maintenance.propertyId, {
        $push: {
          maintenanceHistory: {
            date: maintenance.completionDate,
            description: maintenance.title,
            cost: maintenance.actualCost || maintenance.estimatedCost,
            contractor: maintenance.contractor?.company || maintenance.contractor?.name || '',
          },
        },
      });
    }

    // Send notification email if status changed
    if (isOwner && status && maintenance.tenantId) {
      const tenant = await Tenant.findById(maintenance.tenantId);
      if (tenant) {
        await sendMaintenanceNotificationEmail(tenant.email, maintenance.title, status);
      }
    }

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      const tenant = maintenance.tenantId ? await Tenant.findById(maintenance.tenantId).select('userId') : null;
      emitToUsers(io, 'maintenance-updated', maintenance, [maintenance.ownerId, tenant?.userId]);
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
router.delete('/:id', protect, async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);

    if (!maintenance) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found' });
    }

    // Check authorization
    let isAuthorized = false;
    if (maintenance.ownerId.toString() === req.user._id.toString()) {
      isAuthorized = true;
    } else if (req.user.accountType === 'tenant') {
      const tenantRecord = await Tenant.findOne({ userId: req.user._id });
      if (tenantRecord && maintenance.tenantId?.toString() === tenantRecord._id.toString()) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Remove from tenant's maintenance requests
    if (maintenance.tenantId) {
      await Tenant.findByIdAndUpdate(maintenance.tenantId, {
        $pull: { maintenanceRequests: maintenance._id },
      });
    }

    await Maintenance.findByIdAndDelete(req.params.id);

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      const tenant = maintenance.tenantId ? await Tenant.findById(maintenance.tenantId).select('userId') : null;
      emitToUsers(io, 'maintenance-deleted', { maintenanceId: req.params.id }, [maintenance.ownerId, tenant?.userId]);
    }

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
    const property = await Property.findById(req.params.propertyId).select('ownerId currentTenant');
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const isOwner = property.ownerId.toString() === req.user._id.toString();
    const tenant = req.user.accountType === 'tenant'
      ? await Tenant.findOne({ userId: req.user._id }).select('_id assignedProperty')
      : null;
    const isAssignedTenant = tenant?.assignedProperty?.toString() === property._id.toString();
    if (!isOwner && !isAssignedTenant) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);
    const skip = (page - 1) * limit;
    const query = { propertyId: req.params.propertyId };
    const total = await Maintenance.countDocuments(query);

    const maintenance = await Maintenance.find(query)
      .populate('tenantId')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      page,
      limit,
      total,
      count: maintenance.length,
      maintenance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

export default router;
