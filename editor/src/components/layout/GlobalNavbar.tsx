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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <Link
              href="/"
              className="text-lg font-bold text-foreground hover:text-muted-foreground transition-colors"
            >
              FOC
            </Link>
            <div className="flex items-center gap-3">
              {isAuthenticated && (
                <Link
                  href="/dashboard"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-bold text-foreground hover:text-muted-foreground transition-colors"
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
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/editor"
                  className={`text-sm font-medium transition-colors ${
                    pathname?.startsWith('/editor')
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Editor
                </Link>
                <Link
                  href="/team-profile"
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/team-profile'
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
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
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Pricing
            </Link>
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="flex items-center gap-2 sm:gap-4">
            {isAuthenticated ? (
              <>
                <span className="hidden sm:inline text-sm text-muted-foreground truncate max-w-[150px]">
                  {profile?.display_name || profile?.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg transition-colors"
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
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/editor"
              className={`text-sm font-medium whitespace-nowrap transition-colors ${
                pathname?.startsWith('/editor')
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Editor
            </Link>
            <Link
              href="/team-profile"
              className={`text-sm font-medium whitespace-nowrap transition-colors ${
                pathname === '/team-profile'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
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
