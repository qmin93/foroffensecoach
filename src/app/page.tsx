'use client';

import dynamic from 'next/dynamic';

// Dynamically import PlayEditor with SSR disabled (Konva requires browser APIs)
const PlayEditor = dynamic(
  () => import('@/components/editor/PlayEditor').then((mod) => mod.PlayEditor),
  { ssr: false }
);

export default function Home() {
  return <PlayEditor />;
}
