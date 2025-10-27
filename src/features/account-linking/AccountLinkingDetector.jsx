/**
 * Account Linking Detector Component
 * Checks for duplicate accounts on login and prompts user to link them
 */

import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

function AccountLinkingDetector() {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [showLinkPrompt, setShowLinkPrompt] = useState(false);
  const [duplicateAccounts, setDuplicateAccounts] = useState([]);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const checkForDuplicates = async () => {
      if (!isAuthenticated || isLoading || !user?.email || !user?.email_verified) {
        return;
      }

      // Check if we've already checked in this session
      const checkedKey = `linking_checked_${user.email}`;
      if (sessionStorage.getItem(checkedKey)) {
        return;
      }

      setIsChecking(true);

      try {
        // Get access token for API authentication
        const token = await getAccessTokenSilently();

        // Use environment variable for link server URL
        const linkServerBaseUrl = import.meta.env.VITE_LINK_SERVER_URL || 'http://localhost:3002';
        const linkServerUrl = `${linkServerBaseUrl}/link/detect?email=${encodeURIComponent(user.email)}`;

        const response = await fetch(linkServerUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();

          if (data.hasDuplicates && data.accountCount > 1) {
            setDuplicateAccounts(data.accounts);
            setShowLinkPrompt(true);
          }

          // Mark as checked for this session
          sessionStorage.setItem(checkedKey, 'true');
        }
      } catch (error) {
        console.error('Error checking for duplicate accounts:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkForDuplicates();
  }, [isAuthenticated, isLoading, user]);

  const handleLinkAccounts = () => {
    // Find the current account and the other account
    const currentAccount = duplicateAccounts.find((acc) => acc.user_id === user.sub);
    const otherAccount = duplicateAccounts.find((acc) => acc.user_id !== user.sub);

    if (currentAccount && otherAccount) {
      // Build query params
      const params = new URLSearchParams({
        primaryUserId: currentAccount.user_id,
        secondaryUserId: otherAccount.user_id,
        email: user.email,
      });

      // Use environment variable for link server URL
      const linkServerBaseUrl = import.meta.env.VITE_LINK_SERVER_URL || 'http://localhost:3002';
      const linkUrl = `${linkServerBaseUrl}/link/initiate?${params}`;

      window.location.href = linkUrl;
    }
  };

  const handleDismiss = () => {
    setShowLinkPrompt(false);
    // Remember dismissal for this session
    sessionStorage.setItem(`linking_dismissed_${user.email}`, 'true');
  };

  if (!showLinkPrompt || isChecking) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-slide-in-right rounded-lg bg-yellow-400 p-6 shadow-xl">
      <div className="mb-3 flex items-start justify-between">
        <h3 className="text-lg font-bold text-stone-800">🔗 Link Your Accounts?</h3>
        <button
          onClick={handleDismiss}
          className="text-stone-600 hover:text-stone-800"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>

      <p className="mb-4 text-sm text-stone-700">
        We detected you have multiple Pizza 42 accounts with the email{' '}
        <strong>{user.email}</strong>. Would you like to link them together?
      </p>

      <div className="mb-4 rounded bg-stone-800 p-3">
        <p className="mb-2 text-xs font-semibold text-yellow-400">
          Found {duplicateAccounts.length} accounts:
        </p>
        {duplicateAccounts.map((account) => (
          <div
            key={account.user_id}
            className="mb-1 text-xs text-white"
          >
            • {account.connection} ({account.provider})
            {account.user_id === user.sub && (
              <span className="ml-1 text-yellow-400">(current)</span>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleLinkAccounts}
          className="flex-1 rounded-full bg-stone-800 px-4 py-2 text-sm font-semibold uppercase text-yellow-400 transition-colors hover:bg-stone-700"
        >
          Link Accounts
        </button>
        <button
          onClick={handleDismiss}
          className="flex-1 rounded-full bg-stone-200 px-4 py-2 text-sm font-semibold uppercase text-stone-800 transition-colors hover:bg-stone-300"
        >
          Not Now
        </button>
      </div>
    </div>
  );
}

export default AccountLinkingDetector;
