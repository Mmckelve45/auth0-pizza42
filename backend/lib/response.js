/**
 * Standard API response helpers
 * Provides consistent response formatting across all API routes
 */

export const success = (data, statusCode = 200) => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      success: true,
      data,
    }),
  };
};

export const error = (message, statusCode = 500, details = null) => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      success: false,
      error: {
        message,
        ...(details && { details }),
      },
    }),
  };
};

export const unauthorized = (message = 'Unauthorized') => {
  return error(message, 401);
};

export const forbidden = (message = 'Forbidden') => {
  return error(message, 403);
};

export const notFound = (message = 'Resource not found') => {
  return error(message, 404);
};

export const badRequest = (message = 'Bad request', details = null) => {
  return error(message, 400, details);
};

export const serverError = (message = 'Internal server error') => {
  return error(message, 500);
};
