/**
 * Logout Button Component
 */

import { useAuth0 } from '@auth0/auth0-react';

function LogoutButton() {
  const { logout } = useAuth0();

  const handleLogout = async () => {
    // Clear ALL caches before logging out
    localStorage.clear();
    sessionStorage.clear();

    // Force a full page reload after logout to ensure clean state
    await logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
      openUrl: (url) => {
        window.location.href = url;
      }
    });
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded-full bg-stone-700 px-4 py-2 font-semibold uppercase tracking-wide text-stone-100 transition-colors duration-300 hover:bg-stone-600 focus:bg-stone-600 focus:outline-none focus:ring focus:ring-stone-500 focus:ring-offset-2 sm:px-6 sm:py-3"
    >
      Log Out
    </button>
  );
}

export default LogoutButton;
