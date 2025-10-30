/**
 * Auth0 Configuration
 * Central configuration for Auth0 React SDK
 */

// Define all scopes needed by the application
export const BASE_SCOPES = 'openid profile email read:orders create:orders update:orders read:profile update:profile';
export const PRIVILEGED_SCOPES = 'update:pizza'; // Requires MFA
export const ALL_SCOPES = `${BASE_SCOPES} ${PRIVILEGED_SCOPES}`;

export const auth0Config = {
  domain: import.meta.env.AUTH0_DOMAIN,
  clientId: import.meta.env.AUTH0_CLIENT_ID,
  authorizationParams: {
    redirect_uri: import.meta.env.AUTH0_REDIRECT_URI || window.location.origin,
    audience: import.meta.env.AUTH0_AUDIENCE,
    scope: BASE_SCOPES, // Initial login only requests base scopes
  },
  // Cache location - use memory for better security
  cacheLocation: 'localstorage',
  // Use refresh tokens for better UX
  useRefreshTokens: true,
};

// Custom namespace for custom claims
export const AUTH0_NAMESPACE = 'https://pizza42.com';

// Helper to get custom claims from token
export const getCustomClaim = (user, claim) => {
  return user?.[`${AUTH0_NAMESPACE}/${claim}`];
};
