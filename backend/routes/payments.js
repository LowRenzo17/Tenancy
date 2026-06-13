import express from 'express';
import { body, validationResult } from 'express-validator';
import Payment from '../models/Payment.js';
import Tenant from '../models/Tenant.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/payments
// @desc    Get all payments
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};

    if (req.user.accountType === 'owner') {
      query.ownerId = req.user._id;
    } else if (req.user.accountType === 'tenant') {
      // Payment.tenantId references the Tenant document, NOT the User document.
      // We must look up the tenant profile first to get its _id.
      const tenantProfile = await Tenant.findOne({
        $or: [
          { userId: req.user._id },
          { email: req.user.email?.toLowerCase() },
        ],
      }).select('_id');

      if (!tenantProfile) {
        return res.json({ success: true, page: 1, limit: 25, total: 0, count: 0, payments: [] });
      }
      query.tenantId = tenantProfile._id;
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);
    const skip = (page - 1) * limit;
    const total = await Payment.countDocuments(query);

    const payments = await Payment.find(query)
      .populate('tenantId')
      .populate('propertyId')
      .sort('-month')
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      page,
      limit,
      total,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error('GET /payments error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});


// @route   GET /api/payments/:id
// @desc    Get single payment
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('tenantId')
      .populate('propertyId');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Check authorization — tenantId is populated so check tenantId.userId (User ref)
    const isOwner = payment.ownerId.toString() === req.user._id.toString();
    const isTenant = payment.tenantId?.userId?.toString() === req.user._id.toString()
      || payment.tenantId?._id?.toString() === req.user._id.toString();
    if (!isOwner && !isTenant) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({
      success: true,
      payment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/payments
// @desc    Create new payment record
// @access  Private
router.post(
  '/',
  protect,
  authorize('owner'),
  [
    body('tenantId', 'Tenant ID is required').notEmpty(),
    body('propertyId', 'Property ID is required').notEmpty(),
    body('amount', 'Amount is required').isNumeric(),
    body('month', 'Month is required').isISO8601(),
    body('dueDate', 'Due date is required').isISO8601(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { tenantId, propertyId, amount, month, dueDate, status, paymentMethod, lateFee, discount } = req.body;

      const totalAmount = amount + (lateFee || 0) - (discount || 0);

      const payment = new Payment({
        tenantId,
        propertyId,
        ownerId: req.user._id,
        amount,
        month,
        dueDate,
        status: status || 'pending',
        paymentMethod: paymentMethod || 'bank-transfer',
        lateFee: lateFee || 0,
        discount: discount || 0,
        totalAmount,
      });

      await payment.save();

      // Update tenant's payment history
      await Tenant.findByIdAndUpdate(tenantId, {
        $push: {
          paymentHistory: {
            month,
            amount: totalAmount,
            status: status || 'pending',
            method: paymentMethod || 'bank-transfer',
          },
        },
      });

      // Emit socket events for real-time updates
      const io = req.app.get('io');
      if (io) {
        io.emit('payment-created', payment);
        io.emit('analytics-updated', { type: 'payment_created' });
      }

      res.status(201).json({
        success: true,
        payment,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// @route   PUT /api/payments/:id
// @desc    Update payment
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Check authorization
    if (payment.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Update fields
    const { status, paymentDate, paymentMethod, transactionId, lateFee, discount, notes, receiptUrl } = req.body;

    if (status) payment.status = status;
    if (paymentDate) payment.paymentDate = paymentDate;
    if (paymentMethod) payment.paymentMethod = paymentMethod;
    if (transactionId) payment.transactionId = transactionId;
    if (lateFee !== undefined) payment.lateFee = lateFee;
    if (discount !== undefined) payment.discount = discount;
    if (notes) payment.notes = notes;
    if (receiptUrl) payment.receiptUrl = receiptUrl;

    // Recalculate total amount
    payment.totalAmount = payment.amount + payment.lateFee - payment.discount;

    payment = await payment.save();

    // Sync tenant rentStatus based on confirmed payment status
    if (status === 'paid') {
      await Tenant.findByIdAndUpdate(payment.tenantId, { rentStatus: 'paid' });
    } else if (status === 'overdue' || status === 'cancelled') {
      await Tenant.findByIdAndUpdate(payment.tenantId, { rentStatus: 'overdue' });
    }

    // Sync the matching entry in tenant's embedded paymentHistory
    if (status) {
      const tenant = await Tenant.findById(payment.tenantId);
      if (tenant && tenant.paymentHistory && tenant.paymentHistory.length > 0) {
        const paymentMonthStr = new Date(payment.month).toLocaleString('default', { month: 'long', year: 'numeric' });
        tenant.paymentHistory = tenant.paymentHistory.map(p => {
          // Match by month date field (stored as 'month' in embedded schema)
          const historyMonthStr = p.month
            ? new Date(p.month).toLocaleString('default', { month: 'long', year: 'numeric' })
            : '';
          if (historyMonthStr === paymentMonthStr) {
            return { ...p.toObject(), status, paidDate: status === 'paid' ? new Date() : p.paidDate };
          }
          return p;
        });
        await tenant.save();
      }
    }

    // Emit socket events for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.emit('payment-updated', payment);
      io.emit('tenant-profile-updated', await Tenant.findById(payment.tenantId));
      io.emit('analytics-updated', { type: 'payment_updated' });
    }

    res.json({
      success: true,
      payment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/payments/:id
// @desc    Delete payment
// @access  Private
router.delete('/:id', protect, authorize('owner'), async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Check authorization
    if (payment.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Payment.findByIdAndDelete(req.params.id);

    // Emit socket events for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.emit('payment-deleted', { paymentId: req.params.id });
      io.emit('analytics-updated', { type: 'payment_deleted' });
    }

    res.json({
      success: true,
      message: 'Payment deleted',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/payments/tenant-pay
// @desc    Tenant submits a payment notification for owner to confirm
// @access  Private (Tenants)
router.post('/tenant-pay', protect, authorize('tenant'), async (req, res) => {
  try {
    const { amount, paymentMethod, method, reference, notes } = req.body;

    const tenant = await Tenant.findOne({ userId: req.user._id });
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant profile not found' });
    }

    const month = new Date().toISOString();
    const dueDate = new Date();
    dueDate.setDate(1); // First of current month

    const resolvedMethod = method || paymentMethod || 'bank-transfer';

    const payment = new Payment({
      tenantId: tenant._id,
      propertyId: tenant.assignedProperty,
      ownerId: tenant.ownerId,
      amount: amount || tenant.monthlyRent,
      month,
      dueDate,
      // ⚠️ Status is 'pending' — owner must confirm before it becomes 'paid'
      status: 'pending',
      paymentDate: null,
      paymentMethod: resolvedMethod,
      totalAmount: amount || tenant.monthlyRent,
      transactionId: reference || null,
      notes: notes || `Tenant submitted via portal. Ref: ${reference || 'N/A'}`,
    });

    await payment.save();

    // Append to tenant's paymentHistory as 'pending' — do NOT change rentStatus
    tenant.paymentHistory.push({
      month,
      amount: payment.totalAmount,
      status: 'pending',
      paidDate: null,
      method: resolvedMethod,
    });
    await tenant.save();

    // Emit socket events so owner dashboard shows the new pending payment immediately
    const io = req.app.get('io');
    if (io) {
      io.emit('payment-created', payment);
      io.emit('tenant-profile-updated', tenant);
      io.emit('analytics-updated', { type: 'payment_created' });
    }

    res.status(201).json({
      success: true,
      message: 'Payment submitted and awaiting owner confirmation',
      payment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/payments/tenant/:tenantId
// @desc    Get payments for a specific tenant
// @access  Private
router.get('/tenant/:tenantId', protect, async (req, res) => {
  try {
    if (req.user.accountType === 'tenant' && req.user._id.toString() !== req.params.tenantId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const query = { tenantId: req.params.tenantId };
    if (req.user.accountType === 'owner') {
      query.ownerId = req.user._id;
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);
    const skip = (page - 1) * limit;
    const total = await Payment.countDocuments(query);

    const payments = await Payment.find(query)
      .populate('propertyId')
      .sort('-month')
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      page,
      limit,
      total,
      count: payments.length,
      payments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   GET /api/payments/property/:propertyId
// @desc    Get payments for a specific property
// @access  Private
router.get('/property/:propertyId', protect, async (req, res) => {
  try {
    const query = { propertyId: req.params.propertyId };

    if (req.user.accountType === 'tenant') {
      query.tenantId = req.user._id;
    } else if (req.user.accountType === 'owner') {
      query.ownerId = req.user._id;
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);
    const skip = (page - 1) * limit;
    const total = await Payment.countDocuments(query);

    const payments = await Payment.find(query)
      .populate('tenantId')
      .sort('-month')
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      page,
      limit,
      total,
      count: payments.length,
      payments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

export default router;
