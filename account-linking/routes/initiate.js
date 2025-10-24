/**
 * Initiate Route
 * Starts the account linking flow by creating a continuation token
 * and rendering a prompt for the user to re-authenticate
 */

import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

const CONTINUATION_TOKEN_SECRET =
  process.env.CONTINUATION_TOKEN_SECRET || 'pizza42-continuation-secret';

/**
 * GET /link/initiate
 * Query params:
 *   - primaryUserId: The user currently logged in
 *   - secondaryUserId: The account to link (requires re-auth)
 *   - email: Email address (for display)
 */
router.get('/', async (req, res) => {
  try {
    const { primaryUserId, secondaryUserId, email } = req.query;

    if (!primaryUserId || !secondaryUserId) {
      return res.status(400).render('error', {
        message: 'Invalid linking request. Missing user IDs.',
      });
    }

    // Create continuation token with short expiration (5 minutes)
    const continuationToken = jwt.sign(
      {
        primaryUserId,
        secondaryUserId,
        email,
        timestamp: Date.now(),
      },
      CONTINUATION_TOKEN_SECRET,
      { expiresIn: '5m' }
    );

    // Store in session for additional validation
    req.session.linkingInProgress = {
      primaryUserId,
      secondaryUserId,
      email,
      token: continuationToken,
    };
    console.log('[Initiate] Session created with linking data');
    console.log('[Initiate] Session ID:', req.sessionID);

    // Determine redirect URI based on environment
    // In production, callback goes to Render server, not frontend
    const linkServerUrl = process.env.LINK_SERVER_URL || 'http://localhost:3002';
    const redirectUri = `${linkServerUrl}/link/callback`;

    const appUrl = process.env.VITE_APP_URL || 'http://localhost:5173';

    // Render linking prompt page
    res.render('link-prompt', {
      email,
      primaryUserId,
      secondaryUserId,
      continuationToken,
      auth0Domain: process.env.AUTH0_DOMAIN,
      clientId: process.env.VITE_AUTH0_LINK_CLIENT_ID,
      redirectUri,
      appUrl,
    });
  } catch (error) {
    console.error('Error initiating link:', error);
    res.status(500).render('error', {
      message: 'Failed to initiate account linking',
      error: process.env.NODE_ENV === 'development' ? error : {},
    });
  }
});

export default router;
