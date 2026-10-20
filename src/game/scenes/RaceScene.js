import Phaser from 'phaser';
import { TrackSystem } from '../systems/TrackSystem.js';
import Car from '../objects/Car.js';
import HUD from '../ui/HUD.js';

export default class RaceScene extends Phaser.Scene {
  constructor() {
    super('RaceScene');
    this.score = 0;
    this.elapsed = 0;
    this.paused = false;
    this.skidMarks = [];
  }

  create() {
    this.cameras.main.setBackgroundColor(0x0c1119);
    this.add.rectangle(0, 0, 1600, 900, 0x111924).setOrigin(0);
    this.track = new TrackSystem(this);
    this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE,SHIFT,ESC,R');

    const start = this.track.getPoint(.02);
    const next = this.track.getPoint(.03);
    const startAngle = Phaser.Math.Angle.Between(start.x, start.y, next.x, next.y);
    this.player = new Car(this, start.x, start.y, 0xff6b35, true);
    this.player.angle = startAngle;
    this.rivals = [
      new Car(this, this.track.getPoint(.08).x, this.track.getPoint(.08).y, 0x37e5dc),
      new Car(this, this.track.getPoint(.14).x, this.track.getPoint(.14).y, 0xb4c2d9),
      new Car(this, this.track.getPoint(.2).x, this.track.getPoint(.2).y, 0x9b6cff),
    ];
    this.hud = new HUD(this);
    this.input.keyboard.on('keydown-ESC', () => {
      this.paused = !this.paused;
      this.hud.setPaused(this.paused);
    });
    this.input.keyboard.on('keydown-R', () => this.player.reset(start.x, start.y, startAngle));
  }

  spawnSmoke(x, y) {
    const puff = this.add.circle(x, y, Phaser.Math.Between(4, 8), 0xc5d0d8, .32).setDepth(8);
    this.tweens.add({ targets: puff, alpha: 0, scale: 2.2, duration: 430, onComplete: () => puff.destroy() });
  }

  spawnSkidMarks(car) {
    car.getRearTirePositions().forEach((tire) => {
      const mark = this.add.rectangle(tire.x, tire.y, 4, 13, 0x11151d, .55).setRotation(car.angle).setDepth(7);
      this.skidMarks.push(mark);
      if (this.skidMarks.length > 130) this.skidMarks.shift().destroy();
    });
  }

  spawnBoost(x, y, angle) {
    const flame = this.add.triangle(x - Math.cos(angle) * 28, y - Math.sin(angle) * 28, 0, 9, 32, 0, 32, 18, 0xffd166, .8).setRotation(angle).setDepth(9);
    this.tweens.add({ targets: flame, alpha: 0, scale: .3, duration: 180, onComplete: () => flame.destroy() });
  }

  handleDrift(car, driftAngle, lateralSpeed) {
    this.spawnSmoke(car.sprite.x, car.sprite.y);
    this.spawnSkidMarks(car);
    this.score += Math.max(1, Math.abs(lateralSpeed) * Phaser.Math.RadToDeg(driftAngle) * .012) * car.comboMultiplier;
    if (car.driftTime > .18 && Math.floor(car.driftTime * 10) % 8 === 0) {
      const label = car.driftTime > 2.2 ? 'PERFECT DRIFT' : car.driftTime > 1.1 ? 'GREAT DRIFT' : 'NICE DRIFT';
      this.hud.showNotification(label);
    }
  }

  finishDrift(car) {
    if (car.driftTime < .22) {
      car.comboMultiplier = 1;
      car.driftTime = 0;
      car.driftPoints = 0;
      return;
    }
    this.score += car.driftPoints * car.comboMultiplier;
    this.hud.showNotification(car.comboMultiplier >= 2.5 ? 'PERFECT DRIFT' : car.comboMultiplier >= 1.5 ? 'GREAT DRIFT' : 'NICE DRIFT');
    car.driftTime = 0;
    car.driftPoints = 0;
  }

  onMajorCollision() {
    this.player.comboMultiplier = 1;
    this.player.driftGrace = 0;
    this.hud.showNotification('COMBO LOST');
  }

  update(_, delta) {
    if (this.paused) return;
    const dt = Math.min(delta / 1000, .04);
    this.elapsed += dt;
    const input = {
      up: this.keys.W.isDown || this.keys.UP.isDown,
      down: this.keys.S.isDown || this.keys.DOWN.isDown,
      left: this.keys.A.isDown || this.keys.LEFT.isDown,
      right: this.keys.D.isDown || this.keys.RIGHT.isDown,
      drift: this.keys.SPACE.isDown,
      nitro: this.keys.SHIFT.isDown,
    };
    this.player.update(input, dt, this.track);
    this.rivals.forEach((car) => car.update({}, dt, this.track));
    this.hud.update(this.player, this.score);
    this.cameras.main.scrollX = Phaser.Math.Linear(this.cameras.main.scrollX, this.player.sprite.x - this.scale.width / 2, .04);
    this.cameras.main.scrollY = Phaser.Math.Linear(this.cameras.main.scrollY, this.player.sprite.y - this.scale.height / 2, .04);
    if (this.elapsed > 1 && this.player.speed > 120) this.score += dt * 3;
    const best = Number(localStorage.getItem('drift-legends-best') || 0);
    if (this.score > best) localStorage.setItem('drift-legends-best', String(Math.floor(this.score)));
  }
}
