/**
 * User Profile Display Component
 * Shows authenticated user info
 */

import { useAuth0 } from '@auth0/auth0-react';
import { useAuthUser } from './useAuthHelpers';

function UserProfile() {
  const { user } = useAuth0();
  const { emailVerified } = useAuthUser();

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      {user.picture && (
        <img
          src={user.picture}
          alt={user.name || 'User'}
          className="h-10 w-10 rounded-full"
        />
      )}
      <div className="hidden sm:block">
        <p className="text-sm font-semibold text-stone-800">{user.name || user.email}</p>
        {emailVerified ? (
          <p className="text-xs text-green-600">✓ Verified</p>
        ) : (
          <p className="text-xs text-orange-600">⚠ Email not verified</p>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
