import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a property name'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Please provide a location'],
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    propertyType: {
      type: String,
      enum: ['apartment', 'house', 'condo', 'townhouse', 'commercial'],
      default: 'apartment',
    },
    bedrooms: {
      type: Number,
      default: 0,
    },
    bathrooms: {
      type: Number,
      default: 0,
    },
    squareFeet: {
      type: Number,
      default: 0,
    },
    occupancyStatus: {
      type: String,
      enum: ['occupied', 'vacant', 'maintenance'],
      default: 'vacant',
    },
    monthlyRent: {
      type: Number,
      required: true,
    },
    securityDeposit: {
      type: Number,
      default: 0,
    },
    currentTenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      default: null,
    },
    leaseStartDate: {
      type: Date,
      default: null,
    },
    leaseEndDate: {
      type: Date,
      default: null,
    },
    utilities: {
      electric: Boolean,
      water: Boolean,
      gas: Boolean,
      internet: Boolean,
    },
    amenities: [String],
    images: [String],
    description: String,
    notes: String,
    maintenanceHistory: [{
      date: Date,
      description: String,
      cost: Number,
      contractor: String,
    }],
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

const Property = mongoose.model('Property', propertySchema);
export default Property;
