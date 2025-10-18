/**
 * User Profile API endpoint
 * GET /api/user/profile - Get user profile (protected)
 * PATCH /api/user/profile - Update user profile (protected)
 */

import { getOrCreateUser, updateUser, getUserPreferences, updateUserPreferences } from '../../backend/lib/db.js';
import { success, serverError } from '../../backend/lib/response.js';
import { requireAuth } from '../../backend/middleware/auth.js';
import { cors } from '../../backend/middleware/cors.js';
import { asyncHandler } from '../../backend/middleware/error-handler.js';
import { getUserIdFromToken, getEmailFromToken } from '../../backend/lib/auth0.js';

const handler = async (req, res) => {
  // GET - Fetch user profile and preferences
  if (req.method === 'GET') {
    try {
      const auth0Id = getUserIdFromToken(req);
      const email = getEmailFromToken(req);

      const user = await getOrCreateUser(auth0Id, email);
      const preferences = await getUserPreferences(user.id);

      return res.status(200).json(
        success({
          user,
          preferences,
        })
      );
    } catch (error) {
      console.error('Error fetching profile:', error);
      return res.status(500).json(serverError('Failed to fetch profile'));
    }
  }

  // PATCH - Update user profile
  if (req.method === 'PATCH') {
    try {
      const auth0Id = getUserIdFromToken(req);
      const email = getEmailFromToken(req);

      const user = await getOrCreateUser(auth0Id, email);

      const { name, phone, preferences } = req.body;

      // Update user basic info
      let updatedUser = user;
      if (name || phone) {
        updatedUser = await updateUser(user.id, { name, phone });
      }

      // Update preferences if provided
      let updatedPreferences = await getUserPreferences(user.id);
      if (preferences) {
        updatedPreferences = await updateUserPreferences(user.id, preferences);
      }

      return res.status(200).json(
        success({
          user: updatedUser,
          preferences: updatedPreferences,
        })
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      return res.status(500).json(serverError('Failed to update profile'));
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};

export default cors(requireAuth(asyncHandler(handler)));
