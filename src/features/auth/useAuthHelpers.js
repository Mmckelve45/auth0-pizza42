/**
 * Auth0 Helper Hooks and Utilities
 * Use Auth0 SDK directly - no Redux needed!
 */

import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const AUTH0_NAMESPACE = 'https://pizza42.com';

/**
 * Custom hook to get Auth0 user with parsed custom claims
 */
export const useAuthUser = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (!isAuthenticated || !user) {
    return { user: null, isAuthenticated: false, isLoading };
  }

  // Parse custom claims from ID token
  const emailVerified = user[`${AUTH0_NAMESPACE}/email_verified`] ?? user.email_verified;
  const orderHistory = user[`${AUTH0_NAMESPACE}/order_history`] || [];
  const riskScore = user[`${AUTH0_NAMESPACE}/risk_score`] || 0;
  const role = user[`${AUTH0_NAMESPACE}/role`] || null;

  return {
    user,
    isAuthenticated,
    isLoading,
    emailVerified,
    orderHistory,
    riskScore,
    role,
  };
};

/**
 * Custom hook to get access token with scopes
 */
export const useAccessToken = () => {
  const { getAccessTokenSilently } = useAuth0();

  const getToken = async () => {
    try {
      const token = await getAccessTokenSilently();
      return token;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  };

  return { getToken };
};

/**
 * Check if user can place orders (email verified)
 */
export const useCanPlaceOrders = () => {
  const { emailVerified, isAuthenticated } = useAuthUser();
  return isAuthenticated && emailVerified;
};

/**
 * Check if user is an employee
 */
export const useIsEmployee = () => {
  const { role, isAuthenticated } = useAuthUser();
  return isAuthenticated && role === 'Employee';
};

/**
 * Check if user has a specific scope
 */
export const useHasScope = (requiredScope) => {
  const { getAccessTokenSilently } = useAuth0();
  const [hasScope, setHasScope] = React.useState(null);

  React.useEffect(() => {
    const checkScope = async () => {
      try {
        // Try to get token with the required scope
        await getAccessTokenSilently({
          authorizationParams: {
            scope: requiredScope,
          },
        });

        // If we got the token, we have the scope
        setHasScope(true);
      } catch (error) {
        // If error, we don't have the scope
        console.log('Scope check failed:', error);
        setHasScope(false);
      }
    };

    checkScope();
  }, [requiredScope, getAccessTokenSilently]);

  return hasScope;
};
