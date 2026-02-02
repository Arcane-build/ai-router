import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'novi-landing';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
}

export async function connectDatabase(): Promise<void> {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }

    // Extract connection string and add database name
    const uri = MONGODB_URI.replace('/?', `/${MONGODB_DB}?`);

    await mongoose.connect(uri);
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${MONGODB_DB}`);
  } catch (error: any) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
  } catch (error: any) {
    console.error('❌ MongoDB disconnection error:', error.message);
  }
}

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected');
});
