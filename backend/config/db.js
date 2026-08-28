const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoMemoryServer = null;

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studylens';

  try {
    // Set short selection timeout so we fail fast to memory server if local MongoDB isn't running
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[Database] Connected to MongoDB at: ${mongoose.connection.host}`);
  } catch (err) {
    console.warn(`[Database] Standard MongoDB connection failed (${err.message}). Starting MongoMemoryServer fallback...`);
    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const memUri = mongoMemoryServer.getUri();
      await mongoose.connect(memUri);
      console.log(`[Database] Successfully connected to in-memory MongoDB at: ${memUri}`);
    } catch (memErr) {
      console.error(`[Database] Failed to start in-memory MongoDB:`, memErr.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
