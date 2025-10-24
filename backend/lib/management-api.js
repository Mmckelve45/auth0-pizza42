/**
 * Auth0 Management API Client
 * Used to update user metadata and app_metadata
 */

import { ManagementClient } from 'auth0';

// Create Management API client
const getManagementClient = () => {
  return new ManagementClient({
    domain: process.env.AUTH0_DOMAIN,
    clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
    clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
  });
};

/**
 * Update user's app_metadata
 * @param {string} userId - Auth0 user ID (e.g., "auth0|123...")
 * @param {object} appMetadata - App metadata to merge
 */
export const updateUserAppMetadata = async (userId, appMetadata) => {
  try {
    const management = getManagementClient();

    const result = await management.users.update(
      { id: userId },
      {
        app_metadata: appMetadata,
      }
    );

    return result.data;
  } catch (error) {
    console.error('Error updating user app_metadata:', error);
    throw error;
  }
};

/**
 * Update user's user_metadata
 * @param {string} userId - Auth0 user ID (e.g., "auth0|123...")
 * @param {object} userMetadata - User metadata to merge
 */
export const updateUserMetadata = async (userId, userMetadata) => {
  try {
    const management = getManagementClient();

    const result = await management.users.update(
      { id: userId },
      {
        user_metadata: userMetadata,
      }
    );

    return result.data;
  } catch (error) {
    console.error('Error updating user_metadata:', error);
    throw error;
  }
};

/**
 * Send verification email to user
 * @param {string} userId - Auth0 user ID (e.g., "auth0|123...")
 */
export const sendVerificationEmail = async (userId) => {
  try {
    const management = getManagementClient();

    await management.jobs.verifyEmail({ user_id: userId });

    return { success: true };
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

/**
 * Get user by ID with full metadata
 * @param {string} userId - Auth0 user ID
 */
export const getManagementUser = async (userId) => {
  try {
    const management = getManagementClient();
    const result = await management.users.get({ id: userId });
    return result.data;
  } catch (error) {
    console.error('Error getting user from Management API:', error);
    throw error;
  }
};

/**
 * Format address from GeoJSON structure
 * @param {Object} address - Address object from user_metadata
 * @returns {Object} - Formatted address object
 */
export const formatAddress = (address) => {
  if (!address || !address.properties || !address.properties.geocoding) {
    return null;
  }

  const geo = address.properties.geocoding;
  return {
    street: `${geo.house_number || geo.housenumber || ''} ${geo.street || ''}`.trim(),
    city: geo.city || geo.locality || '',
    state: geo.state || '',
    postalCode: geo.postal_code || geo.postcode || '',
    country: geo.country || '',
    formatted: [
      `${geo.house_number || geo.housenumber || ''} ${geo.street || ''}`.trim(),
      geo.city || geo.locality || '',
      `${geo.state || ''} ${geo.postal_code || geo.postcode || ''}`.trim(),
      geo.country || ''
    ].filter(Boolean).join(', ')
  };
};

/**
 * Find users by email address
 * @param {string} email - Email to search for
 * @returns {Array} - Array of user objects
 */
export const findUsersByEmail = async (email) => {
  try {
    const management = getManagementClient();
    const result = await management.users.getAll({
      q: `email:"${email}"`,
      search_engine: 'v3',
    });
    return result.data || [];
  } catch (error) {
    console.error('Error finding users by email:', error);
    throw error;
  }
};

/**
 * Link two user accounts
 * @param {string} primaryUserId - Primary user ID (target)
 * @param {string} provider - Provider of secondary identity (e.g., 'google-oauth2')
 * @param {string} userId - User ID of secondary identity
 */
export const linkAccounts = async (primaryUserId, provider, userId) => {
  try {
    const management = getManagementClient();
    const result = await management.users.link(
      { id: primaryUserId },
      {
        provider: provider,
        user_id: userId,
      }
    );
    return result.data;
  } catch (error) {
    console.error('Error linking accounts:', error);
    throw error;
  }
};

/**
 * Unlink a secondary identity from a user account
 * @param {string} primaryUserId - Primary user ID
 * @param {string} provider - Provider of identity to unlink
 * @param {string} userId - User ID of identity to unlink
 */
export const unlinkAccount = async (primaryUserId, provider, userId) => {
  try {
    const management = getManagementClient();
    await management.users.unlink({
      id: primaryUserId,
      provider: provider,
      user_id: userId,
    });
    return { success: true };
  } catch (error) {
    console.error('Error unlinking account:', error);
    throw error;
  }
};

/**
 * Get all identities for a user (shows linked accounts)
 * @param {string} userId - Auth0 user ID
 * @returns {Array} - Array of identity objects
 */
export const getUserIdentities = async (userId) => {
  try {
    const management = getManagementClient();
    const result = await management.users.get({ id: userId });
    return result.data?.identities || [];
  } catch (error) {
    console.error('Error getting user identities:', error);
    throw error;
  }
};
