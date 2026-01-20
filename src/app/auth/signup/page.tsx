'use client';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, selectIsAuthenticated } from '@/store/authStore';
import { AuthForm } from '@/components/auth/AuthForm';

function SignupContent() {
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-zinc-900">
      {/* Logo/Brand */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
        <h1 className="text-center text-3xl font-bold text-white">
          ForOffenseCoach
        </h1>
        <p className="mt-2 text-center text-zinc-400">
          Create your account to start building playbooks
        </p>
      </div>

      <AuthForm mode="signup" />
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-900">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
