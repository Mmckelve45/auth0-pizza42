/**
 * User Profile Display Component
 * Shows authenticated user info
 */

import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import { useAuthUser } from './useAuthHelpers';
import { getDisplayName } from '../../utils/userMetadata';

function UserProfile() {
  const { user } = useAuth0();
  const { emailVerified } = useAuthUser();

  if (!user) return null;

  const displayName = getDisplayName(user);

  return (
    <Link to="/profile" className="flex items-center gap-3 transition-opacity hover:opacity-80">
      {user.picture && (
        <img
          src={user.picture}
          alt={displayName}
          className="h-10 w-10 cursor-pointer rounded-full ring-2 ring-transparent transition-all hover:ring-yellow-400"
        />
      )}
      <div className="hidden sm:block">
        <p className="text-sm font-semibold text-stone-800">{displayName}</p>
        {emailVerified ? (
          <p className="text-xs text-green-600">✓ Verified</p>
        ) : (
          <p className="text-xs text-orange-600">⚠ Email not verified</p>
        )}
      </div>
    </Link>
  );
}

export default UserProfile;
