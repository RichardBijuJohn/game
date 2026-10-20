export default class HUD {
  constructor(scene) {
    this.scene = scene;
    const elements = [];
    elements.push(scene.add.rectangle(22, 20, 250, 92, 0x0a0e15, .86).setOrigin(0).setStrokeStyle(1, 0x2b394e));
    elements.push(scene.add.text(42, 34, 'SPEED', { fontFamily: 'DM Mono', fontSize: '11px', color: '#8390a8' }));
    this.speedText = scene.add.text(40, 51, '000', { fontFamily: 'Barlow Condensed', fontSize: '48px', fontStyle: '700', color: '#edf3ff' });
    elements.push(this.speedText);
    elements.push(scene.add.text(124, 72, 'KM/H', { fontFamily: 'DM Mono', fontSize: '10px', color: '#37e5dc' }));
    elements.push(scene.add.text(304, 28, 'DRIFT SCORE', { fontFamily: 'DM Mono', fontSize: '11px', color: '#8390a8' }));
    this.scoreText = scene.add.text(302, 48, '000000', { fontFamily: 'DM Mono', fontSize: '24px', color: '#ff6b35' });
    elements.push(this.scoreText);
    this.comboText = scene.add.text(302, 78, '', { fontFamily: 'DM Mono', fontSize: '12px', color: '#ffd166' });
    elements.push(this.comboText);
    elements.push(scene.add.text(304, 101, 'TOKYO DOCKS  /  NIGHT RUN', { fontFamily: 'DM Mono', fontSize: '10px', color: '#657087' }));
    elements.push(scene.add.text(1120, 28, 'RACE  01', { fontFamily: 'DM Mono', fontSize: '12px', color: '#37e5dc' }));
    elements.push(scene.add.text(1120, 50, 'LAP  1 / 3', { fontFamily: 'DM Mono', fontSize: '12px', color: '#edf3ff' }));
    this.notification = scene.add.text(640, 250, '', { fontFamily: 'Barlow Condensed', fontSize: '32px', fontStyle: '700', color: '#ff6b35', stroke: '#090c12', strokeThickness: 7 }).setOrigin(.5);
    this.pauseText = scene.add.text(640, 315, 'PAUSED', { fontFamily: 'Barlow Condensed', fontSize: '58px', fontStyle: '700', color: '#edf3ff', stroke: '#090c12', strokeThickness: 8 }).setOrigin(.5).setVisible(false);
    elements.push(this.notification, this.pauseText);
    elements.push(scene.add.text(24, 680, 'WASD DRIVE   •   SPACE DRIFT   •   SHIFT NITRO   •   ESC PAUSE', { fontFamily: 'DM Mono', fontSize: '11px', color: '#7b879b' }));
    elements.forEach((element) => element.setScrollFactor(0).setDepth(20));
  }

  update(car, score) {
    this.speedText.setText(String(Math.round(car.speed * .42)).padStart(3, '0'));
    this.scoreText.setText(String(Math.floor(score)).padStart(6, '0'));
    this.comboText.setText(car.drifting ? `x${car.comboMultiplier.toFixed(1)} COMBO` : '');
  }

  showNotification(text) {
    this.notification.setText(text).setAlpha(1).setScale(.8);
    this.scene.tweens.add({ targets: this.notification, scale: 1, duration: 140, yoyo: true, hold: 550, onComplete: () => this.notification.setAlpha(0) });
  }

  setPaused(value) { this.pauseText.setVisible(value); }
}
