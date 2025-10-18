/**
 * Login Button Component
 * Shows auth options for Pizza42
 */

import { useAuth0 } from '@auth0/auth0-react';

function LoginButton() {
  const { loginWithRedirect } = useAuth0();

  const handleLogin = () => {
    loginWithRedirect();
  };

  const handleGoogleLogin = () => {
    loginWithRedirect({
      authorizationParams: {
        connection: 'google-oauth2',
      },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
      {/* Google Social Login */}
      <button
        onClick={handleGoogleLogin}
        className="rounded-full bg-white px-6 py-3 font-semibold uppercase tracking-wide text-stone-800 shadow-md transition-colors duration-300 hover:bg-stone-50 focus:outline-none focus:ring focus:ring-stone-300 focus:ring-offset-2 disabled:cursor-not-allowed sm:px-8 sm:py-4"
      >
        Google
      </button>

      {/* Email/Password Login */}
      <button
        onClick={handleLogin}
        className="rounded-full bg-yellow-400 px-6 py-3 font-semibold uppercase tracking-wide text-stone-800 transition-colors duration-300 hover:bg-yellow-300 focus:bg-yellow-300 focus:outline-none focus:ring focus:ring-yellow-300 focus:ring-offset-2 disabled:cursor-not-allowed sm:px-8 sm:py-4"
      >
        Login
      </button>
    </div>
  );
}

export default LoginButton;
