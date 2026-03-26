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
      query.tenantId = req.user._id;
    }

    const payments = await Payment.find(query)
      .populate('tenantId')
      .populate('propertyId')
      .sort('-month');

    res.json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

    // Check authorization
    if (payment.ownerId.toString() !== req.user._id.toString() && payment.tenantId?.toString() !== req.user._id.toString()) {
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

    // Update tenant's rent status
    if (status === 'paid') {
      await Tenant.findByIdAndUpdate(payment.tenantId, { rentStatus: 'paid' });
    } else if (status === 'overdue') {
      await Tenant.findByIdAndUpdate(payment.tenantId, { rentStatus: 'overdue' });
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

    res.json({
      success: true,
      message: 'Payment deleted',
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
    const payments = await Payment.find({ tenantId: req.params.tenantId })
      .populate('propertyId')
      .sort('-month');

    res.json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/payments/property/:propertyId
// @desc    Get payments for a specific property
// @access  Private
router.get('/property/:propertyId', protect, async (req, res) => {
  try {
    const payments = await Payment.find({ propertyId: req.params.propertyId })
      .populate('tenantId')
      .sort('-month');

    res.json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
