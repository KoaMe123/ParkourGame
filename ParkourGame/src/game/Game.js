import { STATE, GAME_WIDTH, GAME_HEIGHT, PLAYER_SCREEN_X, INITIAL_SCROLL_SPEED, MAX_SCROLL_SPEED, TOTAL_DISTANCE, GRAVITY } from '../config/constants.js';
import { Player } from './Player.js';
import { World } from './World.js';
import { checkCollisions } from './Collision.js';
import { Renderer } from './Renderer.js';
import { UI } from './UI.js';

export class Game {
  constructor(canvas, ui, inputManager) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ui = ui;
    this.input = inputManager;

    this.renderer = new Renderer(this.ctx);
    this.world = new World();
    this.player = new Player();

    this.state = STATE.READY;
    this.score = 0;
    this.cameraX = 0;
    this.scrollSpeed = INITIAL_SCROLL_SPEED;
    this.flagReached = false;

    this.particles = [];
    this.floatingTexts = [];

    this.lastTime = performance.now();
  }

  init() {
    this.world.generate();
    this.ui.updateScore(0);
    this.ui.updateProgress(0);
    this.ui.hideMessage();
    this.ui.showHint(true);
    this.ui.showMessage('🏃 丛林跑酷', '跳过障碍·踩死植物·收集金币·到达终点', false, false);
    setTimeout(() => {
      if (this.state === STATE.READY) this.ui.hideMessage();
    }, 2500);

    // 设置跳跃回调
    this.input.onJump(() => this.handleJump());
    this.input.init(this.canvas);

    // 重启按钮
    document.getElementById('btnRestart').addEventListener('click', () => this.resetGame());
  }

  handleJump() {
    if (this.state === STATE.READY) {
      this.startGame();
      return;
    }
    if (this.state === STATE.DEAD || this.state === STATE.WIN) {
      this.resetGame();
      return;
    }
    if (this.state !== STATE.PLAYING) return;

    const jumpType = this.player.jump();
    if (jumpType === 'first') {
      this.spawnParticles(this.player.worldX - this.cameraX, this.player.y + 48, 8, '#ffffff', 120);
    } else if (jumpType === 'double') {
      this.spawnParticles(this.player.worldX - this.cameraX, this.player.y + 24, 12, '#aaddff', 180);
    }
  }

  startGame() {
    this.state = STATE.PLAYING;
    this.ui.hideMessage();
    this.ui.showHint(true);
    this.lastTime = performance.now();
  }

  resetGame() {
    this.score = 0;
    this.cameraX = 0;
    this.scrollSpeed = INITIAL_SCROLL_SPEED;
    this.flagReached = false;
    this.player.reset();
    this.world.generate();
    this.particles = [];
    this.floatingTexts = [];
    this.state = STATE.PLAYING;
    this.ui.updateScore(0);
    this.ui.updateProgress(0);
    this.ui.hideMessage();
    this.ui.showHint(true);
    this.lastTime = performance.now();
  }

  addScore(amount, worldX, worldY) {
    this.score += amount;
    this.ui.updateScore(this.score);
    this.ui.pulseScore();
    this.floatingTexts.push({
      x: worldX - this.cameraX,
      y: worldY - 20,
      text: '+' + amount,
      life: 0.8,
      maxLife: 0.8,
      color: amount >= 15 ? '#ffdd57' : '#7bed9f'
    });
  }

  spawnParticles(x, y, count, color, spreadSpeed = 200) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * spreadSpeed;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 250,
        life: 0.4 + Math.random() * 0.5,
        maxLife: 0.9,
        color,
        size: 2 + Math.random() * 5
      });
    }
  }

  killPlayer(reason) {
    if (this.state !== STATE.PLAYING) return;
    this.state = STATE.DEAD;
    this.spawnParticles(this.player.worldX - this.cameraX, this.player.y + 24, 35, '#ff4444', 350);
    this.spawnParticles(this.player.worldX - this.cameraX, this.player.y + 24, 20, '#ff8888', 250);
    let title = '💀 游戏结束';
    let sub = '得分: ' + this.score;
    if (reason === 'pit') sub = '掉入深渊！得分: ' + this.score;
    else if (reason === 'monster') sub = '被怪物撞到了！得分: ' + this.score;
    else if (reason === 'plant_side') sub = '被植物刺伤了！得分: ' + this.score;
    else if (reason === 'fall') sub = '跳空了！得分: ' + this.score;
    this.ui.showMessage(title, sub, true, true);
  }

  winGame() {
    if (this.state !== STATE.PLAYING) return;
    this.state = STATE.WIN;
    this.flagReached = true;
    this.spawnParticles(this.player.worldX - this.cameraX, this.player.y, 50, '#ffdd57', 400);
    this.spawnParticles(this.player.worldX - this.cameraX, this.player.y, 30, '#7bed9f', 300);
    this.spawnParticles(this.player.worldX - this.cameraX, this.player.y, 20, '#ffffff', 200);
    this.ui.showMessage('🏆 恭喜通关！', '最终得分: ' + this.score + '  |  你太厉害了！', true, false);
  }

  update(deltaTime) {
    const dt = Math.min(deltaTime, 0.1);
    if (this.state !== STATE.PLAYING) {
      this.updateParticles(dt);
      this.updateFloatingTexts(dt);
      return;
    }

    // 滚动速度随进度增加
    const progressRatio = this.player.worldX / TOTAL_DISTANCE;
    this.scrollSpeed = INITIAL_SCROLL_SPEED + (MAX_SCROLL_SPEED - INITIAL_SCROLL_SPEED) * progressRatio;
    this.cameraX += this.scrollSpeed * dt;
    this.player.worldX = this.cameraX + PLAYER_SCREEN_X;

    // 更新玩家
    this.player.update(dt,
      (wx) => this.world.hasGroundAt(wx),
      (wx, fy) => this.world.hasPlatformAt(wx, fy),
      this.cameraX
    );

    // 硬币浮动动画
    for (const coin of this.world.coins) {
      coin.bobPhase += dt * 3;
    }

    // 碰撞检测
    const events = checkCollisions(this.player, this.world, this.cameraX, TOTAL_DISTANCE, this.flagReached);
    for (const evt of events) {
      switch (evt.type) {
        case 'win':
          this.winGame();
          return;
        case 'fall':
          this.killPlayer('fall');
          return;
        case 'pit':
          this.killPlayer('pit');
          return;
        case 'monster':
          this.killPlayer('monster');
          return;
        case 'plant_side':
          this.killPlayer('plant_side');
          return;
        case 'plant_kill':
          this.addScore(20, evt.worldX, evt.worldY);
          this.spawnParticles(evt.worldX - this.cameraX, evt.worldY, 18, '#4ecb71', 220);
          this.spawnParticles(evt.worldX - this.cameraX, evt.worldY, 8, '#7bed9f', 150);
          this.player.vy = -180;
          this.player.isGrounded = false;
          this.player.y = evt.worldY - 48;
          break;
        case 'coin':
          this.addScore(15, evt.worldX, evt.worldY);
          this.spawnParticles(evt.worldX - this.cameraX, evt.worldY, 12, '#ffdd57', 180);
          this.spawnParticles(evt.worldX - this.cameraX, evt.worldY, 6, '#ffffff', 120);
          break;
      }
    }

    this.updateParticles(dt);
    this.updateFloatingTexts(dt);

    // 更新 UI 进度
    this.ui.updateProgress(this.player.worldX / TOTAL_DISTANCE);
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) { this.particles.splice(i, 1); continue; }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += GRAVITY * 0.5 * dt;
    }
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      if (ft.life <= 0) { this.floatingTexts.splice(i, 1); continue; }
      ft.y -= 60 * dt;
    }
  }

  updateFloatingTexts(dt) {
    // 已合并到 updateParticles 中
  }

  render() {
    this.renderer.clear();
    this.renderer.drawSky();
    this.renderer.drawMountains(this.cameraX);
    this.renderer.drawClouds(this.cameraX);
    this.renderer.drawBackgroundTrees(this.cameraX);
    this.renderer.drawPlatforms(this.world.platforms, this.cameraX);
    this.renderer.drawGround(this.cameraX, this.world);
    this.renderer.drawPits(this.world.pits, this.cameraX);

    // 金币
    for (const coin of this.world.coins) {
      if (coin.collected) continue;
      this.renderer.drawCoin(coin, this.cameraX);
    }

    // 障碍物
    for (const obs of this.world.obstacles) {
      if (!obs.alive) continue;
      if (obs.type === 'monster') this.renderer.drawMonster(obs, this.cameraX);
      else if (obs.type === 'plant') this.renderer.drawPlant(obs, this.cameraX);
    }

    // 旗子
    this.renderer.drawFlag(TOTAL_DISTANCE - this.cameraX);

    // 玩家拖尾
    for (const trail of this.player.trailPositions) {
      const alpha = trail.life / 0.25;
      this.ctx.fillStyle = `rgba(100,180,255,${alpha * 0.4})`;
      this.ctx.beginPath();
      this.ctx.arc(trail.x, trail.y, 8 + (1 - alpha) * 10, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.renderer.drawPlayer(this.player, this.cameraX);
    this.renderer.drawParticles(this.particles);
    this.renderer.drawFloatingTexts(this.floatingTexts);

    // 准备状态叠加
    if (this.state === STATE.READY) {
      this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
      this.ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = 'bold 28px "PingFang SC","Microsoft YaHei",sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('🏃 准备冒险！', GAME_WIDTH/2, GAME_HEIGHT/2 - 10);
      this.ctx.font = '16px sans-serif';
      this.ctx.fillText('按空格键或点击屏幕开始', GAME_WIDTH/2, GAME_HEIGHT/2 + 30);
    }
  }

  gameLoop(currentTime) {
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    if (deltaTime > 0.15) deltaTime = 0.15;
    this.update(deltaTime);
    this.render();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  start() {
    this.init();
    requestAnimationFrame((t) => this.gameLoop(t));
  }
}