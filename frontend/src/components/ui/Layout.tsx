import { useState, type ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from './Button';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDevMode = import.meta.env.VITE_DISABLE_LOGIN === 'true';

  return (
    <div className={`min-h-screen bg-gray-50 ${isDevMode ? 'pt-12' : ''}`}>
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <a href="/games" className="text-lg font-bold text-gray-900">
            Portfolio Modeling Game
          </a>

          {isAuthenticated && user && (
            <>
              {/* Desktop nav */}
              <div className="hidden items-center gap-4 sm:flex">
                <span className="text-sm text-gray-600">{user.displayName}</span>
                <Button variant="ghost" size="sm" onClick={logout}>
                  Logout
                </Button>
              </div>

              {/* Mobile hamburger */}
              <button
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 sm:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </>
          )}
        </div>

        {/* Mobile dropdown */}
        {isAuthenticated && user && mobileMenuOpen && (
          <div className="border-t border-gray-100 px-4 py-3 sm:hidden">
            <div className="mb-2 text-sm text-gray-600">{user.displayName}</div>
            <Button variant="ghost" size="sm" onClick={logout} className="w-full justify-start">
              Logout
            </Button>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{children}</main>
    </div>
  );
}
