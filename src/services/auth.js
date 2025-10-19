/**
 * Auth helper for getting tokens outside of React components
 * This allows us to use Auth0 tokens in React Router actions
 */

// Store the Auth0 client instance globally
let auth0ClientInstance = null;

export const setAuth0Client = (client) => {
  auth0ClientInstance = client;
};

export const getAccessToken = async () => {
  if (!auth0ClientInstance) {
    throw new Error('Auth0 client not initialized. Make sure to call setAuth0Client in your App component.');
  }

  try {
    const token = await auth0ClientInstance.getAccessTokenSilently();
    return token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
};

export const isAuthenticated = () => {
  return auth0ClientInstance?.isAuthenticated() || false;
};
