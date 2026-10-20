require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const Payment = require('./models/Payment');
const seedData = require('./seed');

const app = express();

// Enable CORS for frontend (allows all origins or localhost:5173 / localhost:3000)
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/payments', require('./routes/payments'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), app: 'PayWatch Backend API' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  // Auto-seed if database contains 0 payment records
  try {
    const count = await Payment.countDocuments();
    if (count === 0) {
      console.log('[Auto-Seed] Empty database detected. Seeding 50 payment failure records...');
      await seedData();
    } else {
      console.log(`[Database] Found ${count} payment records.`);
    }
  } catch (err) {
    console.warn('[Auto-Seed Check Error]:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 PayWatch Intelligence API server running on port ${PORT}`);
    console.log(`🌐 Base URL: http://localhost:${PORT}`);
    console.log(`====================================================`);
  });
};

startServer();
