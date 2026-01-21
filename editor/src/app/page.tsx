'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const handleGetStarted = () => {
    router.push('/editor');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-2xl">🏈</span>
              <span className="font-bold text-xl">ForOffenseCoach</span>
            </Link>
            <nav className="flex items-center gap-4">
              {user ? (
                <>
                  <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
                    Dashboard
                  </Link>
                  <Button onClick={() => router.push('/editor')} size="sm">
                    Open Editor
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="text-zinc-400 hover:text-white transition-colors">
                    Login
                  </Link>
                  <Button onClick={() => router.push('/auth/signup')} size="sm">
                    Sign Up Free
                  </Button>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Build Your Playbook
            <span className="block text-green-500">In Minutes</span>
          </h1>
          <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
            The simplest way to create, organize, and share football plays.
            Formation presets, smart recommendations, and easy export.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6"
            >
              Start Building Free
            </Button>
            <Button
              onClick={() => router.push(user ? '/dashboard?quickstart=true' : '/auth/signup?redirect=/dashboard?quickstart=true')}
              size="lg"
              variant="outline"
              className="border-blue-500 text-blue-400 hover:bg-blue-500/10 text-lg px-8 py-6"
            >
              <span className="mr-2">⚡</span>
              Quick Start
            </Button>
          </div>
          <p className="text-sm text-zinc-500 mt-4">
            Quick Start: Select formations and auto-generate 30 plays instantly
          </p>
        </div>
      </section>

      {/* Demo Preview */}
      <section className="py-16 px-4 bg-zinc-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-xl border border-zinc-800 overflow-hidden shadow-2xl">
            <div className="bg-zinc-800 px-4 py-2 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="ml-4 text-zinc-400 text-sm">ForOffenseCoach Editor</span>
            </div>
            <div className="aspect-video bg-zinc-900 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🏈</div>
                <p className="text-zinc-500">Interactive Playbook Editor</p>
                <Button
                  onClick={() => router.push('/editor')}
                  className="mt-4"
                  variant="outline"
                >
                  Open Editor
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
              <div className="w-12 h-12 rounded-lg bg-green-600/20 flex items-center justify-center text-2xl mb-4">
                📋
              </div>
              <h3 className="text-xl font-semibold mb-2">Formation Presets</h3>
              <p className="text-zinc-400">
                Start with I Formation, Shotgun, Spread, or create your own custom formations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
              <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center text-2xl mb-4">
                💡
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Recommendations</h3>
              <p className="text-zinc-400">
                Get concept suggestions based on your formation. 20+ pass and run concepts.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
              <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center text-2xl mb-4">
                ✏️
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Drawing Tools</h3>
              <p className="text-zinc-400">
                Draw routes, blocks, and motions with straight or curved lines. Full customization.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
              <div className="w-12 h-12 rounded-lg bg-orange-600/20 flex items-center justify-center text-2xl mb-4">
                📄
              </div>
              <h3 className="text-xl font-semibold mb-2">Export to PDF/PNG</h3>
              <p className="text-zinc-400">
                Generate print-ready playbooks or share individual plays as images.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
              <div className="w-12 h-12 rounded-lg bg-red-600/20 flex items-center justify-center text-2xl mb-4">
                🔗
              </div>
              <h3 className="text-xl font-semibold mb-2">Share & Collaborate</h3>
              <p className="text-zinc-400">
                Create shareable links. Let your team view or fork your plays.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
              <div className="w-12 h-12 rounded-lg bg-cyan-600/20 flex items-center justify-center text-2xl mb-4">
                📚
              </div>
              <h3 className="text-xl font-semibold mb-2">Organize Playbooks</h3>
              <p className="text-zinc-400">
                Create sections for Run, Pass, RPO, and Special teams. Search and filter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-zinc-950 to-zinc-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Build Your Playbook?</h2>
          <p className="text-zinc-400 mb-8">
            Join coaches from youth leagues to varsity teams who trust ForOffenseCoach.
          </p>
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-xl">🏈</span>
              <span className="font-semibold">ForOffenseCoach</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm text-zinc-400">
              <Link href="/pricing" className="hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="/editor" className="hover:text-white transition-colors">
                Editor
              </Link>
              {user && (
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
              )}
            </nav>
            <p className="text-sm text-zinc-500">
              © {new Date().getFullYear()} ForOffenseCoach. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
