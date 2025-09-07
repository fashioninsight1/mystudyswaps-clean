import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

const app = express();
app.set('trust proxy', 1); 
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    database: process.env.DATABASE_URL ? 'connected' : 'mock'
  });
});

// Welcome page
app.get('/', (req, res) => {
  res.json({ 
    message: 'MyStudy Swaps API is running on Railway!',
    version: '2.0.0',
    features: [
      'User Registration',
      'Child Account Management', 
      'Authentication System',
      'Database Integration'
    ],
    endpoints: {
      auth: '/api/auth/register',
      childLogin: '/api/auth/child-login',
      health: '/health'
    },
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Load auth routes with error handling
async function loadAuthRoutes() {
  try {
    const authModule = await import('./routes/auth.js');
    app.use('/api/auth', authModule.default);
    console.log('✅ Auth routes loaded successfully');
  } catch (error) {
    console.warn('⚠️ Auth routes not found:', error.message);
    console.log('App will continue without auth routes');
  }
}

// Load routes
await loadAuthRoutes();

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`MyStudy Swaps server running on port ${port}`);
  console.log(`Database: ${process.env.DATABASE_URL ? 'Connected' : 'Mock mode'}`);
  console.log(`Health check: http://localhost:${port}/health`);
});
