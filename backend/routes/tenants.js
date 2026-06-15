import express from 'express';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import Tenant from '../models/Tenant.js';
import Property from '../models/Property.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import { sendTenantOnboardingEmail, sendTenantInviteEmail } from '../utils/emailUtils.js';
import { generateToken } from '../utils/tokenUtils.js';

const router = express.Router();

// @route   GET /api/tenants
// @desc    Get all tenants for owner
// @access  Private
router.get('/', protect, authorize('owner'), async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);
    const skip = (page - 1) * limit;

    const query = { ownerId: req.user._id };
    const total = await Tenant.countDocuments(query);

    const tenants = await Tenant.find(query)
      .populate('assignedProperty')
      .populate('maintenanceRequests')
      .sort('-leaseStartDate')
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      page,
      limit,
      total,
      count: tenants.length,
      tenants,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   GET /api/tenants/me/profile
// @desc    Get current tenant's profile
// @access  Private (Tenants only)
router.get('/me/profile', protect, authorize('tenant'), async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ 
      $or: [
        { userId: req.user._id },
        { email: req.user.email.toLowerCase() }
      ]
    })
      .populate('assignedProperty')
      .populate('maintenanceRequests');

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant profile not found' });
    }

    res.json({
      success: true,
      tenant,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/tenants/my-owner
// @desc    Get the property manager linked to the current tenant's account
// @access  Private (Tenant only)
router.get('/my-owner', protect, authorize('tenant'), async (req, res) => {
  try {
    const tenant = await Tenant.findOne({
      $or: [
        { userId: req.user._id },
        { email: req.user.email.toLowerCase() }
      ]
    }).populate('ownerId', 'fullName email accountType');

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'No tenant profile linked to your account' });
    }

    if (!tenant.ownerId) {
      return res.status(404).json({ success: false, message: 'Property manager not found for this account' });
    }

    res.json({
      success: true,
      owner: tenant.ownerId,  // { _id, fullName, email, accountType }
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
    body('fullName', 'Full name is required').trim().notEmpty().isLength({ max: 100 }),
    body('email', 'Valid email is required').isEmail().normalizeEmail(),
    body('assignedProperty', 'Property ID is required').notEmpty(),
    body('monthlyRent', 'Monthly rent is required').isNumeric(),
    body('leaseStartDate', 'Lease start date is required').isISO8601(),
    body('leaseEndDate', 'Lease end date is required').isISO8601().custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.leaseStartDate)) {
        throw new Error('Lease end date must be later than lease start date');
      }
      return true;
    }),
    body('notes').optional().isLength({ max: 1000 }).withMessage('Notes must be shorter than 1000 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { fullName, email, phone, assignedProperty, unitNumber, monthlyRent, leaseStartDate, leaseEndDate, securityDeposit, emergencyContact, occupants, notes } = req.body;
      const normalizedEmail = email.trim().toLowerCase();

      // Verify property exists and belongs to owner
      const property = await Property.findById(assignedProperty);
      if (!property || property.ownerId.toString() !== req.user._id.toString()) {
        return res.status(400).json({ success: false, message: 'Invalid property' });
      }

      // Check if a tenant with this email already exists
      const existingTenant = await Tenant.findOne({ email: normalizedEmail });
      if (existingTenant) {
        return res.status(400).json({ success: false, message: 'A resident with this email is already registered.' });
      }

      // Check if a user with this email already exists
      let existingUser = await User.findOne({ email: normalizedEmail });
      
      let generatedPassword = null;
      let inviteToken = null;
      let inviteExpiresAt = null;
      let inviteStatus = 'none';
      const useInviteLink = req.body.useInviteLink === true;

      if (existingUser) {
        if (existingUser.accountType !== 'tenant') {
          return res.status(400).json({ success: false, message: 'Email is registered to a Property Owner account. Provide a new email.' });
        }
        console.log(`[INFO] Tenant ${email} already has a user account. Skipping onboarding invite flow.`);
        inviteStatus = 'accepted';
      } else {
        if (useInviteLink) {
          inviteToken = crypto.randomBytes(32).toString('hex');
          inviteExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
          inviteStatus = 'pending';
        } else {
          // Cryptographically secure 16-char temp password
          generatedPassword = crypto.randomBytes(12).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 12) + '!A1';
          
          existingUser = new User({
            fullName,
            email: normalizedEmail,
            password: generatedPassword,
            accountType: 'tenant',
            requiresPasswordChange: true
          });
          await existingUser.save();
          
          // Dispatch onboarding email asynchronously
          sendTenantOnboardingEmail(email, generatedPassword, fullName)
            .then(success => {
              if (success) console.log(`[SUCCESS] Onboarding email sent to ${email}`);
              else console.error(`[ERROR] Failed to send onboarding email to ${email}`);
            })
            .catch(err => {
              console.error("[ERROR] Critical failure inside email dispatcher:", err);
            });
        }
      }

      const tenant = new Tenant({
        ownerId: req.user._id,
        fullName,
        email,
        phone,
        assignedProperty,
        unitNumber,
        monthlyRent,
        leaseStartDate,
        leaseEndDate,
        securityDeposit: securityDeposit || 0,
        emergencyContact: emergencyContact || {},
        occupants: occupants || {},
        notes,
        rentStatus: 'pending',
        userId: existingUser ? existingUser._id : null,
        inviteToken,
        inviteExpiresAt,
        inviteStatus
      });

      await tenant.save();

      // Dispatch invite email asynchronously if token is generated
      if (inviteToken) {
        sendTenantInviteEmail(email, inviteToken, fullName, property.name, unitNumber, req.user.fullName)
          .then(success => {
            if (success) console.log(`[SUCCESS] Invite email sent to ${email}`);
            else console.error(`[ERROR] Failed to send invite email to ${email}`);
          })
          .catch(err => {
            console.error("[ERROR] Critical failure inside email dispatcher:", err);
          });
      }

      // Update property with current tenant
      property.currentTenant = tenant._id;
      property.occupancyStatus = 'occupied';
      property.leaseStartDate = leaseStartDate;
      property.leaseEndDate = leaseEndDate;
      await property.save();

      // Emit socket event for real-time update
      const io = req.app.get('io');
      if (io) {
        io.emit('tenant-created', tenant);
        io.emit('property-updated', property);
      }

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
router.put(
  '/:id',
  protect,
  authorize('owner'),
  [
    body('fullName').optional().trim().isLength({ max: 100 }),
    body('email').optional().isEmail().normalizeEmail(),
    body('assignedProperty').optional().notEmpty(),
    body('monthlyRent').optional().isNumeric(),
    body('leaseStartDate').optional().isISO8601().custom((value, { req }) => {
      if (req.body.leaseEndDate && new Date(value) >= new Date(req.body.leaseEndDate)) {
        throw new Error('Lease start date must be earlier than lease end date');
      }
      return true;
    }),
    body('leaseEndDate').optional().isISO8601().custom((value, { req }) => {
      if (req.body.leaseStartDate && new Date(value) <= new Date(req.body.leaseStartDate)) {
        throw new Error('Lease end date must be later than lease start date');
      }
      return true;
    }),
    body('notes').optional().isLength({ max: 1000 }).withMessage('Notes must be shorter than 1000 characters'),
  ],
  async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    let tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    // Check authorization
    if (tenant.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Update optional fields
    const { fullName, email, phone, assignedProperty, unitNumber, monthlyRent, leaseStartDate, leaseEndDate, securityDeposit, rentStatus, emergencyContact, occupants, notes } = req.body;

    if (fullName) tenant.fullName = fullName;
    if (email) {
      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail !== tenant.email.toLowerCase()) {
        const existingTenant = await Tenant.findOne({ email: normalizedEmail });
        if (existingTenant) {
          return res.status(400).json({ success: false, message: 'A resident with this email is already registered.' });
        }
        tenant.email = normalizedEmail;
      }
    }
    if (phone) tenant.phone = phone;
    if (assignedProperty) tenant.assignedProperty = assignedProperty;
    if (unitNumber !== undefined) tenant.unitNumber = unitNumber;
    if (rentStatus) tenant.rentStatus = rentStatus;
    if (monthlyRent) tenant.monthlyRent = monthlyRent;
    if (leaseStartDate) tenant.leaseStartDate = leaseStartDate;
    if (leaseEndDate) tenant.leaseEndDate = leaseEndDate;
    if (securityDeposit !== undefined) tenant.securityDeposit = securityDeposit;
    if (emergencyContact) tenant.emergencyContact = emergencyContact;
    if (occupants) tenant.occupants = occupants;
    if (notes) tenant.notes = notes;

    tenant = await tenant.save();

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('tenant-updated', tenant);
    }

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

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.emit('tenant-deleted', { tenantId: req.params.id });
    }

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
// @access  Private (Owner only)
router.put('/:id/rent-status', protect, authorize('owner'), async (req, res) => {
  try {
    const { rentStatus } = req.body;

    if (!['paid', 'pending', 'overdue'].includes(rentStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid rent status' });
    }

    // Fetch first to verify ownership before mutating
    const tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    if (tenant.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    tenant.rentStatus = rentStatus;
    await tenant.save();

    res.json({
      success: true,
      tenant,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   GET /api/tenants/invite/validate/:token
// @desc    Validate tenant invitation link
// @access  Public
router.get('/invite/validate/:token', async (req, res) => {
  try {
    const tenant = await Tenant.findOne({
      inviteToken: req.params.token,
      inviteExpiresAt: { $gt: new Date() },
      inviteStatus: 'pending',
    }).populate('assignedProperty').populate('ownerId', 'fullName email');

    if (!tenant) {
      return res.status(400).json({ success: false, message: 'Invalid or expired invitation token.' });
    }

    res.json({
      success: true,
      message: 'Invitation is valid.',
      tenant: {
        fullName: tenant.fullName,
        email: tenant.email,
        monthlyRent: tenant.monthlyRent,
        securityDeposit: tenant.securityDeposit,
        leaseStartDate: tenant.leaseStartDate,
        leaseEndDate: tenant.leaseEndDate,
        unitNumber: tenant.unitNumber,
        propertyName: tenant.assignedProperty ? tenant.assignedProperty.name : 'Unknown Property',
        propertyLocation: tenant.assignedProperty ? tenant.assignedProperty.location : '',
        ownerName: tenant.ownerId ? tenant.ownerId.fullName : 'Property Manager',
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/tenants/invite/accept/:token
// @desc    Accept tenant invitation & register account
// @access  Public
router.post(
  '/invite/accept/:token',
  [
    body('password', 'Password must be at least 8 characters and include uppercase, lowercase, number, and special symbol')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const extractedErrors = errors.array();
      return res.status(400).json({
        success: false,
        message: extractedErrors[0]?.msg || 'Invalid request',
        errors: extractedErrors,
      });
    }

    try {
      const tenant = await Tenant.findOne({
        inviteToken: req.params.token,
        inviteExpiresAt: { $gt: new Date() },
        inviteStatus: 'pending',
      });

      if (!tenant) {
        return res.status(400).json({ success: false, message: 'Invalid or expired invitation token.' });
      }

      const normalizedEmail = tenant.email.trim().toLowerCase();

      // Check if user already exists
      let existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      }

      const { password, phone, emergencyContact, occupants } = req.body;

      // Create new user account
      const user = new User({
        fullName: tenant.fullName,
        email: normalizedEmail,
        password,
        accountType: 'tenant',
        requiresPasswordChange: false,
        phone: phone || null,
      });

      await user.save();

      // Update Tenant document
      tenant.userId = user._id;
      tenant.inviteToken = null;
      tenant.inviteExpiresAt = null;
      tenant.inviteStatus = 'accepted';
      if (phone) tenant.phone = phone;
      if (emergencyContact) tenant.emergencyContact = emergencyContact;
      if (occupants) tenant.occupants = occupants;

      await tenant.save();

      // Emit socket event for real-time updates
      const io = req.app.get('io');
      if (io) {
        io.emit('tenant-updated', tenant);
      }

      // Generate JWT session token
      const token = generateToken(user._id);

      res.status(200).json({
        success: true,
        message: 'Onboarding completed successfully.',
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          accountType: user.accountType,
          phone: user.phone,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

export default router;
