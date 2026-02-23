const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // Return cached connection if available (for serverless)
  if (cached.conn) {
    return cached.conn;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing');
  }

  try {
    if (!cached.promise) {
      cached.promise = mongoose.connect(process.env.MONGODB_URI);
    }
    
    cached.conn = await cached.promise;
    console.log(`MongoDB Connected: ${cached.conn.connection.host}`);
    return cached.conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    cached.promise = null;
    throw error;
  }
};

module.exports = connectDB;
