/**
 * Linked Accounts Badge Component
 * Displays all linked identities for the current user
 */

import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useDispatch } from 'react-redux';
import { addToast } from '../toast/toastSlice';

function LinkedAccountsBadge() {
  const { user } = useAuth0();
  const dispatch = useDispatch();
  const [identities, setIdentities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (user?.sub) {
      // Parse identities from user object
      // Auth0 returns identities array with all linked accounts
      const userIdentities = user.identities || [];
      setIdentities(userIdentities);
      setIsLoading(false);
    }
  }, [user]);

  const handleUnlink = async (provider, userId) => {
    if (!window.confirm('Are you sure you want to unlink this account?')) {
      return;
    }

    try {
      // Use environment variable for link server URL
      const linkServerBaseUrl = import.meta.env.VITE_LINK_SERVER_URL || 'http://localhost:3002';
      const unlinkUrl = `${linkServerBaseUrl}/link/complete/unlink`;

      const response = await fetch(unlinkUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          primaryUserId: user.sub,
          provider,
          userId,
        }),
      });

      if (response.ok) {
        dispatch(
          addToast({
            type: 'success',
            message: 'Account unlinked successfully. Please refresh to see changes.',
            duration: 5000,
          })
        );

        // Refresh after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error('Failed to unlink account');
      }
    } catch (error) {
      console.error('Error unlinking account:', error);
      dispatch(
        addToast({
          type: 'error',
          message: 'Failed to unlink account. Please try again.',
        })
      );
    }
  };

  const getProviderIcon = (provider) => {
    const icons = {
      'google-oauth2': '🔍',
      auth0: '📧',
      'github': '🐙',
      'facebook': '📘',
      'twitter': '🐦',
    };
    return icons[provider] || '🔗';
  };

  const getProviderName = (provider) => {
    const names = {
      'google-oauth2': 'Google',
      auth0: 'Email/Password',
      github: 'GitHub',
      facebook: 'Facebook',
      twitter: 'Twitter',
    };
    return names[provider] || provider;
  };

  if (isLoading) {
    return (
      <div className="text-sm text-stone-500">Loading linked accounts...</div>
    );
  }

  if (identities.length <= 1) {
    return (
      <div className="rounded-lg bg-stone-50 p-4">
        <p className="text-sm text-stone-600">
          You have one login method. You can link additional accounts (like
          Google) to access your Pizza 42 profile with multiple authentication
          methods.
        </p>
      </div>
    );
  }

  const displayedIdentities = showAll ? identities : identities.slice(0, 3);
  const primaryIdentity = identities.find((id) => id.isSocial === false) || identities[0];

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h3 className="mb-4 text-lg font-bold text-stone-800">
        Linked Accounts ({identities.length})
      </h3>

      <div className="space-y-3">
        {displayedIdentities.map((identity) => {
          const isPrimary = identity.provider === primaryIdentity.provider;

          return (
            <div
              key={`${identity.provider}-${identity.user_id}`}
              className="flex items-center justify-between rounded-lg border border-stone-200 p-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {getProviderIcon(identity.provider)}
                </span>
                <div>
                  <p className="font-semibold text-stone-800">
                    {getProviderName(identity.provider)}
                    {isPrimary && (
                      <span className="ml-2 rounded-full bg-yellow-400 px-2 py-1 text-xs font-bold uppercase text-stone-800">
                        Primary
                      </span>
                    )}
                  </p>
                  {identity.connection && (
                    <p className="text-xs text-stone-500">
                      Connection: {identity.connection}
                    </p>
                  )}
                </div>
              </div>

              {!isPrimary && (
                <button
                  onClick={() =>
                    handleUnlink(identity.provider, identity.user_id)
                  }
                  className="text-sm text-red-600 hover:text-red-800 hover:underline"
                >
                  Unlink
                </button>
              )}
            </div>
          );
        })}
      </div>

      {identities.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-sm font-semibold text-yellow-600 hover:text-yellow-700"
        >
          {showAll
            ? 'Show Less'
            : `Show ${identities.length - 3} More...`}
        </button>
      )}

      <div className="mt-4 rounded bg-stone-50 p-3">
        <p className="text-xs text-stone-600">
          💡 <strong>Tip:</strong> You can log in using any of these methods and
          access the same profile and order history.
        </p>
      </div>
    </div>
  );
}

export default LinkedAccountsBadge;
