/**
 * Passwordless Magic Link Login Component
 * Allows users to sign in with email magic link
 */

import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

function PasswordlessLogin() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState(null);
  const { loginWithRedirect } = useAuth0();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Use Auth0's Universal Login with passwordless connection
      // This properly handles session management and state
      await loginWithRedirect({
        authorizationParams: {
          connection: 'email',
          login_hint: email,
        },
      });
    } catch (err) {
      console.error('Passwordless error:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setEmailSent(false);
    setEmail('');
    setError(null);
  };

  if (emailSent) {
    return (
      <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <div className="mb-4 text-6xl">📧</div>
          <h2 className="mb-4 text-2xl font-semibold text-stone-800">
            Check your email!
          </h2>
          <p className="mb-6 text-stone-600">
            We sent a magic link to <strong>{email}</strong>. Click the link in the email to sign in.
          </p>
          <p className="mb-6 text-sm text-stone-500">
            The link will expire in 5 minutes.
          </p>
          <button
            onClick={handleBackToLogin}
            className="text-sm text-yellow-500 hover:text-yellow-600 focus:outline-none"
          >
            ← Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-lg">
      <div className="mb-6 text-center">
        <h2 className="mb-2 text-2xl font-semibold text-stone-800">
          Sign in with Magic Link
        </h2>
        <p className="text-sm text-stone-600">
          Enter your email to receive a sign-in link
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            disabled={isLoading}
            className="w-full rounded-full border border-stone-200 px-6 py-3 text-sm transition-all duration-300 placeholder:text-stone-400 focus:outline-none focus:ring focus:ring-yellow-400 disabled:bg-stone-100 disabled:cursor-not-allowed"
          />
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-full bg-yellow-400 px-6 py-3 font-semibold uppercase tracking-wide text-stone-800 transition-colors duration-300 hover:bg-yellow-300 focus:bg-yellow-300 focus:outline-none focus:ring focus:ring-yellow-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-stone-200"
        >
          {isLoading ? 'Sending...' : 'Send Magic Link'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => loginWithRedirect()}
          className="text-sm text-stone-600 hover:text-stone-800 focus:outline-none"
        >
          Use password instead
        </button>
      </div>
    </div>
  );
}

export default PasswordlessLogin;
