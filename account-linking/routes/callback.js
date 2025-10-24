/**
 * Callback Route
 * Handles the redirect after user re-authenticates with their secondary identity
 */

import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

const CONTINUATION_TOKEN_SECRET =
  process.env.CONTINUATION_TOKEN_SECRET || 'pizza42-continuation-secret';

/**
 * GET /link/callback
 * Query params:
 *   - code: Authorization code from Auth0
 *   - state: State containing continuation token
 */
router.get('/', async (req, res) => {
  try {
    const { code, state, error, error_description } = req.query;

    console.log('[Callback] Starting callback flow');
    console.log('[Callback] Has session:', !!req.session);
    console.log('[Callback] Has linkingInProgress:', !!req.session?.linkingInProgress);

    // Handle Auth0 errors
    if (error) {
      console.error('[Callback] Auth0 error:', error, error_description);
      return res.status(400).render('error', {
        message: 'Authentication failed',
        error: error_description || error,
      });
    }

    if (!code || !state) {
      console.error('[Callback] Missing code or state');
      return res.status(400).render('error', {
        message: 'Invalid callback. Missing code or state.',
      });
    }

    // Verify continuation token from state
    let tokenData;
    try {
      tokenData = jwt.verify(state, CONTINUATION_TOKEN_SECRET);
      console.log('[Callback] Token verified successfully');
    } catch (err) {
      console.error('[Callback] Token verification failed:', err.message);
      return res.status(400).render('error', {
        message: 'Linking session expired. Please try again.',
      });
    }

    // Verify session matches
    if (
      !req.session.linkingInProgress ||
      req.session.linkingInProgress.token !== state
    ) {
      console.error('[Callback] Session validation failed');
      console.error('[Callback] Session has linkingInProgress:', !!req.session.linkingInProgress);
      console.error('[Callback] Token matches:', req.session.linkingInProgress?.token === state);
      return res.status(400).render('error', {
        message: 'Invalid linking session. Please start over.',
      });
    }

    console.log('[Callback] Session validated successfully');

    // Exchange code for tokens (we need to verify the user re-authenticated)
    // Redirect URI must match what was sent to /authorize
    const linkServerUrl = process.env.LINK_SERVER_URL || 'http://localhost:3002';
    const redirectUri = `${linkServerUrl}/link/callback`;

    const tokenResponse = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: process.env.VITE_AUTH0_LINK_CLIENT_ID,
          client_secret: process.env.AUTH0_LINK_CLIENT_SECRET,
          code,
          redirect_uri: redirectUri,
        }),
      }
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      console.error('Token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorData,
        requestBody: {
          grant_type: 'authorization_code',
          client_id: process.env.VITE_AUTH0_LINK_CLIENT_ID,
          redirect_uri: redirectUri,
        }
      });
      throw new Error(`Failed to exchange code for token: ${errorData.error_description || errorData.error || 'Unknown error'}`);
    }

    const tokens = await tokenResponse.json();

    // Decode the ID token to get the authenticated user
    const idTokenPayload = JSON.parse(
      Buffer.from(tokens.id_token.split('.')[1], 'base64').toString()
    );

    const authenticatedUserId = idTokenPayload.sub;

    // Security check: Verify the authenticated user matches the secondary user
    if (authenticatedUserId !== tokenData.secondaryUserId) {
      return res.status(403).render('error', {
        message:
          'Authentication mismatch. You must authenticate with the account you want to link.',
      });
    }

    // Store verified data for the link completion
    req.session.verifiedLink = {
      primaryUserId: tokenData.primaryUserId,
      secondaryUserId: authenticatedUserId,
      email: tokenData.email,
      accessToken: tokens.access_token,
    };

    // Redirect to completion page
    res.redirect('/link/complete');
  } catch (error) {
    console.error('Error in callback:', error);
    res.status(500).render('error', {
      message: 'Failed to process authentication callback',
      error: process.env.NODE_ENV === 'development' ? error : {},
    });
  }
});

export default router;
