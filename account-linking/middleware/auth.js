/**
 * Authentication middleware for Account Linking Server
 * Validates Auth0 JWT tokens from the main Pizza42 app
 */

import { auth } from 'express-oauth2-jwt-bearer';

// Auth0 JWT validation middleware
const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  tokenSigningAlg: 'RS256',
});

/**
 * Extract user ID from Auth0 token
 * @param {Object} req - Express request object with auth property
 * @returns {string} - Auth0 user ID (sub claim)
 */
export const getUserIdFromToken = (req) => {
  if (!req.auth || !req.auth.payload) {
    throw new Error('No auth payload found in request');
  }
  return req.auth.payload.sub;
};

/**
 * Middleware to require authentication
 * Usage: router.get('/', requireAuth, handler)
 */
export const requireAuth = async (req, res, next) => {
  try {
    // Run JWT validation
    await new Promise((resolve, reject) => {
      jwtCheck(req, res, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    // If we get here, token is valid
    // Attach user info to request for easy access
    req.userId = getUserIdFromToken(req);

    next();
  } catch (error) {
    console.error('[Auth] Token validation failed:', error.message);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing authentication token',
    });
  }
};
