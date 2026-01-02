import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import authRoutes from './routes/firebaseAuth';
import orderRoutes from './routes/firebaseOrders';
import adminRoutes from './routes/firebaseAdmin';
import turktakipcimRoutes from './routes/turktakipcim';
import webhookRoutes from './routes/webhooks';

// Load environment variables - .env dosyasını backend klasöründen yükle
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

// Trust proxy - required when behind a reverse proxy (e.g., Render, Vercel, nginx)
// This allows express-rate-limit to correctly identify client IPs from X-Forwarded-For headers
app.set('trust proxy', true);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    'http://127.0.0.1:3003',
    'https://www.fenomengpt.com',
    'https://fenomengpt.com'
  ],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(morgan('combined'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// TurkTakipcim API Routes - Servisler direkt TurkTakipcim'den geliyor
app.use('/api/services', turktakipcimRoutes);
app.use('/api/turktakipcim', turktakipcimRoutes);

// Webhook Routes
app.use('/api/webhooks', webhookRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Supabase test endpoint (development only)
if (process.env.NODE_ENV === 'development') {
  app.get('/api/test/supabase', async (req, res) => {
    try {
      const { supabaseAuth } = require('./config/supabase');
      const testResult = await supabaseAuth.auth.getSession();
      res.json({
        success: true,
        message: 'Supabase client is working',
        hasSession: !!testResult.data.session,
        anonKey: process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

export default app;