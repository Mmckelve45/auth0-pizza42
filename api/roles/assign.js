/**
 * Role Assignment API Endpoint
 * Returns a random role (Customer, Employee, or Admin)
 * Protected by Auth0 JWT validation (M2M)
 */

import { auth } from 'express-oauth2-jwt-bearer';
import { cors } from '../../backend/middleware/cors.js';

// Role assignment weights (for demo purposes)
const ROLE_WEIGHTS = {
  'Customer_REGULAR': 0.7,   // 70% chance
  'Customer_LOYAL': 0.2,   // 20% chance
  'Customer_VIP': 0.1,      // 10% chance
};

/**
 * Get a random role based on weighted distribution
 */
function getRandomRole() {
  const random = Math.random();
  let cumulativeWeight = 0;

  for (const [role, weight] of Object.entries(ROLE_WEIGHTS)) {
    cumulativeWeight += weight;
    if (random < cumulativeWeight) {
      return role;
    }
  }

  // Fallback (should never happen)
  return 'Customer_REGULAR';
}

/**
 * Add Express-like methods to Vercel request object
 * Required for express-oauth2-jwt-bearer to work
 */
const polyfillExpressMethods = (req) => {
  // Polyfill req.is() for Content-Type checking
  if (!req.is) {
    req.is = function(types) {
      const contentType = this.headers['content-type'] || '';
      if (!Array.isArray(types)) types = [types];
      for (const type of types) {
        if (contentType.includes(type)) return type;
      }
      return false;
    };
  }

  // Polyfill req.get() for header access
  if (!req.get) {
    req.get = function(name) {
      return this.headers[name.toLowerCase()];
    };
  }

  return req;
};

/**
 * GET /api/roles/assign
 * Returns a randomly assigned role for the user
 * Requires valid M2M token with 'read:role' scope
 */
const handler = async (req, res) => {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'method_not_allowed',
      message: 'Only GET requests are allowed',
    });
  }

  // Add Express methods for compatibility
  polyfillExpressMethods(req);

  // Create JWT validator for Role Service API
  const jwtCheck = auth({
    audience: 'https://pizza42.com/api/role-service',
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
    tokenSigningAlg: 'RS256',
  });

  // Validate JWT
  return new Promise((resolve) => {
    jwtCheck(req, res, (err) => {
      if (err) {
        console.error('JWT validation failed:', err.message);
        res.status(401).json({
          error: 'unauthorized',
          message: 'Invalid or missing access token',
        });
        return resolve();
      }

      // Check if token has required scope
      // The scope is a space-separated string in the JWT payload
      const scopes = req.auth?.payload?.scope?.split(' ') || [];
      if (!scopes.includes('read:role')) {
        console.error('Missing required scope: read:role');
        console.error('Available scopes:', req.auth?.payload?.scope);
        res.status(403).json({
          error: 'forbidden',
          message: 'Insufficient permissions. Required scope: read:role',
        });
        return resolve();
      }

      // Get random role
      const assignedRole = getRandomRole();

      console.log(`Role assigned: ${assignedRole}`);
      console.log(`Requested by: ${req.auth.payload.sub || 'unknown'}`);

      // Return the assigned role
      res.status(200).json({
        role: assignedRole,
        assignedAt: new Date().toISOString(),
        message: `Role '${assignedRole}' has been assigned`,
      });

      resolve();
    });
  });
};

export default cors(handler);
