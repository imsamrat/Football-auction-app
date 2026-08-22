const mongoose = require('mongoose');
const config = require('./index');

const connectDB = async () => {
  try {
    const uri = config.mongodbUri;
    
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    setupListeners();
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const setupListeners = () => {
  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected');
  });
};

module.exports = connectDB;
