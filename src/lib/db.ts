import mongoose from 'mongoose';
import dns from 'node:dns';

// Set DNS servers to a reliable public one (Google & Cloudflare) 
// to avoid issues with local DNS resolution for MongoDB Atlas.
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Prefer IPv4 to avoid common issues with MongoDB Atlas in some environments
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Use direct connection string to avoid SRV lookup issues
const MONGO_URI = process.env.MONGO_URI || 'mongodb://kidayos2014:holyunion@ac-qa3hh5e-shard-00-00.py8wt9u.mongodb.net:27017,ac-qa3hh5e-shard-00-01.py8wt9u.mongodb.net:27017,ac-qa3hh5e-shard-00-02.py8wt9u.mongodb.net:27017/accounting?ssl=true&replicaSet=atlas-13j3a2-shard-0&authSource=admin&retryWrites=true&w=majority';

if (!MONGO_URI) {
  throw new Error('Please define the MONGO_URI environment variable');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    };

    console.log('Connecting to MongoDB with URI:', MONGO_URI.replace(/\/\/.*:.*@/, '//****:****@'));

    cached!.promise = mongoose.connect(MONGO_URI!, opts).then((mongoose) => {
      console.log('✅ Successfully connected to MongoDB!');
      return mongoose;
    }).catch(err => {
      console.error('❌ MongoDB Connection Error:', err.message);
      throw err;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}

export default connectDB;
