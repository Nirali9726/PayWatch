const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (uri && !uri.includes('cluster0.mongodb.net')) {
    try {
      console.log('Attempting connection to specified MongoDB URI...');
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[MongoDB Connected]: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.warn(`[MongoDB Connection Error]: ${err.message}. Falling back to in-memory database.`);
    }
  }

  // Attempt Atlas connection if configured
  if (uri) {
    try {
      console.log('Connecting to MongoDB Atlas...');
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 4000,
      });
      console.log(`[MongoDB Atlas Connected]: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.warn(`[MongoDB Atlas Connection Error]: ${err.message}. Initializing fallback database...`);
    }
  }

  // Fallback to MongoMemoryServer for guaranteed seamless functionality
  try {
    console.log('Initializing MongoMemoryServer fallback...');
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    const conn = await mongoose.connect(mongoUri);
    console.log(`[MongoDB Memory Server Connected]: ${conn.connection.host}`);
  } catch (err) {
    console.error(`[Fatal DB Error]: Failed to start database engine: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
