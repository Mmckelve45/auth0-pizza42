/**
 * Link Route
 * Executes the actual account linking via Auth0 Management API
 */

import express from 'express';
import { ManagementClient } from 'auth0';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /link/complete
 * Completes the linking process by calling Management API
 */
router.get('/', async (req, res) => {
  try {
    // Verify session has verified link data
    if (!req.session.verifiedLink) {
      return res.status(400).render('error', {
        message: 'No verified linking session found. Please start the linking process again.',
      });
    }

    const { primaryUserId, secondaryUserId, email } = req.session.verifiedLink;

    // Initialize Management API client
    const management = new ManagementClient({
      domain: process.env.AUTH0_DOMAIN,
      clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID || process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET || process.env.AUTH0_CLIENT_SECRET,
    });

    // Parse the secondary identity components
    // Format: "provider|userId" e.g., "google-oauth2|123456"
    const [provider, userId] = secondaryUserId.split('|');

    // TODO: Preserve metadata from secondary account before linking
    // Before linking, fetch both users' metadata and merge:
    // 1. Get primary user's user_metadata and app_metadata
    // 2. Get secondary user's user_metadata and app_metadata
    // 3. Merge metadata (decide on conflict resolution strategy)
    // 4. Update primary user with merged metadata
    // 5. Then perform the link (secondary account metadata will be lost after linking)
    // Example:
    //   const primaryUser = await management.users.get({ id: primaryUserId });
    //   const secondaryUser = await management.users.get({ id: secondaryUserId });
    //   const mergedMetadata = mergeUserMetadata(primaryUser, secondaryUser);
    //   await management.users.update({ id: primaryUserId }, { user_metadata: mergedMetadata });

    // Link the accounts
    // Secondary account will be linked TO the primary account
    const linkResult = await management.users.link(
      { id: primaryUserId },
      {
        provider: provider,
        user_id: userId,
      }
    );

    console.log('Account linking successful:', {
      primary: primaryUserId,
      secondary: secondaryUserId,
    });

    // Store linking audit trail in database (optional)
    // This could be enhanced to save to your Postgres database
    const auditLog = {
      linked_at: new Date().toISOString(),
      primary_user_id: primaryUserId,
      secondary_user_id: secondaryUserId,
      email: email,
      provider: provider,
    };

    // TODO: Save audit log to database
    // await saveAuditLog(auditLog);

    // Clear session data
    req.session.linkingInProgress = null;
    req.session.verifiedLink = null;

    // Render success page
    res.render('link-success', {
      email,
      primaryUserId,
      secondaryUserId,
      provider,
      returnUrl: process.env.VITE_APP_URL || 'http://localhost:5173',
    });
  } catch (error) {
    console.error('Error completing link:', error);

    // Check for specific Auth0 errors
    let errorMessage = 'Failed to link accounts. Please try again.';

    if (error.statusCode === 400) {
      errorMessage = 'These accounts cannot be linked. They may already be linked.';
    } else if (error.statusCode === 404) {
      errorMessage = 'One or both accounts not found.';
    }

    res.status(error.statusCode || 500).render('error', {
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : '',
    });
  }
});

/**
 * POST /link/unlink
 * Unlinks a secondary identity from the primary account
 * Requires: Valid JWT token
 */
router.post('/unlink', express.json(), requireAuth, async (req, res) => {
  try {
    const { primaryUserId, provider, userId } = req.body;

    if (!primaryUserId || !provider || !userId) {
      return res.status(400).json({
        error: 'Missing required fields: primaryUserId, provider, userId',
      });
    }

    // Security check: Verify the authenticated user is the primary user
    if (req.userId !== primaryUserId) {
      return res.status(403).json({
        error: 'Unauthorized: You can only unlink your own accounts',
      });
    }

    // Initialize Management API client
    const management = new ManagementClient({
      domain: process.env.AUTH0_DOMAIN,
      clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID || process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET || process.env.AUTH0_CLIENT_SECRET,
    });

    // Unlink the identity
    await management.users.unlink({
      id: primaryUserId,
      provider: provider,
      user_id: userId,
    });

    console.log('Account unlinking successful:', {
      primary: primaryUserId,
      provider,
      userId,
    });

    res.json({
      success: true,
      message: 'Account unlinked successfully',
    });
  } catch (error) {
    console.error('Error unlinking account:', error);
    res.status(500).json({
      error: 'Failed to unlink account',
      message: error.message,
    });
  }
});

export default router;
