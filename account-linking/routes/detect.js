/**
 * Detect Route
 * Checks if there are duplicate accounts with the same verified email
 */

import express from 'express';
import { ManagementClient } from 'auth0';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /link/detect?email=user@example.com
 * Returns list of accounts with matching email
 * Requires: Valid JWT token
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email parameter required' });
    }

    // Initialize Management API client
    const management = new ManagementClient({
      domain: process.env.AUTH0_DOMAIN,
      clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID || process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET || process.env.AUTH0_CLIENT_SECRET,
    });

    // Search for users with this email
    const result = await management.users.getAll({
      q: `email:"${email}"`,
      search_engine: 'v3',
    });

    const accounts = result.data || [];

    // Filter for verified emails only (security requirement)
    const verifiedAccounts = accounts.filter(
      (account) => account.email_verified === true
    );

    // If more than one account exists, linking is suggested
    const hasDuplicates = verifiedAccounts.length > 1;

    res.json({
      hasDuplicates,
      accountCount: verifiedAccounts.length,
      accounts: verifiedAccounts.map((account) => ({
        user_id: account.user_id,
        email: account.email,
        name: account.name,
        picture: account.picture,
        identities: account.identities,
        connection: account.identities?.[0]?.connection || 'unknown',
        provider: account.identities?.[0]?.provider || 'unknown',
      })),
    });
  } catch (error) {
    console.error('Error detecting duplicate accounts:', error);
    res.status(500).json({
      error: 'Failed to detect duplicate accounts',
      message: error.message,
    });
  }
});

export default router;
