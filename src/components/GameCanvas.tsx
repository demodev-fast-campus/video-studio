'use client';

import dynamic from 'next/dynamic';

const PhaserGame = dynamic(() => import('@/game/main'), {
  ssr: false,
  loading: () => (
    <div className="w-[900px] h-[550px] bg-gradient-to-b from-[#c8dbe8] to-[#a8c8d8] flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4 bounce">🏢</div>
        <div className="text-[#4a90d9] text-lg font-bold">LOADING OFFICE...</div>
        <div className="mt-4 w-48 h-4 bg-white/50 border-2 border-[#888] mx-auto">
          <div className="h-full bg-[#4a90d9] animate-pulse" style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  ),
});

export default function GameCanvas() {
  return (
    <div className="w-[900px] h-[550px] overflow-hidden">
      <PhaserGame />
    </div>
  );
}
