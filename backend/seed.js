const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Payment = require('./models/Payment');
const User = require('./models/User');

const seedData = async () => {
  try {
    // Clear existing data
    await Payment.deleteMany({});
    await User.deleteMany({});

    // Seed Admin User
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      name: 'Alex Vance (Lead Finance Engineer)',
      email: 'admin@paywatch.io',
      password: hashedPassword,
      role: 'Administrator',
    });
    console.log(`[Seed] Created admin user: ${adminUser.email}`);

    // Seed 50 realistic payments
    const customers = [
      { name: 'Acme Global Corp', segment: 'Enterprise' },
      { name: 'Nexus Digital Labs', segment: 'Enterprise' },
      { name: 'CloudScale Systems', segment: 'Enterprise' },
      { name: 'Hyperion Dynamics', segment: 'Enterprise' },
      { name: 'Quantum Leap Tech', segment: 'Enterprise' },
      { name: 'Vanguard Logistics', segment: 'Enterprise' },
      { name: 'ByteCraft Solutions', segment: 'SMB' },
      { name: 'Solis Creative Agency', segment: 'SMB' },
      { name: 'Pulse Media Inc', segment: 'SMB' },
      { name: 'Apex Retail Group', segment: 'SMB' },
      { name: 'Aura Fitness App', segment: 'SMB' },
      { name: 'Zenith SaaS Studio', segment: 'SMB' },
      { name: 'NovaPay Services', segment: 'SMB' },
      { name: 'Strata Cloud Operations', segment: 'SMB' },
      { name: 'Samantha Miller', segment: 'Consumer' },
      { name: 'Marcus Brody', segment: 'Consumer' },
      { name: 'Elena Vance', segment: 'Consumer' },
      { name: 'David Chen', segment: 'Consumer' },
      { name: 'Sophia Rodriguez', segment: 'Consumer' },
      { name: 'Liam O’Connor', segment: 'Consumer' },
      { name: 'Amara Okafor', segment: 'Consumer' },
      { name: 'Hiroshi Tanaka', segment: 'Consumer' },
      { name: 'Clara Oswald', segment: 'Consumer' },
      { name: 'Ethan Hunt', segment: 'Consumer' },
      { name: 'Starlight Capital', segment: 'VIP' },
      { name: 'Baron & Sons Investment', segment: 'VIP' },
      { name: 'Monarch Global Wealth', segment: 'VIP' },
      { name: 'Atlas Premier Holdings', segment: 'VIP' },
    ];

    const gateways = ['Stripe', 'PayPal', 'Adyen', 'Razorpay', 'Square'];
    const paymentMethods = ['Credit Card', 'Debit Card', 'ACH', 'Bank Transfer', 'Apple Pay', 'Google Pay'];
    const failureReasons = [
      'Insufficient Funds',
      'Card Expired',
      'Authentication Failed',
      'Network Timeout',
      'Suspected Fraud',
      'Invalid Card Details',
      'Gateway Unavailable',
    ];
    const geographies = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East'];
    const currencies = ['USD', 'EUR', 'GBP', 'CAD'];

    const payments = [];
    const now = new Date();

    for (let i = 1; i <= 50; i++) {
      const cust = customers[i % customers.length];
      const gateway = gateways[i % gateways.length];
      const method = paymentMethods[(i * 3) % paymentMethods.length];
      const reason = failureReasons[(i * 2) % failureReasons.length];
      const geography = geographies[(i * 4) % geographies.length];
      const currency = currencies[i % currencies.length];

      // Spread dates over past 7 days
      const daysAgo = (i % 7);
      const hoursAgo = (i * 5) % 24;
      const createdAt = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000));

      // Realistic amounts based on segment
      let amount = 99;
      if (cust.segment === 'Enterprise') amount = Math.floor(1500 + Math.random() * 8500);
      else if (cust.segment === 'VIP') amount = Math.floor(3000 + Math.random() * 12000);
      else if (cust.segment === 'SMB') amount = Math.floor(250 + Math.random() * 1500);
      else amount = Math.floor(19 + Math.random() * 280);

      // Distribute statuses: failed, retrying, recovered, abandoned
      let status = 'failed';
      let retryCount = 0;
      let retryStatus = 'pending';

      if (i % 5 === 0) {
        status = 'retrying';
        retryCount = 1;
        retryStatus = 'processing';
      } else if (i % 7 === 0) {
        status = 'recovered';
        retryCount = 2;
        retryStatus = 'successful';
      } else if (i % 11 === 0) {
        status = 'abandoned';
        retryCount = 3;
        retryStatus = 'failed';
      } else if (i % 3 === 0) {
        retryCount = 1;
        retryStatus = 'failed';
      }

      payments.push({
        id: `PAY-${1000 + i}`,
        customerName: cust.name,
        customerSegment: cust.segment,
        amount,
        currency,
        gateway,
        paymentMethod: method,
        status,
        failureReason: reason,
        geography,
        retryCount,
        retryStatus,
        createdAt,
      });
    }

    await Payment.insertMany(payments);
    console.log(`[Seed] Successfully seeded ${payments.length} payment failure records!`);
  } catch (err) {
    console.error('[Seed Error]:', err);
  }
};

module.exports = seedData;

if (require.main === module) {
  const connectDB = require('./config/db');
  require('dotenv').config();
  connectDB().then(async () => {
    await seedData();
    process.exit(0);
  });
}
