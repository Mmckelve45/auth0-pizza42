/**
 * Menu API endpoint
 * GET /api/menu - Fetch pizza menu (public)
 */

import { getMenu } from '../backend/lib/restaurant-api.js';
import { success, serverError } from '../backend/lib/response.js';
import { cors } from '../backend/middleware/cors.js';
import { asyncHandler } from '../backend/middleware/error-handler.js';

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const menu = await getMenu();
    return res.status(200).json(success(menu));
  } catch (error) {
    console.error('Error fetching menu:', error);
    return res.status(500).json(serverError('Failed to fetch menu'));
  }
};

export default cors(asyncHandler(handler));
