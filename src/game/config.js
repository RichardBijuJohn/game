import Phaser from 'phaser';

export const config = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#090c12',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720,
  },
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: true,
  },
  physics: { default: 'arcade', arcade: { debug: false } },
};
