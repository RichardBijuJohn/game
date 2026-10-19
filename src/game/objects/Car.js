import Phaser from 'phaser';

export default class Car {
  constructor(scene, x, y, color, isPlayer = false) {
    this.scene = scene; this.isPlayer = isPlayer; this.speed = 0; this.angle = -Math.PI / 2; this.progress = isPlayer ? 0.02 : Phaser.Math.FloatBetween(.08, .36);
    this.sprite = scene.add.container(x, y);
    const body = scene.add.graphics();
    body.fillStyle(color).fillRoundedRect(-26, -13, 52, 26, 7).fillStyle(0x111823).fillRoundedRect(-8, -10, 22, 20, 5);
    body.fillStyle(0xd7faff, .9).fillRect(17, -8, 5, 6).fillRect(17, 2, 5, 6);
    body.fillStyle(0x090c12, .8).fillRect(-22, -17, 13, 5).fillRect(10, -17, 13, 5).fillRect(-22, 12, 13, 5).fillRect(10, 12, 13, 5);
    this.sprite.add(body); this.sprite.setDepth(isPlayer ? 12 : 10);
    this.smoke = [];
  }

  update(input, dt, track) {
    if (this.isPlayer) {
      const accelerating = input.up, braking = input.down, drifting = input.drift;
      if (accelerating) this.speed += (input.nitro ? 460 : 300) * dt;
      else this.speed -= 170 * dt;
      if (braking) this.speed -= 420 * dt;
      this.speed = Phaser.Math.Clamp(this.speed, -90, input.nitro && accelerating ? 720 : 480);
      const steering = (input.left ? -1 : 0) + (input.right ? 1 : 0);
      this.angle += steering * (drifting ? 2.2 : 1.5) * dt * Phaser.Math.Clamp(Math.abs(this.speed) / 130, .25, 1.4);
      if (drifting && Math.abs(this.speed) > 180) this.scene.spawnSmoke(this.sprite.x, this.sprite.y);
      if (input.nitro && accelerating && this.speed > 280) this.scene.spawnBoost(this.sprite.x, this.sprite.y, this.angle);
    } else {
      this.progress = (this.progress + dt * (.035 + (this.sprite.x % 3) * .002)) % 1;
      const target = track.getPoint(this.progress), next = track.getPoint(this.progress + .01);
      this.angle = Phaser.Math.Angle.Between(target.x, target.y, next.x, next.y);
      this.sprite.x = Phaser.Math.Linear(this.sprite.x, target.x, .15);
      this.sprite.y = Phaser.Math.Linear(this.sprite.y, target.y, .15);
      this.speed = 240;
    }
    if (this.isPlayer) {
      this.sprite.x += Math.cos(this.angle) * this.speed * dt;
      this.sprite.y += Math.sin(this.angle) * this.speed * dt;
      const nearest = track.getNearest(this.sprite.x, this.sprite.y);
      if (nearest.distance > 58) this.speed *= .97;
      this.sprite.x = Phaser.Math.Clamp(this.sprite.x, 35, 1265); this.sprite.y = Phaser.Math.Clamp(this.sprite.y, 30, 730);
    }
    this.sprite.rotation = this.angle;
  }
}
