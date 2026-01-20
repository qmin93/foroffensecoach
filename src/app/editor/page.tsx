'use client';

import dynamic from 'next/dynamic';

// Dynamically import PlayEditor with SSR disabled (Konva requires browser APIs)
const PlayEditor = dynamic(
  () => import('@/components/editor/PlayEditor').then((mod) => mod.PlayEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen bg-zinc-950">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading Editor...</p>
        </div>
      </div>
    ),
  }
);

export default function EditorPage() {
  return <PlayEditor />;
}
