const mongoose = require('mongoose');

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`MongoDB connected: ${conn.connection.host}`);
  }
};

module.exports = connectDB;
