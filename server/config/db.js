import mongoose from 'mongoose';

const CONNECT_OPTS = {
  serverSelectionTimeoutMS: 20_000,
  // Prefer IPv4 for TCP to Atlas (avoids broken IPv6 routes on some networks).
  family: 4,
};

/**
 * Connects to MongoDB using MONGODB_URI from environment.
 * Use a standard mongodb:// URI (not mongodb+srv) if Windows DNS fails SRV lookups (querySrv ECONNREFUSED).
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set in environment');
  }

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(uri, CONNECT_OPTS);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
}
