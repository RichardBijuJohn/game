import Phaser from 'phaser';

const PHYSICS = {
  maxSpeed: 540,
  reverseSpeed: -150,
  acceleration: 420,
  reverseAcceleration: 230,
  braking: 620,
  rollingFriction: 95,
  normalGrip: 11,
  driftGrip: 2.4,
  steering: 2.7,
};

export default class Car {
  constructor(scene, x, y, color, isPlayer = false) {
    this.scene = scene;
    this.isPlayer = isPlayer;
    this.velocity = new Phaser.Math.Vector2();
    this.angle = -Math.PI / 2;
    this.speed = 0;
    this.progress = isPlayer ? 0.02 : Phaser.Math.FloatBetween(.08, .36);
    this.drifting = false;
    this.driftTime = 0;
    this.driftPoints = 0;
    this.comboMultiplier = 1;
    this.driftGrace = 0;
    this.sprite = scene.add.container(x, y).setDepth(isPlayer ? 12 : 10);

    const body = scene.add.graphics();
    body.fillStyle(color).fillRoundedRect(-26, -13, 52, 26, 7)
      .fillStyle(0x111823).fillRoundedRect(-8, -10, 22, 20, 5)
      .fillStyle(0xd7faff, .9).fillRect(17, -8, 5, 6).fillRect(17, 2, 5, 6)
      .fillStyle(0x090c12, .8).fillRect(-22, -17, 13, 5).fillRect(10, -17, 13, 5)
      .fillRect(-22, 12, 13, 5).fillRect(10, 12, 13, 5);
    this.sprite.add(body);
  }

  update(input, dt, track) {
    if (!this.isPlayer) {
      this.updateAi(dt, track);
      return;
    }

    const forward = new Phaser.Math.Vector2(Math.cos(this.angle), Math.sin(this.angle));
    const right = new Phaser.Math.Vector2(-forward.y, forward.x);
    const forwardSpeed = this.velocity.dot(forward);
    const lateralSpeed = this.velocity.dot(right);
    const steering = (input.left ? -1 : 0) + (input.right ? 1 : 0);
    const handbrake = input.drift && Math.abs(forwardSpeed) > 85;

    if (input.up) {
      const boostAcceleration = input.nitro ? 240 : 0;
      this.velocity.add(forward.clone().scale((PHYSICS.acceleration + boostAcceleration) * dt));
    } else if (input.down && forwardSpeed > 15) {
      this.velocity.add(forward.clone().scale(-PHYSICS.braking * dt));
    } else if (input.down) {
      this.velocity.add(forward.clone().scale(-PHYSICS.reverseAcceleration * dt));
    }

    const targetGrip = handbrake ? PHYSICS.driftGrip : PHYSICS.normalGrip;
    this.velocity.add(right.clone().scale(-lateralSpeed * Math.min(1, targetGrip * dt)));
    if (!input.up && !input.down) {
      this.velocity.add(this.velocity.clone().scale(-Math.min(1, PHYSICS.rollingFriction * dt / Math.max(100, this.velocity.length()))));
    }

    const speedRatio = Phaser.Math.Clamp(Math.abs(forwardSpeed) / PHYSICS.maxSpeed, 0, 1);
    const reverseDirection = forwardSpeed < -10 ? -1 : 1;
    this.angle += steering * PHYSICS.steering * (.22 + speedRatio * .95) * reverseDirection * (handbrake ? 1.25 : 1) * dt;
    this.velocity.limit(input.nitro && input.up ? 720 : PHYSICS.maxSpeed);
    if (this.velocity.dot(forward) < PHYSICS.reverseSpeed) {
      this.velocity = forward.clone().scale(PHYSICS.reverseSpeed).add(right.clone().scale(lateralSpeed));
    }

    this.sprite.x += this.velocity.x * dt;
    this.sprite.y += this.velocity.y * dt;
    this.speed = this.velocity.length();
    this.sprite.rotation = this.angle;
    this.resolveTrackCollision(track);
    this.updateDrift(handbrake, forwardSpeed, lateralSpeed, dt);

    if (input.nitro && input.up && forwardSpeed > 280) {
      this.scene.spawnBoost(this.sprite.x, this.sprite.y, this.angle);
    }
  }

  updateAi(dt, track) {
    this.progress = (this.progress + dt * .035) % 1;
    const target = track.getPoint(this.progress);
    const next = track.getPoint(this.progress + .01);
    this.angle = Phaser.Math.Angle.Between(target.x, target.y, next.x, next.y);
    this.sprite.x = Phaser.Math.Linear(this.sprite.x, target.x, .15);
    this.sprite.y = Phaser.Math.Linear(this.sprite.y, target.y, .15);
    this.sprite.rotation = this.angle;
    this.speed = 240;
  }

  resolveTrackCollision(track) {
    const nearest = track.getNearest(this.sprite.x, this.sprite.y);
    if (nearest.distance <= 49) return;

    const safePoint = track.points[nearest.index];
    const normal = new Phaser.Math.Vector2(safePoint.x - this.sprite.x, safePoint.y - this.sprite.y).normalize();
    this.sprite.x = safePoint.x - normal.x * 46;
    this.sprite.y = safePoint.y - normal.y * 46;
    const intoWall = this.velocity.dot(normal);
    if (intoWall > 0) {
      this.velocity.subtract(normal.clone().scale(intoWall * 1.45));
      this.velocity.scale(.42);
      this.scene.onMajorCollision();
    }
  }

  updateDrift(handbrake, forwardSpeed, lateralSpeed, dt) {
    const velocityAngle = this.velocity.length() > 10 ? this.velocity.angle() : this.angle;
    const driftAngle = Math.abs(Phaser.Math.Angle.Wrap(velocityAngle - this.angle));
    const isDrifting = handbrake && Math.abs(forwardSpeed) > 100 && driftAngle > Phaser.Math.DegToRad(7);

    if (isDrifting) {
      if (!this.drifting && this.driftGrace <= 0) this.comboMultiplier = 1;
      this.drifting = true;
      this.driftTime += dt;
      this.comboMultiplier = Math.min(5, this.comboMultiplier + dt * .18);
      this.driftPoints += Math.max(1, Math.abs(forwardSpeed) * Phaser.Math.RadToDeg(driftAngle) * .018) * dt;
      this.scene.handleDrift(this, driftAngle, lateralSpeed);
    } else if (this.drifting) {
      this.drifting = false;
      this.scene.finishDrift(this);
      this.driftGrace = 1.3;
    } else if (this.driftGrace > 0) {
      this.driftGrace -= dt;
    } else {
      this.comboMultiplier = 1;
    }
  }

  getRearTirePositions() {
    const rear = new Phaser.Math.Vector2(Math.cos(this.angle + Math.PI), Math.sin(this.angle + Math.PI));
    const side = new Phaser.Math.Vector2(-rear.y, rear.x);
    return [
      { x: this.sprite.x + rear.x * 17 + side.x * 10, y: this.sprite.y + rear.y * 17 + side.y * 10 },
      { x: this.sprite.x + rear.x * 17 - side.x * 10, y: this.sprite.y + rear.y * 17 - side.y * 10 },
    ];
  }

  reset(x, y, angle = -Math.PI / 2) {
    this.sprite.setPosition(x, y);
    this.angle = angle;
    this.velocity.set(0, 0);
    this.speed = 0;
    this.drifting = false;
    this.driftTime = 0;
    this.driftPoints = 0;
    this.comboMultiplier = 1;
  }
}
