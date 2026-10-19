import Phaser from 'phaser';
import './styles/main.css';
import { config } from './game/config.js';
import BootScene from './game/scenes/BootScene.js';
import MenuScene from './game/scenes/MenuScene.js';
import RaceScene from './game/scenes/RaceScene.js';

new Phaser.Game({
  ...config,
  scene: [BootScene, MenuScene, RaceScene],
});
