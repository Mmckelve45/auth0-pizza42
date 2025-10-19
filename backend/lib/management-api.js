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
 * Get user by ID
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
