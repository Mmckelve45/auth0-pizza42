/**
 * Error handling middleware
 * Provides consistent error responses
 */

import { serverError, badRequest } from '../lib/response.js';

/**
 * Wrap async handlers to catch errors
 */
export const asyncHandler = (handler) => {
  return async (req, res) => {
    try {
      return await handler(req, res);
    } catch (error) {
      console.error('Handler error:', error);

      // Handle specific error types
      if (error.name === 'ValidationError') {
        return res.status(400).json(badRequest('Validation error', error.message));
      }

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: {
            message: error.message,
          },
        });
      }

      // Default server error
      return res.status(500).json(serverError(error.message || 'An unexpected error occurred'));
    }
  };
};

/**
 * Validate request body against schema
 */
export const validateBody = (schema) => {
  return (handler) => {
    return async (req, res) => {
      try {
        // Basic validation - can be enhanced with a library like Joi or Zod
        const missingFields = [];

        for (const field of schema.required || []) {
          if (!(field in req.body)) {
            missingFields.push(field);
          }
        }

        if (missingFields.length > 0) {
          return res.status(400).json(
            badRequest(`Missing required fields: ${missingFields.join(', ')}`)
          );
        }

        return await handler(req, res);
      } catch (error) {
        return res.status(400).json(badRequest('Invalid request body'));
      }
    };
  };
};
