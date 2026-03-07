import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://kidayos2014:holyunion@ac-qa3hh5e-shard-00-02.py8wt9u.mongodb.net:27017/accounting?ssl=true&authSource=admin&retryWrites=true&w=majority&directConnection=true';

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
    };

    cached!.promise = mongoose.connect(MONGO_URI!, opts).then((mongoose) => {
      console.log('Successfully connected to MongoDB!');
      return mongoose;
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
