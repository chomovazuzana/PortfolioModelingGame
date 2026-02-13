import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';

export function LandingPage() {
  const { isAuthenticated, isLoading, login } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/games" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Portfolio Modeling Game
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          A competitive investment simulation where you allocate capital across
          5 asset classes over 4 historical years.
        </p>

        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
            How it works
          </h2>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                1
              </span>
              Start with EUR 100,000 in virtual capital
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                2
              </span>
              Allocate across Cash, Bonds, Equities, Commodities, and REITs
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                3
              </span>
              Navigate 4 years of real market conditions (2021-2024)
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                4
              </span>
              Compete for the highest portfolio value
            </li>
          </ul>
        </div>

        <Button size="lg" className="mt-8" onClick={login}>
          Login to Play
        </Button>
      </div>
    </div>
  );
}
