import * as Phaser from 'phaser';

export const GAME_CONFIG = {
  width: 900,
  height: 550,
  tileSize: 32,
  agentSize: 40,
};

export const createGameConfig = (
  parent: string,
  scenes: Phaser.Types.Scenes.SceneType[]
): Phaser.Types.Core.GameConfig => ({
  type: Phaser.AUTO,
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
  parent,
  backgroundColor: '#8b7355',
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  render: {
    pixelArt: true,
    antialias: false,
  },
  scene: scenes,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});
