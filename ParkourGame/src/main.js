import { Game } from './game/Game.js';
import { UI } from './game/UI.js';
import { InputManager } from './input/InputManager.js';

const canvas = document.getElementById('gameCanvas');
const ui = new UI();
const input = new InputManager();

const game = new Game(canvas, ui, input);
game.start();

// 适配画布大小
function resizeCanvas() {
  const wrapper = document.getElementById('gameWrapper');
  const maxWidth = Math.min(wrapper.clientWidth, 820);
  const scale = maxWidth / 800;
  canvas.width = 800;
  canvas.height = 400;
  canvas.style.width = maxWidth + 'px';
  canvas.style.height = (400 * scale) + 'px';
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();