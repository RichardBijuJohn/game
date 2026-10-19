import Phaser from 'phaser';

export class TrackSystem {
  constructor(scene) {
    this.scene = scene;
    this.points = [];
    const cx = 650, cy = 390;
    for (let i = 0; i < 96; i += 1) {
      const t = (i / 96) * Math.PI * 2;
      const radiusX = 380 + Math.sin(t * 3) * 38;
      const radiusY = 230 + Math.cos(t * 2) * 26;
      this.points.push({ x: cx + Math.cos(t) * radiusX, y: cy + Math.sin(t) * radiusY });
    }
    this.draw();
  }

  draw() {
    const g = this.scene.add.graphics();
    g.lineStyle(112, 0x080b10).strokePoints(this.points, true);
    g.lineStyle(98, 0x343945).strokePoints(this.points, true);
    g.lineStyle(3, 0x7b818d, 0.36).strokePoints(this.points, true);
    g.lineStyle(2, 0xc9ced6, 0.3).strokePoints(this.points, true);
    for (let i = 0; i < this.points.length; i += 4) {
      const p = this.points[i], next = this.points[(i + 1) % this.points.length];
      const angle = Phaser.Math.Angle.Between(p.x, p.y, next.x, next.y);
      const x = p.x - Math.cos(angle) * 47, y = p.y - Math.sin(angle) * 47;
      g.fillStyle(i % 8 < 4 ? 0xff6b35 : 0xf1f4f8).fillRect(x - 5, y - 12, 10, 24).setRotation(angle);
    }
    this.scene.add.text(650, 386, 'TOKYO\nDOCKS', { fontFamily: 'DM Mono', fontSize: '18px', color: '#657087', align: 'center', letterSpacing: 5 }).setOrigin(.5).setAlpha(.55);
    for (let i = 0; i < 32; i += 1) {
      const p = this.points[(i * 3 + 12) % this.points.length];
      this.scene.add.rectangle(p.x + Phaser.Math.Between(-80, 80), p.y + Phaser.Math.Between(-80, 80), Phaser.Math.Between(8, 28), Phaser.Math.Between(3, 7), 0x263143, .8).setRotation(Phaser.Math.FloatBetween(0, 3));
    }
  }

  getPoint(progress) { return this.points[Math.floor(progress * this.points.length) % this.points.length]; }
  getNearest(x, y) {
    let best = { index: 0, distance: Infinity };
    this.points.forEach((point, index) => { const distance = Phaser.Math.Distance.Between(x, y, point.x, point.y); if (distance < best.distance) best = { index, distance }; });
    return best;
  }
}
