/**
 * Local Development Server
 * Runs API routes locally without Vercel
 */

// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import express from 'express';

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Route helper
const runHandler = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Dynamically import and set up routes after env vars are loaded
async function setupRoutes() {
  // Import API routes (using dynamic imports to ensure env vars are loaded first)
  const menuHandler = (await import('./api/menu.js')).default;
  const ordersHandler = (await import('./api/orders/index.js')).default;
  const orderByIdHandler = (await import('./api/orders/[orderId].js')).default;
  const profileHandler = (await import('./api/user/profile.js')).default;
  const subscriptionHandler = (await import('./api/user/subscription.js')).default;
  const metadataHandler = (await import('./api/user/metadata.js')).default;

  // Routes
  app.all('/api/menu', runHandler(menuHandler));
  app.all('/api/orders', runHandler(ordersHandler));
  app.all('/api/orders/:orderId', (req, res) => {
    // Pass orderId via query to match Vercel behavior
    // Use Object.defineProperty to bypass read-only restriction
    try {
      if (!req.query || typeof req.query !== 'object') {
        Object.defineProperty(req, 'query', {
          value: { orderId: req.params.orderId },
          writable: true,
          enumerable: true,
          configurable: true,
        });
      } else {
        req.query.orderId = req.params.orderId;
      }
    } catch (e) {
      // Fallback: create a new request-like object
      console.warn('Could not set query property, using workaround');
      const originalReq = req;
      req = new Proxy(originalReq, {
        get(target, prop) {
          if (prop === 'query') {
            return { orderId: originalReq.params.orderId };
          }
          return target[prop];
        }
      });
    }
    console.log('📦 Order ID from params:', req.params.orderId);
    runHandler(orderByIdHandler)(req, res);
  });
  app.all('/api/user/profile', runHandler(profileHandler));
  app.all('/api/user/subscription', runHandler(subscriptionHandler));
  app.all('/api/user/metadata', runHandler(metadataHandler));

  app.listen(PORT, () => {
    console.log(`\n🚀 API Server running on http://localhost:${PORT}`);
    console.log(`📝 Available routes:`);
    console.log(`   GET    /api/menu`);
    console.log(`   GET    /api/orders`);
    console.log(`   POST   /api/orders`);
    console.log(`   GET    /api/orders/:orderId`);
    console.log(`   PATCH  /api/orders/:orderId`);
    console.log(`   GET    /api/user/profile`);
    console.log(`   PATCH  /api/user/profile`);
    console.log(`   PATCH  /api/user/subscription`);
    console.log(`   GET    /api/user/metadata`);
    console.log(`\n💡 Run 'npm run dev' in another terminal for the frontend\n`);
  });
}

setupRoutes();
