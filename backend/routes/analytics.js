import express from 'express';
import Property from '../models/Property.js';
import Tenant from '../models/Tenant.js';
import Payment from '../models/Payment.js';
import Maintenance from '../models/Maintenance.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics
// @access  Private
router.get('/dashboard', protect, authorize('owner'), async (req, res) => {
  try {
    // Get all properties for owner
    const properties = await Property.find({ ownerId: req.user._id });
    const propertyIds = properties.map((p) => p._id);

    // Get all tenants for owner
    const tenants = await Tenant.find({ ownerId: req.user._id });

    // Get all payments for owner
    const payments = await Payment.find({ ownerId: req.user._id });

    // Get all maintenance for owner
    const maintenanceRequests = await Maintenance.find({ ownerId: req.user._id });

    // Calculate metrics
    const totalProperties = properties.length;
    const occupiedProperties = properties.filter((p) => p.occupancyStatus === 'occupied').length;
    const vacantProperties = properties.filter((p) => p.occupancyStatus === 'vacant').length;
    const maintenanceProperties = properties.filter((p) => p.occupancyStatus === 'maintenance').length;

    const totalTenants = tenants.length;
    const activeTenants = tenants.filter((t) => t.isActive).length;

    const totalRent = properties.reduce((sum, p) => sum + p.monthlyRent, 0);
    const paidRent = payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.totalAmount, 0);
    const pendingRent = payments.filter((p) => p.status === 'pending').reduce((sum, p) => sum + p.totalAmount, 0);
    const overdueRent = payments.filter((p) => p.status === 'overdue').reduce((sum, p) => sum + p.totalAmount, 0);

    const totalMaintenance = maintenanceRequests.length;
    const completedMaintenance = maintenanceRequests.filter((m) => m.status === 'completed').length;
    const pendingMaintenance = maintenanceRequests.filter((m) => m.status === 'pending').length;
    const maintenanceCosts = maintenanceRequests.reduce((sum, m) => sum + (m.actualCost || m.estimatedCost || 0), 0);

    res.json({
      success: true,
      analytics: {
        properties: {
          total: totalProperties,
          occupied: occupiedProperties,
          vacant: vacantProperties,
          maintenance: maintenanceProperties,
        },
        tenants: {
          total: totalTenants,
          active: activeTenants,
        },
        revenue: {
          totalRent,
          paidRent,
          pendingRent,
          overdueRent,
        },
        maintenance: {
          total: totalMaintenance,
          completed: completedMaintenance,
          pending: pendingMaintenance,
          costs: maintenanceCosts,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/analytics/revenue
// @desc    Get revenue analytics
// @access  Private
router.get('/revenue', protect, authorize('owner'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = { ownerId: req.user._id };

    if (startDate || endDate) {
      query.month = {};
      if (startDate) query.month.$gte = new Date(startDate);
      if (endDate) query.month.$lte = new Date(endDate);
    }

    const payments = await Payment.find(query).populate('tenantId propertyId');

    // Group by month
    const revenueByMonth = {};
    payments.forEach((payment) => {
      const month = new Date(payment.month).toISOString().split('T')[0];
      if (!revenueByMonth[month]) {
        revenueByMonth[month] = {
          month,
          total: 0,
          paid: 0,
          pending: 0,
          overdue: 0,
        };
      }

      revenueByMonth[month].total += payment.totalAmount;

      if (payment.status === 'paid') {
        revenueByMonth[month].paid += payment.totalAmount;
      } else if (payment.status === 'pending') {
        revenueByMonth[month].pending += payment.totalAmount;
      } else if (payment.status === 'overdue') {
        revenueByMonth[month].overdue += payment.totalAmount;
      }
    });

    const revenueData = Object.values(revenueByMonth).sort((a, b) => new Date(a.month) - new Date(b.month));

    res.json({
      success: true,
      revenueData,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/analytics/occupancy
// @desc    Get occupancy analytics
// @access  Private
router.get('/occupancy', protect, authorize('owner'), async (req, res) => {
  try {
    const properties = await Property.find({ ownerId: req.user._id });

    const occupancyData = {
      occupied: properties.filter((p) => p.occupancyStatus === 'occupied').length,
      vacant: properties.filter((p) => p.occupancyStatus === 'vacant').length,
      maintenance: properties.filter((p) => p.occupancyStatus === 'maintenance').length,
    };

    const occupancyRate = properties.length > 0 ? (occupancyData.occupied / properties.length) * 100 : 0;

    res.json({
      success: true,
      occupancyData,
      occupancyRate: occupancyRate.toFixed(2),
      totalProperties: properties.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/analytics/maintenance
// @desc    Get maintenance analytics
// @access  Private
router.get('/maintenance', protect, authorize('owner'), async (req, res) => {
  try {
    const maintenanceRequests = await Maintenance.find({ ownerId: req.user._id });

    // Group by category
    const costByCategory = {};
    maintenanceRequests.forEach((m) => {
      if (!costByCategory[m.category]) {
        costByCategory[m.category] = {
          category: m.category,
          count: 0,
          totalCost: 0,
          averageCost: 0,
        };
      }

      costByCategory[m.category].count += 1;
      costByCategory[m.category].totalCost += m.actualCost || m.estimatedCost || 0;
    });

    // Calculate averages
    Object.keys(costByCategory).forEach((category) => {
      if (costByCategory[category].count > 0) {
        costByCategory[category].averageCost = (costByCategory[category].totalCost / costByCategory[category].count).toFixed(2);
      }
    });

    // Group by status
    const statusBreakdown = {
      pending: maintenanceRequests.filter((m) => m.status === 'pending').length,
      'in-progress': maintenanceRequests.filter((m) => m.status === 'in-progress').length,
      completed: maintenanceRequests.filter((m) => m.status === 'completed').length,
      cancelled: maintenanceRequests.filter((m) => m.status === 'cancelled').length,
    };

    res.json({
      success: true,
      costByCategory: Object.values(costByCategory),
      statusBreakdown,
      totalMaintenance: maintenanceRequests.length,
      totalCost: maintenanceRequests.reduce((sum, m) => sum + (m.actualCost || m.estimatedCost || 0), 0),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/analytics/tenant-rent-status
// @desc    Get tenant rent status analytics
// @access  Private
router.get('/tenant-rent-status', protect, authorize('owner'), async (req, res) => {
  try {
    const tenants = await Tenant.find({ ownerId: req.user._id });

    const rentStatusBreakdown = {
      paid: tenants.filter((t) => t.rentStatus === 'paid').length,
      pending: tenants.filter((t) => t.rentStatus === 'pending').length,
      overdue: tenants.filter((t) => t.rentStatus === 'overdue').length,
    };

    res.json({
      success: true,
      rentStatusBreakdown,
      totalTenants: tenants.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/analytics/property/:propertyId
// @desc    Get analytics for a specific property
// @access  Private
router.get('/property/:propertyId', protect, async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId).populate('currentTenant');

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Check authorization
    if (property.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Get payments for property
    const payments = await Payment.find({ propertyId: req.params.propertyId });

    // Get maintenance for property
    const maintenance = await Maintenance.find({ propertyId: req.params.propertyId });

    const propertyAnalytics = {
      property: {
        name: property.name,
        location: property.location,
        type: property.propertyType,
        occupancyStatus: property.occupancyStatus,
      },
      revenue: {
        monthlyRent: property.monthlyRent,
        totalCollected: payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.totalAmount, 0),
        pending: payments.filter((p) => p.status === 'pending').reduce((sum, p) => sum + p.totalAmount, 0),
        overdue: payments.filter((p) => p.status === 'overdue').reduce((sum, p) => sum + p.totalAmount, 0),
      },
      maintenance: {
        totalRequests: maintenance.length,
        completed: maintenance.filter((m) => m.status === 'completed').length,
        pending: maintenance.filter((m) => m.status === 'pending').length,
        totalCost: maintenance.reduce((sum, m) => sum + (m.actualCost || m.estimatedCost || 0), 0),
      },
      tenant: property.currentTenant || null,
    };

    res.json({
      success: true,
      propertyAnalytics,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
