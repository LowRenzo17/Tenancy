import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fullName: {
      type: String,
      required: [true, 'Please provide tenant name'],
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: null,
    },
    assignedProperty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    rentStatus: {
      type: String,
      enum: ['paid', 'pending', 'overdue'],
      default: 'pending',
    },
    monthlyRent: {
      type: Number,
      required: true,
    },
    leaseStartDate: {
      type: Date,
      required: true,
    },
    leaseEndDate: {
      type: Date,
      required: true,
    },
    securityDeposit: {
      type: Number,
      default: 0,
    },
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },
    occupants: {
      adults: Number,
      children: Number,
      pets: String,
    },
    paymentHistory: [{
      month: Date,
      amount: Number,
      status: String,
      paidDate: Date,
      method: String,
    }],
    maintenanceRequests: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Maintenance',
    }],
    documents: [{
      name: String,
      url: String,
      uploadedAt: Date,
    }],
    notes: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Tenant = mongoose.model('Tenant', tenantSchema);
export default Tenant;
