const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ArticlesDB';

    const conn = await mongoose.connect(mongoURI, {
      dbName: "ArticlesDB", // explicitly set the database
      minPoolSize: 1, // keep a connection warm so idle Atlas closes don't churn
      maxPoolSize: 10,
      // Leave serverSelectionTimeoutMS/socketTimeoutMS at their generous defaults:
      // this cluster (Atlas M0) can be slow to select a server, and a tight
      // timeout here would make the server fail to start on a cold/flaky network.
    });

    console.log(`✅ [DB Connection] MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 [DB Info] Database: ${conn.connection.name}`);
    console.log(`📋 [DB Info] Collection: Articles`);

    // Connection lifecycle events. Mongoose auto-reconnects, so a disconnect is
    // a warning (usually an idle close on the Atlas shared tier), not a failure.
    mongoose.connection.on('error', (err) => {
      console.error('❌ [DB Error] MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ [DB Warning] MongoDB disconnected — mongoose will auto-reconnect');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 [DB Connection] MongoDB reconnected');
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


