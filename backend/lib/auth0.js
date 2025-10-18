/**
 * Auth0 configuration and helpers
 * Provides Auth0 JWT validation for serverless functions
 */

import { auth } from 'express-oauth2-jwt-bearer';

// Auth0 JWT validation middleware
export const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
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
 * Extract email from Auth0 token
 * @param {Object} req - Express request object with auth property
 * @returns {string|null} - User email if available
 */
export const getEmailFromToken = (req) => {
  if (!req.auth || !req.auth.payload) {
    return null;
  }
  return req.auth.payload.email || req.auth.payload['https://your-namespace/email'];
};

/**
 * Extract user permissions from Auth0 token
 * @param {Object} req - Express request object with auth property
 * @returns {Array} - Array of permission strings
 */
export const getPermissionsFromToken = (req) => {
  if (!req.auth || !req.auth.payload) {
    return [];
  }
  return req.auth.payload.permissions || [];
};

/**
 * Check if user has specific permission
 * @param {Object} req - Express request object with auth property
 * @param {string} permission - Permission string to check
 * @returns {boolean}
 */
export const hasPermission = (req, permission) => {
  const permissions = getPermissionsFromToken(req);
  return permissions.includes(permission);
};
