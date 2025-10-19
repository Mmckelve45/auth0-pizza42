/**
 * User Metadata Storage Utility
 * Manages user metadata in localStorage
 */

const METADATA_KEY = 'pizza42_user_metadata';

/**
 * Fetch and store user metadata from Auth0
 */
export const fetchAndStoreMetadata = async (getAccessTokenSilently) => {
  try {
    const token = await getAccessTokenSilently();
    const response = await fetch('/api/user/metadata', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const metadata = data.data;

      // Store in localStorage
      localStorage.setItem(METADATA_KEY, JSON.stringify({
        fullName: metadata.fullName,
        address: metadata.address,
        fetchedAt: new Date().toISOString(),
      }));

      return metadata;
    }
  } catch (error) {
    console.error('Error fetching metadata:', error);
  }
  return null;
};

/**
 * Get metadata from localStorage
 */
export const getStoredMetadata = () => {
  try {
    const stored = localStorage.getItem(METADATA_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error reading metadata from localStorage:', error);
    return null;
  }
};

/**
 * Clear metadata from localStorage
 */
export const clearStoredMetadata = () => {
  localStorage.removeItem(METADATA_KEY);
};

/**
 * Get full name from metadata (fallback to Auth0 user.name)
 */
export const getDisplayName = (user) => {
  const metadata = getStoredMetadata();
  return metadata?.fullName || user?.name || user?.email || 'User';
};
