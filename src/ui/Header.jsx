import { Link, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import SearchOrder from "../features/order/SearchOrder";
import Username from "../features/user/Username";
import UserProfile from "../features/auth/UserProfile";
import LogoutButton from "../features/auth/LogoutButton";
import { useIsEmployee } from "../features/auth/useAuthHelpers";

// Separate component with key to force re-render on user change
function UserProfileSection() {
  const { user } = useAuth0();
  const isEmployee = useIsEmployee();
  const location = useLocation();
  const isOnEmployeePage = location.pathname === '/employee';

  return (
    <div key={user?.sub} className="flex items-center gap-4">
      {isEmployee && (
        <Link
          to={isOnEmployeePage ? "/" : "/employee"}
          className="rounded-full bg-stone-700 px-4 py-2 font-semibold uppercase tracking-wide text-yellow-400 transition-colors duration-300 hover:bg-stone-600 focus:bg-stone-600 focus:outline-none focus:ring focus:ring-stone-500 focus:ring-offset-2 sm:px-6 sm:py-3"
        >
          {isOnEmployeePage ? "Main App" : "Employee Portal"}
        </Link>
      )}
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
