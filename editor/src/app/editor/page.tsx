'use client';

import dynamic from 'next/dynamic';
import { GlobalNavbar } from '@/components/layout/GlobalNavbar';
import { EditorSkeleton } from '@/components/ui/Skeleton';

// Dynamically import PlayEditor with SSR disabled (Konva requires browser APIs)
const PlayEditor = dynamic(
  () => import('@/components/editor/PlayEditor').then((mod) => mod.PlayEditor),
  {
    ssr: false,
    loading: () => <EditorSkeleton />,
  }
);

export default function EditorPage() {
  return (
    <div className="flex flex-col h-screen">
      <GlobalNavbar />
      <div className="flex-1 min-h-0">
        <PlayEditor />
      </div>
    </div>
  );
}
