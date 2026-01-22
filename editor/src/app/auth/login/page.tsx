'use client';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore, selectIsAuthenticated } from '@/store/authStore';
import { AuthForm } from '@/components/auth/AuthForm';
import { AuthSkeleton } from '@/components/ui/Skeleton';

function LoginContent() {
  const router = useRouter();
  const { initialize, initialized, loading } = useAuthStore();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialize, initialized]);

  useEffect(() => {
    if (initialized && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [initialized, isAuthenticated, router]);

  if (!initialized || loading) {
    return <AuthSkeleton />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      {/* Logo/Brand */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
        <Link href="/" className="block text-center text-3xl font-bold text-foreground hover:text-muted-foreground transition-colors">
          ForOffenseCoach
        </Link>
        <p className="mt-2 text-center text-muted-foreground">
          Football playbook builder for coaches
        </p>
      </div>

      <AuthForm mode="login" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthSkeleton />}>
      <LoginContent />
    </Suspense>
  );
}
