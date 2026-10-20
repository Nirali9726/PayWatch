const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerSegment: {
      type: String,
      required: true,
      enum: ['Enterprise', 'SMB', 'Consumer', 'VIP'],
      default: 'SMB',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
    },
    gateway: {
      type: String,
      required: true,
      enum: ['Stripe', 'PayPal', 'Adyen', 'Razorpay', 'Square'],
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['Credit Card', 'Debit Card', 'ACH', 'Bank Transfer', 'Apple Pay', 'Google Pay'],
    },
    status: {
      type: String,
      required: true,
      enum: ['failed', 'retrying', 'recovered', 'abandoned'],
      default: 'failed',
    },
    failureReason: {
      type: String,
      required: true,
      enum: [
        'Insufficient Funds',
        'Card Expired',
        'Authentication Failed',
        'Network Timeout',
        'Suspected Fraud',
        'Invalid Card Details',
        'Gateway Unavailable',
      ],
    },
    geography: {
      type: String,
      required: true,
      enum: ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East'],
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    retryStatus: {
      type: String,
      enum: ['pending', 'processing', 'successful', 'failed'],
      default: 'pending',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
