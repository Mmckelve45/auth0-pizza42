/**
 * Authentication middleware
 * Wraps Auth0 JWT validation for Vercel serverless functions
 */

import { jwtCheck, getUserIdFromToken } from '../lib/auth0.js';
import { unauthorized } from '../lib/response.js';

/**
 * Middleware to require authentication on serverless routes
 * Usage: wrap your handler function with requireAuth
 */
export const requireAuth = (handler) => {
  return async (req, res) => {
    try {
      // Run JWT validation
      await new Promise((resolve, reject) => {
        jwtCheck(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // If we get here, token is valid
      // Attach user info to request
      req.userId = getUserIdFromToken(req);

      // Call the actual handler
      return await handler(req, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json(unauthorized('Invalid or missing authentication token'));
    }
  };
};

/**
 * Optional auth middleware - doesn't fail if no token
 * Attaches user info if token is present and valid
 */
export const optionalAuth = (handler) => {
  return async (req, res) => {
    try {
      await new Promise((resolve) => {
        jwtCheck(req, res, (_err) => {
          // Always resolve, don't reject - this is optional auth
          resolve();
        });
      });

      if (req.auth && req.auth.payload) {
        req.userId = getUserIdFromToken(req);
      }
    } catch (error) {
      // Silently continue without auth
      console.log('Optional auth failed, continuing without authentication');
    }

    return await handler(req, res);
  };
};
