/**
 * User Profile Page
 * Shows user info and Auth0 tokens for demo purposes
 */

import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchAndStoreMetadata } from '../../utils/userMetadata';
import { addToast } from '../toast/toastSlice';
import LinkedAccountsBadge from '../account-linking/LinkedAccountsBadge';

function Profile() {
  const { user, getIdTokenClaims, getAccessTokenSilently, isLoading } = useAuth0();
  const dispatch = useDispatch();
  const [idToken, setIdToken] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [showDecoded, setShowDecoded] = useState(false);
  const [subscription, setSubscription] = useState('standard');
  const [isUpdatingSubscription, setIsUpdatingSubscription] = useState(false);
  const [userMetadata, setUserMetadata] = useState(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const getTokensAndMetadata = async () => {
      try {
        const idTokenClaims = await getIdTokenClaims();
        const accessTokenString = await getAccessTokenSilently();

        setIdToken(idTokenClaims.__raw);
        setAccessToken(accessTokenString);

        // Get subscription from app_metadata
        const currentSubscription = user['https://pizza42.com/subscription'] ||
                                    user.app_metadata?.subscription ||
                                    'standard';
        setSubscription(currentSubscription);

        // Auto-fetch metadata and store in localStorage
        setIsLoadingMetadata(true);
        const metadata = await fetchAndStoreMetadata(getAccessTokenSilently);
        if (metadata) {
          setUserMetadata(metadata);
        }
        setIsLoadingMetadata(false);
      } catch (error) {
        console.error('Error getting tokens:', error);
        setIsLoadingMetadata(false);
      }
    };

    if (!isLoading && user) {
      getTokensAndMetadata();
    }
  }, [getIdTokenClaims, getAccessTokenSilently, isLoading, user]);

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      // Force token refresh which updates user claims
      await getAccessTokenSilently({ cacheMode: 'off' });

      // Show success toast
      dispatch(addToast({
        type: 'success',
        message: 'Token refreshed successfully!',
        duration: 3000,
      }));

      // Reload the page to get fresh user data
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Error refreshing user data:', error);
      dispatch(addToast({
        type: 'error',
        message: 'Failed to refresh token. Please try again.',
      }));
      setIsRefreshing(false);
    }
  };

  const toggleSubscription = async () => {
    const newSubscription = subscription === 'premium' ? 'standard' : 'premium';
    setIsUpdatingSubscription(true);

    try {
      const token = await getAccessTokenSilently();
      const response = await fetch('/api/user/subscription', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subscription: newSubscription }),
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data.data.subscription);
        dispatch(addToast({
          type: 'success',
          message: `Subscription updated to ${data.data.subscription}!`,
        }));
      } else {
        console.error('Failed to update subscription');
        dispatch(addToast({
          type: 'error',
          message: 'Failed to update subscription. Please try again.',
        }));
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      dispatch(addToast({
        type: 'error',
        message: 'Error updating subscription. Please try again.',
      }));
    } finally {
      setIsUpdatingSubscription(false);
    }
  };

  const decodeJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return { error: 'Invalid token' };
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-center text-stone-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-center text-stone-600">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Back Button */}
      <Link
        to="/"
        className="mb-6 inline-block text-sm font-semibold text-yellow-500 hover:text-yellow-600"
      >
        ← Back to Home
      </Link>

      {/* User Info */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-stone-800">Profile</h1>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 rounded-full bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-50"
            title="Refresh user data"
          >
            <svg
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {user.picture && (
              <img
                src={user.picture}
                alt={user.name || 'User'}
                className="h-20 w-20 rounded-full"
              />
            )}
            <div>
              <p className="text-lg font-semibold text-stone-800">
                {userMetadata?.fullName || user.name || 'No name'}
              </p>
              <p className="text-sm text-stone-600">{user.email}</p>
              <p className="mt-1 text-xs text-stone-500">
                {user.email_verified ? '✓ Email verified' : '⚠ Email not verified'}
              </p>

              {/* Address */}
              {!isLoadingMetadata && userMetadata?.address && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-stone-600">Address:</p>
                  <p className="text-xs text-stone-700">{userMetadata.address.formatted}</p>
                </div>
              )}

              {/* Subscription */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs font-medium text-stone-600">Subscription:</span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                  subscription === 'premium'
                    ? 'bg-yellow-400 text-stone-800'
                    : 'bg-stone-200 text-stone-700'
                }`}>
                  {subscription}
                </span>
              </div>
            </div>
          </div>

          {/* Subscription Toggle Button */}
          <button
            onClick={toggleSubscription}
            disabled={isUpdatingSubscription}
            className={`rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-colors duration-300 focus:outline-none focus:ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
              subscription === 'premium'
                ? 'bg-stone-300 text-stone-800 hover:bg-stone-400 focus:ring-stone-300'
                : 'bg-yellow-400 text-stone-800 hover:bg-yellow-300 focus:ring-yellow-300'
            }`}
          >
            {isUpdatingSubscription
              ? 'Updating...'
              : subscription === 'premium'
              ? 'Go Back to Standard'
              : 'Upgrade to Premium'}
          </button>
        </div>

        {/* Display Metadata */}
        {userMetadata && (
          <div className="mt-4 rounded bg-green-100 p-3">
            <p className="text-sm font-semibold text-green-800">Metadata Fetched!</p>
            {userMetadata.fullName && (
              <p className="text-sm text-green-700">Full Name: {userMetadata.fullName}</p>
            )}
            {userMetadata.address && (
              <p className="text-sm text-green-700">Address: {userMetadata.address.formatted}</p>
            )}
            {!userMetadata.address && (
              <p className="text-sm text-orange-700">No address found in user_metadata</p>
            )}
          </div>
        )}
      </div>

      {/* Decode Button */}
      <div className="mb-6 text-center">
        <button
          onClick={() => setShowDecoded(!showDecoded)}
          className="rounded-full bg-yellow-400 px-6 py-3 font-semibold uppercase tracking-wide text-stone-800 transition-colors duration-300 hover:bg-yellow-300 focus:bg-yellow-300 focus:outline-none focus:ring focus:ring-yellow-300 focus:ring-offset-2"
        >
          {showDecoded ? 'Hide Decoded Tokens' : 'Decode Tokens'}
        </button>
      </div>

      {/* ID Token */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-3 text-lg font-bold text-stone-800">ID Token (Encoded)</h2>
        <div className="overflow-x-auto rounded bg-stone-100 p-4">
          <code className="break-all text-xs text-stone-700">{idToken || 'Loading...'}</code>
        </div>

        {showDecoded && idToken && (
          <div className="mt-4">
            <h3 className="mb-2 font-semibold text-stone-700">Decoded Payload:</h3>
            <div className="overflow-x-auto rounded bg-stone-800 p-4">
              <pre className="text-xs text-green-400">
                {JSON.stringify(decodeJWT(idToken), null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Access Token */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-3 text-lg font-bold text-stone-800">Access Token (Encoded)</h2>
        <div className="overflow-x-auto rounded bg-stone-100 p-4">
          <code className="break-all text-xs text-stone-700">{accessToken || 'Loading...'}</code>
        </div>

        {showDecoded && accessToken && (
          <div className="mt-4">
            <h3 className="mb-2 font-semibold text-stone-700">Decoded Payload:</h3>
            <div className="overflow-x-auto rounded bg-stone-800 p-4">
              <pre className="text-xs text-green-400">
                {JSON.stringify(decodeJWT(accessToken), null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Linked Accounts */}
      <LinkedAccountsBadge />

      {/* User Object */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-3 text-lg font-bold text-stone-800">User Object (from Auth0 SDK)</h2>
        <div className="overflow-x-auto rounded bg-stone-800 p-4">
          <pre className="text-xs text-blue-400">{JSON.stringify(user, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}

export default Profile;
