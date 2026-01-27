import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api';
import authRoutes from './routes/auth';
import { verifyEmailConfig } from './services/emailService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
// Allow all origins
const corsOptions = {
  origin: '*', // Allow all origins
  credentials: false, // Set to false for cross-origin requests
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Increase timeout for long-running requests (video generation can take 5+ minutes)
app.use((req, res, next) => {
  req.setTimeout(600000); // 10 minutes
  res.setTimeout(600000);
  next();
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API Routes
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  
  // Verify email configuration
  console.log('\n📧 Checking email configuration...');
  const emailConfigured = await verifyEmailConfig();
  if (!emailConfigured) {
    console.warn('\n⚠️  WARNING: Email is NOT configured!');
    console.warn('⚠️  Waitlist emails will FAIL until you:');
    console.warn('⚠️  1. Create a .env file in the backend folder');
    console.warn('⚠️  2. Add SMTP credentials (see .env.example)');
    console.warn('⚠️  3. Restart the server\n');
  } else {
    console.log('✅ Email is configured and ready\n');
  }
});
