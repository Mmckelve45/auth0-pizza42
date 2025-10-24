/**
 * Account Linking Express Server
 * Handles secure account linking flow for Pizza42
 *
 * This server implements Auth0's recommended "Suggested Account Linking"
 * pattern with server-side session management and re-authentication.
 */

import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const PgSession = connectPgSimple(session);

// Import routes
import detectRoute from './routes/detect.js';
import initiateRoute from './routes/initiate.js';
import callbackRoute from './routes/callback.js';
import linkRoute from './routes/link.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local only in development
// In production (Render), env vars are set via dashboard
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
}

const app = express();
const PORT = process.env.PORT || process.env.LINK_SERVER_PORT || 3002;

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// CORS middleware - Allow requests from frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration with Postgres store (for serverless compatibility)
const sessionStore = new PgSession({
  conString: process.env.DATABASE_URL,
  tableName: 'session',
  createTableIfMissing: true, // Auto-create table if it doesn't exist
});

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'pizza42-linking-secret-change-in-prod',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 10 * 60 * 1000, // 10 minutes - linking flow should be quick
    },
  })
);

// Logging middleware
app.use((req, res, next) => {
  console.log(`[Account Linking] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/link/detect', detectRoute);
app.use('/link/initiate', initiateRoute);
app.use('/link/callback', callbackRoute);
app.use('/link/complete', linkRoute);

// Health check
app.get('/link/health', (req, res) => {
  res.json({ status: 'ok', service: 'account-linking' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[Account Linking Error]:', err);
  res.status(500).render('error', {
    message: 'An error occurred during account linking',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🔗 Account Linking Server running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);

  if (process.env.NODE_ENV !== 'production') {
    console.log(`   Health check: http://localhost:${PORT}/link/health`);
    console.log(`\n📋 Environment Check:`);
    console.log(`   AUTH0_DOMAIN: ${process.env.AUTH0_DOMAIN ? '✓ Set' : '✗ Missing'}`);
    console.log(`   AUTH0_MANAGEMENT_CLIENT_ID: ${process.env.AUTH0_MANAGEMENT_CLIENT_ID ? '✓ Set' : '✗ Missing'}`);
    console.log(`   AUTH0_MANAGEMENT_CLIENT_SECRET: ${process.env.AUTH0_MANAGEMENT_CLIENT_SECRET ? '✓ Set (hidden)' : '✗ Missing'}`);
    console.log(`   SESSION_SECRET: ${process.env.SESSION_SECRET ? '✓ Set' : '⚠ Using default'}`);
    console.log(`   VITE_AUTH0_LINK_CLIENT_ID: ${process.env.VITE_AUTH0_LINK_CLIENT_ID ? '✓ Set' : '✗ Missing'}\n`);
  }
});

// Export for Vercel (if needed)
export default app;
