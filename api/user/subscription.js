/**
 * User Subscription API
 * PATCH /api/user/subscription - Toggle subscription tier (protected)
 */

import { updateUserAppMetadata } from '../../backend/lib/management-api.js';
import { requireAuth } from '../../backend/middleware/auth.js';
import { cors } from '../../backend/middleware/cors.js';
import { asyncHandler } from '../../backend/middleware/error-handler.js';
import { getUserIdFromToken } from '../../backend/lib/auth0.js';

const handler = async (req, res) => {
  // PATCH - Update subscription tier
  if (req.method === 'PATCH') {
    try {
      const auth0UserId = getUserIdFromToken(req);
      const { subscription } = req.body;

      // Validate subscription value
      if (!subscription || !['standard', 'premium'].includes(subscription)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid subscription. Must be "standard" or "premium"',
        });
      }

      // Update user's app_metadata with Management API
      const updatedUser = await updateUserAppMetadata(auth0UserId, {
        subscription,
      });

      // Return plain JSON for Express (not Vercel wrapper)
      return res.status(200).json({
        success: true,
        data: {
          subscription: updatedUser.app_metadata?.subscription || 'standard',
          message: `Subscription updated to ${subscription}`,
        },
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update subscription',
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};

export default cors(requireAuth(asyncHandler(handler)));
