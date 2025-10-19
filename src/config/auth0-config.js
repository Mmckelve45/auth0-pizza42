/**
 * Auth0 Configuration
 * Central configuration for Auth0 React SDK
 */

export const auth0Config = {
  domain: import.meta.env.AUTH0_DOMAIN,
  clientId: import.meta.env.AUTH0_CLIENT_ID,
  authorizationParams: {
    redirect_uri: import.meta.env.AUTH0_REDIRECT_URI || window.location.origin,
    audience: import.meta.env.AUTH0_AUDIENCE,
    scope: 'openid profile email read:orders create:orders update:orders read:profile update:profile',
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
