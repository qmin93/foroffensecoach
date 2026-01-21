'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore, selectIsAuthenticated } from '@/store/authStore';

interface GlobalNavbarProps {
  variant?: 'default' | 'minimal';
}

export function GlobalNavbar({ variant = 'default' }: GlobalNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, signOut } = useAuthStore();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // Don't show navbar on auth pages
  if (pathname?.startsWith('/auth')) {
    return null;
  }

  // Minimal variant for editor pages
  if (variant === 'minimal') {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-900/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <Link
              href="/"
              className="text-lg font-bold text-white hover:text-zinc-300 transition-colors"
            >
              FOC
            </Link>
            <div className="flex items-center gap-3">
              {isAuthenticated && (
                <Link
                  href="/dashboard"
                  className="text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 bg-zinc-900/95 backdrop-blur border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-bold text-white hover:text-zinc-300 transition-colors"
          >
            FOC
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated && (
              <>
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/dashboard'
                      ? 'text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/editor"
                  className={`text-sm font-medium transition-colors ${
                    pathname?.startsWith('/editor')
                      ? 'text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Editor
                </Link>
                <Link
                  href="/team-profile"
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/team-profile'
                      ? 'text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Team Profile
                </Link>
              </>
            )}
            <Link
              href="/pricing"
              className={`text-sm font-medium transition-colors ${
                pathname === '/pricing'
                  ? 'text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Pricing
            </Link>
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="flex items-center gap-2 sm:gap-4">
            {isAuthenticated ? (
              <>
                <span className="hidden sm:inline text-sm text-zinc-400 truncate max-w-[150px]">
                  {profile?.display_name || profile?.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Navigation Links - Mobile */}
        {isAuthenticated && (
          <div className="md:hidden flex items-center gap-4 pb-3 overflow-x-auto">
            <Link
              href="/dashboard"
              className={`text-sm font-medium whitespace-nowrap transition-colors ${
                pathname === '/dashboard'
                  ? 'text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/editor"
              className={`text-sm font-medium whitespace-nowrap transition-colors ${
                pathname?.startsWith('/editor')
                  ? 'text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Editor
            </Link>
            <Link
              href="/team-profile"
              className={`text-sm font-medium whitespace-nowrap transition-colors ${
                pathname === '/team-profile'
                  ? 'text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Team
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
