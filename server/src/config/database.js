const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ArticlesDB';

    const conn = await mongoose.connect(mongoURI, {
      dbName: "ArticlesDB", // explicitly set the database
    });

    console.log(`✅ [DB Connection] MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 [DB Info] Database: ${conn.connection.name}`);
    console.log(`📋 [DB Info] Collection: Articles`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ [DB Error] MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ [DB Warning] MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 [DB Connection] MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ [DB Error] Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;


