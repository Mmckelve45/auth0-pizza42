/**
 * Auth helper for getting tokens outside of React components
 * This allows us to use Auth0 tokens in React Router actions
 */

// Store the Auth0 client instance globally
let auth0ClientInstance = null;
let clientInitPromise = null;
let clientInitResolve = null;

export const setAuth0Client = (client) => {
  auth0ClientInstance = client;

  // Resolve the promise if anyone is waiting for initialization
  if (clientInitResolve) {
    clientInitResolve(client);
  }
};

// Wait for Auth0 client to be initialized
const waitForClient = () => {
  if (auth0ClientInstance) {
    return Promise.resolve(auth0ClientInstance);
  }

  // Create a promise that resolves when setAuth0Client is called
  if (!clientInitPromise) {
    clientInitPromise = new Promise((resolve) => {
      clientInitResolve = resolve;
    });
  }

  return clientInitPromise;
};

export const getAccessToken = async () => {
  // Wait for client to be initialized (max 5 seconds)
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Auth0 client initialization timeout')), 5000)
  );

  try {
    const client = await Promise.race([waitForClient(), timeoutPromise]);
    const token = await client.getAccessTokenSilently();
    return token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
};

export const isAuthenticated = () => {
  return auth0ClientInstance?.isAuthenticated() || false;
};
