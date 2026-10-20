const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const authMiddleware = require('../middleware/auth');

// Protect all routes below with authMiddleware
router.use(authMiddleware);

// Helper function to build Mongoose filter query from request parameters
const buildFilterQuery = (query) => {
  const filter = {};

  if (query.gateway && query.gateway !== 'All') {
    filter.gateway = query.gateway;
  }

  if (query.paymentMethod && query.paymentMethod !== 'All') {
    filter.paymentMethod = query.paymentMethod;
  }

  if (query.customerSegment && query.customerSegment !== 'All') {
    filter.customerSegment = query.customerSegment;
  }

  if (query.geography && query.geography !== 'All') {
    filter.geography = query.geography;
  }

  if (query.status && query.status !== 'All') {
    filter.status = query.status;
  }

  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [
      { id: searchRegex },
      { customerName: searchRegex },
      { failureReason: searchRegex },
    ];
  }

  // Date range filter
  if (query.days) {
    const days = parseInt(query.days, 10);
    if (!isNaN(days) && days > 0) {
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - days);
      filter.createdAt = { $gte: dateLimit };
    }
  } else if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate) {
      filter.createdAt.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      filter.createdAt.$lte = new Date(query.endDate);
    }
  }

  return filter;
};

// GET /api/payments - List payments with filters
router.get('/', async (req, res) => {
  try {
    const filter = buildFilterQuery(req.query);
    const payments = await Payment.find(filter).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (err) {
    console.error('Error fetching payments:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch payments.' });
  }
});

// GET /api/payments/stats - Get dashboard aggregated metrics and chart analytics
router.get('/stats', async (req, res) => {
  try {
    const filter = buildFilterQuery(req.query);
    const payments = await Payment.find(filter);

    // 1. Metric Cards
    // Total Failures (failed, retrying, abandoned)
    const totalFailures = payments.filter((p) => p.status !== 'recovered').length;

    // Revenue at Risk (sum of failed and retrying amounts)
    const revenueAtRisk = payments
      .filter((p) => p.status === 'failed' || p.status === 'retrying')
      .reduce((sum, p) => sum + p.amount, 0);

    // Recovery Rate calculation
    const totalRetriedOrAttempted = payments.filter((p) => p.retryCount > 0 || p.status === 'recovered' || p.status === 'retrying').length;
    const totalRecovered = payments.filter((p) => p.status === 'recovered').length;
    const recoveryRate = totalRetriedOrAttempted > 0 
      ? Number(((totalRecovered / totalRetriedOrAttempted) * 100).toFixed(1))
      : 0;

    // Active Retries count
    const activeRetries = payments.filter((p) => p.status === 'retrying' || p.retryStatus === 'processing').length;

    // 2. Gateways Breakdown
    const gatewayMap = {};
    payments.forEach((p) => {
      if (!gatewayMap[p.gateway]) {
        gatewayMap[p.gateway] = { gateway: p.gateway, count: 0, amount: 0 };
      }
      gatewayMap[p.gateway].count += 1;
      gatewayMap[p.gateway].amount += p.amount;
    });
    const gatewayBreakdown = Object.values(gatewayMap);

    // 3. 7-Day Trend Chart
    const trendMap = {};
    const now = new Date();
    // Initialize last 7 days with 0s
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
      const formattedLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      trendMap[dateStr] = { date: formattedLabel, rawDate: dateStr, count: 0, amount: 0 };
    }

    payments.forEach((p) => {
      const dateStr = new Date(p.createdAt).toISOString().split('T')[0];
      if (trendMap[dateStr]) {
        trendMap[dateStr].count += 1;
        trendMap[dateStr].amount += p.amount;
      }
    });
    const trend7Days = Object.values(trendMap).sort((a, b) => a.rawDate.localeCompare(b.rawDate));

    // 4. Geography Breakdown (Pie chart)
    const geoMap = {};
    payments.forEach((p) => {
      geoMap[p.geography] = (geoMap[p.geography] || 0) + 1;
    });
    const geographyBreakdown = Object.keys(geoMap).map((geography) => ({
      name: geography,
      value: geoMap[geography],
      percentage: Number(((geoMap[geography] / (payments.length || 1)) * 100).toFixed(1)),
    }));

    // 5. Customer Segment Breakdown
    const segmentMap = {};
    payments.forEach((p) => {
      if (!segmentMap[p.customerSegment]) {
        segmentMap[p.customerSegment] = { segment: p.customerSegment, count: 0, amount: 0 };
      }
      segmentMap[p.customerSegment].count += 1;
      segmentMap[p.customerSegment].amount += p.amount;
    });
    const customerSegmentBreakdown = Object.values(segmentMap);

    return res.json({
      success: true,
      stats: {
        totalFailures,
        revenueAtRisk,
        recoveryRate,
        activeRetries,
        gatewayBreakdown,
        trend7Days,
        geographyBreakdown,
        customerSegmentBreakdown,
      },
    });
  } catch (err) {
    console.error('Error computing payment stats:', err);
    return res.status(500).json({ success: false, message: 'Failed to compute dashboard stats.' });
  }
});

// PUT /api/payments/:id/retry - Retry a failed payment
router.put('/:id/retry', async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findOne({ id });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }

    // Update payment status to retrying
    payment.status = 'retrying';
    payment.retryStatus = 'processing';
    payment.retryCount = (payment.retryCount || 0) + 1;
    await payment.save();

    // Simulate async recovery outcome after 4 seconds (e.g. 70% chance of success for dynamic realism)
    setTimeout(async () => {
      try {
        const p = await Payment.findOne({ id });
        if (p && p.status === 'retrying') {
          const isSuccess = Math.random() > 0.3; // 70% success rate on retry
          p.status = isSuccess ? 'recovered' : 'failed';
          p.retryStatus = isSuccess ? 'successful' : 'failed';
          await p.save();
        }
      } catch (err) {
        console.error('Async retry simulation error:', err);
      }
    }, 4000);

    return res.json({
      success: true,
      message: `Payment ${payment.id} retry initiated successfully. Status updated to Retrying.`,
      payment,
    });
  } catch (err) {
    console.error('Error retrying payment:', err);
    return res.status(500).json({ success: false, message: 'Failed to retry payment.' });
  }
});

// GET /api/payments/export - Export payments as CSV
router.get('/export', async (req, res) => {
  try {
    const filter = buildFilterQuery(req.query);
    const payments = await Payment.find(filter).sort({ createdAt: -1 });

    const headers = [
      'ID',
      'Customer Name',
      'Customer Segment',
      'Amount',
      'Currency',
      'Gateway',
      'Payment Method',
      'Status',
      'Failure Reason',
      'Geography',
      'Retry Count',
      'Retry Status',
      'Created At',
    ];

    const csvRows = [headers.join(',')];

    payments.forEach((p) => {
      const row = [
        `"${p.id}"`,
        `"${p.customerName.replace(/"/g, '""')}"`,
        `"${p.customerSegment}"`,
        p.amount,
        `"${p.currency}"`,
        `"${p.gateway}"`,
        `"${p.paymentMethod}"`,
        `"${p.status}"`,
        `"${p.failureReason.replace(/"/g, '""')}"`,
        `"${p.geography}"`,
        p.retryCount,
        `"${p.retryStatus}"`,
        `"${new Date(p.createdAt).toISOString()}"`,
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="paywatch_payments_export_${Date.now()}.csv"`);
    return res.status(200).send(csvString);
  } catch (err) {
    console.error('Error exporting payments CSV:', err);
    return res.status(500).json({ success: false, message: 'Failed to export CSV.' });
  }
});

module.exports = router;
