/**
 * CORS middleware for Vercel serverless functions
 */

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  process.env.PRODUCTION_URL || null,
].filter(Boolean);

/**
 * Add CORS headers to response
 */
export const cors = (handler) => {
  return async (req, res) => {
    const origin = req.headers.origin;

    // Check if origin is allowed
    if (ALLOWED_ORIGINS.includes(origin) || process.env.NODE_ENV === 'development') {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    return await handler(req, res);
  };
};
