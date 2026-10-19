import Phaser from 'phaser';

const palette = { ink: 0x090c12, panel: 0x121925, orange: 0xff6b35, cyan: 0x37e5dc, text: '#edf3ff', muted: '#8390a8' };

export default class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    this.cameras.main.setBackgroundColor(palette.ink);
    this.add.rectangle(0, 0, 3000, 3000, 0x090c12).setOrigin(0);
    for (let i = 0; i < 14; i += 1) {
      this.add.circle(Phaser.Math.Between(0, 1400), Phaser.Math.Between(0, 800), Phaser.Math.Between(1, 3), i % 3 === 0 ? palette.orange : 0x263248, 0.45);
    }
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x111827, 0.72).setOrigin(0);
    this.add.text(72, 58, 'DRIFT', { fontFamily: 'Barlow Condensed', fontSize: '88px', fontStyle: '800', color: palette.text, letterSpacing: 3 });
    this.add.text(76, 140, 'LEGENDS', { fontFamily: 'Barlow Condensed', fontSize: '88px', fontStyle: '800', color: '#ff6b35', letterSpacing: 7 });
    this.add.text(80, 236, 'ULTIMATE RACING', { fontFamily: 'DM Mono', fontSize: '14px', color: '#37e5dc', letterSpacing: 4 });

    const best = Number(localStorage.getItem('drift-legends-best') || 0);
    this.add.text(82, 340, 'NIGHT RUN // TOKYO DOCKS', { fontFamily: 'DM Mono', fontSize: '13px', color: palette.muted });
    this.add.text(80, 370, best ? `BEST SCORE  ${best.toLocaleString()}` : 'BEST SCORE  — — —', { fontFamily: 'DM Mono', fontSize: '15px', color: palette.text });
    const button = this.add.rectangle(144, 492, 280, 64, palette.orange).setInteractive({ useHandCursor: true });
    this.add.text(144, 492, 'START RACE  →', { fontFamily: 'Barlow Condensed', fontSize: '25px', fontStyle: '700', color: '#090c12' }).setOrigin(0.5);
    button.on('pointerover', () => button.setFillStyle(0xff895d));
    button.on('pointerout', () => button.setFillStyle(palette.orange));
    button.on('pointerdown', () => this.scene.start('RaceScene'));
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('RaceScene'));
    this.add.text(80, 622, 'WASD / ARROWS  DRIVE       SPACE  DRIFT       SHIFT  NITRO       ESC  PAUSE', {
      fontFamily: 'DM Mono', fontSize: '11px', color: palette.muted,
    });

    const car = this.add.graphics();
    car.fillStyle(0xff6b35).fillRoundedRect(0, 0, 184, 76, 18);
    car.fillStyle(0x172031).fillRoundedRect(40, 12, 104, 52, 14);
    car.fillStyle(0x67d7e3).fillRoundedRect(52, 18, 38, 40, 7);
    car.fillStyle(0x30546a).fillRoundedRect(94, 18, 38, 40, 7);
    car.fillStyle(0xffffff, .8).fillRect(10, 13, 14, 16).fillRect(10, 47, 14, 16);
    car.setPosition(Math.min(this.scale.width - 340, 740), 340).setAngle(-8);
    this.tweens.add({ targets: car, x: car.x + 12, duration: 1700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
  }
}
