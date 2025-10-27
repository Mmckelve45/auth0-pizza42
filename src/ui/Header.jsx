import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import SearchOrder from "../features/order/SearchOrder";
import Username from "../features/user/Username";
import UserProfile from "../features/auth/UserProfile";
import LogoutButton from "../features/auth/LogoutButton";

// Separate component with key to force re-render on user change
function UserProfileSection() {
  const { user } = useAuth0();

  return (
    <div key={user?.sub} className="flex items-center gap-4">
      <UserProfile />
      <LogoutButton />
    </div>
  );
}

export default function Header() {
  const { isAuthenticated, isLoading } = useAuth0();

  return (
    <header
      className="flex items-center justify-between
    border-b border-stone-500 bg-yellow-400 px-4 py-3
    uppercase sm:px-6 font-pizza "
    >
      <Link to="/" className="tracking-widest">
        Pizza 42
      </Link>
      <SearchOrder />

      {/* Show Auth0 profile when authenticated, otherwise Username */}
      {isLoading ? (
        <div className="text-sm">Loading...</div>
      ) : isAuthenticated ? (
        <UserProfileSection />
      ) : (
        <Username />
      )}
    </header>
  );
}
