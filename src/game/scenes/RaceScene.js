import Phaser from 'phaser';
import { TrackSystem } from '../systems/TrackSystem.js';
import Car from '../objects/Car.js';

export default class RaceScene extends Phaser.Scene {
  constructor() { super('RaceScene'); this.score = 0; this.elapsed = 0; this.paused = false; }

  create() {
    this.cameras.main.setBackgroundColor(0x0c1119);
    this.add.rectangle(0, 0, 1600, 900, 0x111924).setOrigin(0);
    this.track = new TrackSystem(this);
    this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE,SHIFT,ESC,R');
    this.player = new Car(this, 1030, 390, 0xff6b35, true);
    this.rivals = [
      new Car(this, 1000, 360, 0x37e5dc), new Car(this, 1030, 420, 0xb4c2d9),
      new Car(this, 970, 395, 0x9b6cff),
    ];
    this.createHud();
    this.input.keyboard.on('keydown-ESC', () => { this.paused = !this.paused; this.pauseText.setVisible(this.paused); });
    this.input.keyboard.on('keydown-R', () => { this.player.sprite.setPosition(1030, 390); this.player.angle = -Math.PI / 2; this.player.speed = 0; });
  }

  createHud() {
    this.add.rectangle(22, 20, 250, 92, 0x0a0e15, .86).setOrigin(0).setStrokeStyle(1, 0x2b394e);
    this.add.text(42, 34, 'SPEED', { fontFamily: 'DM Mono', fontSize: '11px', color: '#8390a8' });
    this.speedText = this.add.text(40, 51, '000', { fontFamily: 'Barlow Condensed', fontSize: '48px', fontStyle: '700', color: '#edf3ff' });
    this.add.text(124, 72, 'KM/H', { fontFamily: 'DM Mono', fontSize: '10px', color: '#37e5dc' });
    this.add.text(304, 28, 'DRIFT SCORE', { fontFamily: 'DM Mono', fontSize: '11px', color: '#8390a8' });
    this.scoreText = this.add.text(302, 48, '000000', { fontFamily: 'DM Mono', fontSize: '24px', color: '#ff6b35' });
    this.add.text(304, 84, 'TOKYO DOCKS  /  NIGHT RUN', { fontFamily: 'DM Mono', fontSize: '10px', color: '#657087' });
    this.add.text(1120, 28, 'RACE  01', { fontFamily: 'DM Mono', fontSize: '12px', color: '#37e5dc' });
    this.add.text(1120, 50, 'LAP  1 / 3', { fontFamily: 'DM Mono', fontSize: '12px', color: '#edf3ff' });
    this.pauseText = this.add.text(640, 315, 'PAUSED', { fontFamily: 'Barlow Condensed', fontSize: '58px', fontStyle: '700', color: '#edf3ff', stroke: '#090c12', strokeThickness: 8 }).setOrigin(.5).setVisible(false).setDepth(30);
    this.add.text(24, 680, 'WASD DRIVE   •   SPACE DRIFT   •   SHIFT NITRO   •   ESC PAUSE', { fontFamily: 'DM Mono', fontSize: '11px', color: '#7b879b' }).setDepth(20);
  }

  spawnSmoke(x, y) {
    const puff = this.add.circle(x - Phaser.Math.Between(-8, 8), y + Phaser.Math.Between(-8, 8), Phaser.Math.Between(4, 9), 0xc5d0d8, .35).setDepth(8);
    this.tweens.add({ targets: puff, alpha: 0, scale: 2.2, duration: 500, onComplete: () => puff.destroy() });
    this.score += 14;
  }
  spawnBoost(x, y, angle) {
    const flame = this.add.triangle(x - Math.cos(angle) * 28, y - Math.sin(angle) * 28, 0, 9, 32, 0, 32, 18, 0xffd166, .8).setRotation(angle).setDepth(9);
    this.tweens.add({ targets: flame, alpha: 0, scale: .3, duration: 180, onComplete: () => flame.destroy() });
  }

  update(_, delta) {
    if (this.paused) return;
    const dt = Math.min(delta / 1000, .04); this.elapsed += dt;
    const input = { up: this.keys.W.isDown || this.keys.UP.isDown, down: this.keys.S.isDown || this.keys.DOWN.isDown, left: this.keys.A.isDown || this.keys.LEFT.isDown, right: this.keys.D.isDown || this.keys.RIGHT.isDown, drift: this.keys.SPACE.isDown, nitro: this.keys.SHIFT.isDown };
    this.player.update(input, dt, this.track); this.rivals.forEach((car) => car.update({}, dt, this.track));
    this.speedText.setText(String(Math.round(Math.max(0, this.player.speed * .42))).padStart(3, '0'));
    this.scoreText.setText(String(Math.floor(this.score)).padStart(6, '0'));
    this.cameras.main.scrollX = Phaser.Math.Linear(this.cameras.main.scrollX, this.player.sprite.x - this.scale.width / 2, .04);
    this.cameras.main.scrollY = Phaser.Math.Linear(this.cameras.main.scrollY, this.player.sprite.y - this.scale.height / 2, .04);
    if (this.elapsed > 1 && this.player.speed > 120) this.score += dt * 3;
    const best = Number(localStorage.getItem('drift-legends-best') || 0);
    if (this.score > best) localStorage.setItem('drift-legends-best', String(Math.floor(this.score)));
  }
}
