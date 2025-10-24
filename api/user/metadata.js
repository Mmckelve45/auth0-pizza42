/**
 * User Metadata API
 * GET /api/user/metadata - Get user's Auth0 metadata including address
 */

import { getManagementUser, formatAddress } from '../../backend/lib/management-api.js';
import { success, serverError } from '../../backend/lib/response.js';
import { requireAuth } from '../../backend/middleware/auth.js';
import { cors } from '../../backend/middleware/cors.js';
import { asyncHandler } from '../../backend/middleware/error-handler.js';
import { getUserIdFromToken } from '../../backend/lib/auth0.js';

const handler = async (req, res) => {
  // GET - Fetch user metadata from Auth0
  if (req.method === 'GET') {
    try {
      const auth0UserId = getUserIdFromToken(req);

      // Fetch full user profile from Management API
      console.log('[Metadata] Fetching user:', auth0UserId);
      const user = await getManagementUser(auth0UserId);

      // Format address if it exists
      const formattedAddress = user.user_metadata?.address
        ? formatAddress(user.user_metadata.address)
        : null;

      // Return plain JSON for Express (not Vercel wrapper)
      return res.status(200).json({
        success: true,
        data: {
          fullName: user.user_metadata?.fullName || null,
          address: formattedAddress,
          user_metadata: user.user_metadata,
          app_metadata: user.app_metadata,
        },
      });
    } catch (error) {
      console.error('Error fetching user metadata:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch user metadata',
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};

export default cors(requireAuth(asyncHandler(handler)));
