const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const DB = process.env.MONGODB_URI;
    await mongoose.connect(DB);
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
