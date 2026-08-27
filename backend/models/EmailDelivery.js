import mongoose from 'mongoose';

const emailDeliverySchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    type: { type: String, enum: ['rent-reminder'], required: true },
    dueDate: { type: Date, required: true },
    deduplicationKey: { type: String, required: true, unique: true },
    status: { type: String, enum: ['processing', 'sent', 'failed'], default: 'processing', index: true },
    sendAttempts: { type: Number, default: 1, min: 1 },
    sentAt: { type: Date, default: null },
    lastError: { type: String, default: null },
  },
  { timestamps: true }
);

const EmailDelivery = mongoose.model('EmailDelivery', emailDeliverySchema);
export default EmailDelivery;
