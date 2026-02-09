'use client';

import * as Phaser from 'phaser';
import { useEffect, useRef } from 'react';
import { createGameConfig } from './config';
import { PreloadScene } from './scenes/PreloadScene';
import { OfficeScene } from './scenes/OfficeScene';

export default function PhaserGame() {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !gameRef.current) {
      const config = createGameConfig('game-container', [
        PreloadScene,
        OfficeScene,
      ]);

      gameRef.current = new Phaser.Game(config);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return <div id="game-container" className="w-full h-full" />;
}
