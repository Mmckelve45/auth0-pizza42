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
