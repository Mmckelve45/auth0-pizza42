import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "../features/auth/LoginButton";
import Button from "./Button";

function Home() {
  const { isAuthenticated, isLoading, user, loginWithRedirect } = useAuth0();

  const handleSignUp = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup',
      },
    });
  };

  const handleEmailLogin = () => {
    loginWithRedirect({
      authorizationParams: {
        connection: 'email',
      },
    });
  };

  const handleEmployeeLogin = () => {
    loginWithRedirect({
      authorizationParams: {
        connection: 'mckelvey-server',
      },
    });
  };

  return (
    <div className="my-10 px-4 text-center sm:my-16">
      <h1 className="mb-8 text-xl font-semibold md:text-3xl">
        The best pizza.
        <br />
        <span className="text-yellow-500">
          Straight out of the oven, straight to you.
        </span>
      </h1>

      {isLoading ? (
        <p className="text-stone-600">Loading...</p>
      ) : isAuthenticated ? (
        <div className="space-y-4">
          <p className="text-lg text-stone-700">
            👋 Welcome back, {user?.name || user?.email}!
          </p>
          <Button to="/menu" type="primary">
            Start Ordering
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          <p className="text-lg text-stone-700">
            Welcome! 👋
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            {/* Email Passwordless Login */}
            <button
              onClick={handleEmailLogin}
              className="rounded-full bg-yellow-400 px-6 py-3 font-semibold uppercase tracking-wide text-stone-800 transition-colors duration-300 hover:bg-yellow-300 focus:bg-yellow-300 focus:outline-none focus:ring focus:ring-yellow-300 focus:ring-offset-2 disabled:cursor-not-allowed sm:px-8 sm:py-4"
            >
              Email
            </button>

            <LoginButton />
          </div>

          <p className="text-center text-sm text-stone-600">
            {"Don't have an account?"}{" "}
            <button
              onClick={handleSignUp}
              className="font-semibold text-yellow-500 hover:text-yellow-600 focus:outline-none"
            >
              Sign up
            </button>
          </p>

          {/* Divider */}
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-20 bg-stone-300"></div>
            <span className="text-xs text-stone-400">OR</span>
            <div className="h-px w-20 bg-stone-300"></div>
          </div>

          {/* Employee Login - On-Prem AD */}
          <button
            onClick={handleEmployeeLogin}
            className="text-sm text-stone-500 hover:text-stone-700 underline focus:outline-none"
          >
            Employee Login (On-Prem AD)
          </button>
        </div>
      )}
    </div>
  );
}

export default Home;
