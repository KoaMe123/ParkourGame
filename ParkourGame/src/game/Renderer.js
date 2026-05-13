import { GAME_WIDTH, GAME_HEIGHT, GROUND_Y, PLAYER_WIDTH, PLAYER_HEIGHT, TOTAL_DISTANCE } from '../config/constants.js';
import { Player } from './Player.js';

export class Renderer {
  constructor(ctx) {
    this.ctx = ctx;
  }

  clear() {
    this.ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  drawSky() {
    const skyGrad = this.ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    skyGrad.addColorStop(0, '#87CEEB');
    skyGrad.addColorStop(0.6, '#b8e4f0');
    skyGrad.addColorStop(1, '#d4eef7');
    this.ctx.fillStyle = skyGrad;
    this.ctx.fillRect(0, 0, GAME_WIDTH, GROUND_Y);
  }

  drawMountains(cameraX) {
    const ctx = this.ctx;
    ctx.fillStyle = '#8bbd8b';
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    const points = [
      { x: 0, h: 80 }, { x: 180, h: 140 }, { x: 350, h: 90 },
      { x: 500, h: 160 }, { x: 680, h: 100 }, { x: 850, h: 130 }, { x: 1000, h: 70 }
    ];
    for (const pt of points) {
      const sx = pt.x - (cameraX * 0.15 % 1000);
      const drawX = sx < -200 ? sx + 1000 : sx;
      ctx.lineTo(drawX, GROUND_Y - pt.h);
    }
    ctx.lineTo(GAME_WIDTH + 200, GROUND_Y);
    ctx.lineTo(-200, GROUND_Y);
    ctx.closePath();
    ctx.fill();

    // 雪顶
    ctx.fillStyle = '#e8f0e8';
    ctx.beginPath();
    for (const pt of points) {
      if (pt.h > 110) {
        const sx = pt.x - (cameraX * 0.15 % 1000);
        const drawX = sx < -200 ? sx + 1000 : sx;
        ctx.moveTo(drawX - 25, GROUND_Y - pt.h + 35);
        ctx.lineTo(drawX, GROUND_Y - pt.h - 5);
        ctx.lineTo(drawX + 25, GROUND_Y - pt.h + 35);
      }
    }
    ctx.fill();
  }

  drawClouds(cameraX) {
    const ctx = this.ctx;
    for (let i = 0; i < 8; i++) {
      const baseX = i * 220 + 40;
      const sx = baseX - (cameraX * 0.25 % 1760);
      const drawX = sx < -150 ? sx + 1760 : sx;
      const drawY = 30 + (i % 3) * 50;
      ctx.fillStyle = `rgba(255,255,255,${0.6 + (i % 4) * 0.1})`;
      ctx.beginPath();
      ctx.arc(drawX, drawY, 24, 0, Math.PI * 2);
      ctx.arc(drawX + 22, drawY - 8, 18, 0, Math.PI * 2);
      ctx.arc(drawX + 40, drawY, 22, 0, Math.PI * 2);
      ctx.arc(drawX + 18, drawY + 4, 20, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawBackgroundTrees(cameraX) {
    const ctx = this.ctx;
    for (let i = 0; i < 12; i++) {
      const baseX = i * 150 + 20;
      const sx = baseX - (cameraX * 0.4 % 1800);
      const drawX = sx < -80 ? sx + 1800 : sx;
      const treeH = 40 + (i % 3) * 25;
      const treeY = GROUND_Y - treeH;
      ctx.fillStyle = '#8b7355';
      ctx.fillRect(drawX - 4, treeY + treeH * 0.4, 8, treeH * 0.6);
      ctx.fillStyle = '#6b9e6b';
      ctx.beginPath();
      ctx.arc(drawX, treeY + treeH * 0.25, treeH * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7ab87a';
      ctx.beginPath();
      ctx.arc(drawX + 6, treeY + treeH * 0.2, treeH * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawGround(cameraX, world) {
    const ctx = this.ctx;
    const grad = ctx.createLinearGradient(0, GROUND_Y, 0, GAME_HEIGHT);
    grad.addColorStop(0, '#c8a96e');
    grad.addColorStop(0.08, '#b8944f');
    grad.addColorStop(0.3, '#9b7a3d');
    grad.addColorStop(1, '#5c3d1e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT - GROUND_Y);

    // 草线
    ctx.strokeStyle = '#7ec850';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    for (let x = 0; x < GAME_WIDTH; x += 3) {
      const worldX = x + cameraX;
      if (world.hasGroundAt(worldX)) {
        const grassH = 2 + Math.sin(x * 0.4 + worldX * 0.05) * 2;
        ctx.lineTo(x, GROUND_Y - grassH);
      } else {
        ctx.lineTo(x, GROUND_Y);
      }
    }
    ctx.stroke();

    // 纹理
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1;
    for (let y = GROUND_Y + 15; y < GAME_HEIGHT; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x < GAME_WIDTH; x += 20) {
        ctx.lineTo(x, y + Math.sin(x * 0.1 + y * 0.2) * 3);
      }
      ctx.stroke();
    }
  }

  drawPits(pits, cameraX) {
    const ctx = this.ctx;
    for (const pit of pits) {
      const sx = pit.worldX - cameraX;
      if (sx < -pit.width || sx > GAME_WIDTH + pit.width) continue;
      const grad = ctx.createLinearGradient(0, GROUND_Y, 0, GAME_HEIGHT);
      grad.addColorStop(0, '#1a0a00');
      grad.addColorStop(0.3, '#0d0500');
      grad.addColorStop(1, '#000000');
      ctx.fillStyle = grad;
      ctx.fillRect(sx, GROUND_Y, pit.width, GAME_HEIGHT - GROUND_Y);
      ctx.strokeStyle = '#3a2010';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx - 2, GROUND_Y);
      ctx.lineTo(sx + 5, GROUND_Y + 15);
      ctx.moveTo(sx + pit.width + 2, GROUND_Y);
      ctx.lineTo(sx + pit.width - 5, GROUND_Y + 15);
      ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(sx + 3, GROUND_Y, pit.width - 6, 8);
    }
  }

  drawPlatforms(platforms, cameraX) {
    const ctx = this.ctx;
    for (const plat of platforms) {
      const sx = plat.worldX - cameraX;
      if (sx < -plat.width || sx > GAME_WIDTH + plat.width) continue;
      const grad = ctx.createLinearGradient(0, plat.y, 0, plat.y + 14);
      grad.addColorStop(0, '#d4b896');
      grad.addColorStop(0.5, '#b8945a');
      grad.addColorStop(1, '#8b6b3d');
      ctx.fillStyle = grad;
      ctx.fillRect(sx, plat.y, plat.width, 14);
      ctx.fillStyle = '#6db840';
      ctx.fillRect(sx, plat.y - 3, plat.width, 5);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(sx, plat.y + 14, plat.width, 4);
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 1;
      for (let lx = sx + 8; lx < sx + plat.width; lx += 15) {
        ctx.beginPath();
        ctx.moveTo(lx, plat.y + 3);
        ctx.lineTo(lx, plat.y + 11);
        ctx.stroke();
      }
    }
  }

  drawCoin(coin, cameraX) {
    const ctx = this.ctx;
    const sx = coin.worldX - cameraX;
    const sy = coin.y + Math.sin(coin.bobPhase) * 6;
    // 光晕
    const glow = ctx.createRadialGradient(sx, sy, coin.width * 0.3, sx, sy, coin.width * 0.6);
    glow.addColorStop(0, 'rgba(255,220,100,0.6)');
    glow.addColorStop(1, 'rgba(255,200,50,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(sx, sy, coin.width * 0.6, 0, Math.PI * 2);
    ctx.fill();
    // 主体
    const coinGrad = ctx.createRadialGradient(sx - 2, sy - 2, 1, sx, sy, coin.width * 0.5);
    coinGrad.addColorStop(0, '#fffbe6');
    coinGrad.addColorStop(0.3, '#ffd700');
    coinGrad.addColorStop(0.7, '#f0a500');
    coinGrad.addColorStop(1, '#c77d00');
    ctx.fillStyle = coinGrad;
    ctx.beginPath();
    ctx.arc(sx, sy, coin.width * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.arc(sx - 2, sy - 3, coin.width * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(180,120,20,0.6)';
    ctx.font = `bold ${coin.width*0.55}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', sx, sy + 1);
  }

  drawMonster(obs, cameraX) {
    const ctx = this.ctx;
    const time = performance.now() * 0.003 + obs.patrolOffset;
    const bobY = Math.sin(time * 3) * 3;
    const sx = obs.worldX - cameraX;
    const sy = GROUND_Y - obs.height + bobY;
    const w = obs.width, h = obs.height;
    // 阴影
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(sx, GROUND_Y - 2, w * 0.45, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // 身体
    const bodyGrad = ctx.createLinearGradient(0, sy, 0, sy + h);
    bodyGrad.addColorStop(0, '#e85d5d');
    bodyGrad.addColorStop(0.5, '#c0392b');
    bodyGrad.addColorStop(1, '#7b1818');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.roundRect(sx - w * 0.4, sy + h * 0.2, w * 0.8, h * 0.65, 8);
    ctx.fill();
    // 头部
    ctx.fillStyle = '#d94a4a';
    ctx.beginPath();
    ctx.arc(sx, sy + h * 0.2, w * 0.4, 0, Math.PI * 2);
    ctx.fill();
    // 角
    ctx.fillStyle = '#4a1a1a';
    ctx.beginPath();
    ctx.moveTo(sx - w * 0.22, sy + h * 0.05);
    ctx.lineTo(sx - w * 0.35, sy - h * 0.1);
    ctx.lineTo(sx - w * 0.05, sy + h * 0.1);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(sx + w * 0.22, sy + h * 0.05);
    ctx.lineTo(sx + w * 0.35, sy - h * 0.1);
    ctx.lineTo(sx + w * 0.05, sy + h * 0.1);
    ctx.fill();
    // 眼睛
    const eyeY = sy + h * 0.16;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(sx - w * 0.13, eyeY, w * 0.13, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(sx + w * 0.13, eyeY, w * 0.13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(sx - w * 0.1, eyeY, w * 0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(sx + w * 0.16, eyeY, w * 0.06, 0, Math.PI * 2);
    ctx.fill();
    // 牙齿
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(sx - w * 0.12, sy + h * 0.28);
    ctx.lineTo(sx - w * 0.04, sy + h * 0.38);
    ctx.lineTo(sx + w * 0.04, sy + h * 0.28);
    ctx.fill();
    // 脚
    ctx.fillStyle = '#5c1a1a';
    ctx.fillRect(sx - w * 0.3, GROUND_Y - 8, w * 0.22, 8);
    ctx.fillRect(sx + w * 0.08, GROUND_Y - 8, w * 0.22, 8);
  }

  drawPlant(obs, cameraX) {
    const ctx = this.ctx;
    const time = performance.now() * 0.002 + obs.swayOffset;
    const sway = Math.sin(time * 2.5) * 4;
    const sx = obs.worldX - cameraX;
    const sy = GROUND_Y - obs.height;
    const w = obs.width, h = obs.height;
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(sx, GROUND_Y - 2, w * 0.35, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // stem
    const stemGrad = ctx.createLinearGradient(sx - w * 0.15, 0, sx + w * 0.15, 0);
    stemGrad.addColorStop(0, '#3d7a2f');
    stemGrad.addColorStop(0.5, '#5aad3f');
    stemGrad.addColorStop(1, '#2d5a1f');
    ctx.fillStyle = stemGrad;
    ctx.beginPath();
    ctx.moveTo(sx - w * 0.15 + sway, sy + h);
    ctx.lineTo(sx + w * 0.1 + sway, sy + h * 0.2);
    ctx.lineTo(sx + w * 0.2 + sway, sy + h * 0.2);
    ctx.lineTo(sx + w * 0.05 + sway, sy + h);
    ctx.closePath();
    ctx.fill();
    // body
    ctx.fillStyle = '#4a9e35';
    ctx.beginPath();
    ctx.roundRect(sx - w * 0.2 + sway, sy, w * 0.4, h * 0.75, 10);
    ctx.fill();
    // spikes
    ctx.fillStyle = '#c8e8c0';
    for (let i = 0; i < 5; i++) {
      const spikeY = sy + h * 0.15 + i * h * 0.13;
      const spikeX = sx + sway + (i % 2 === 0 ? -w * 0.22 : w * 0.22);
      ctx.beginPath();
      ctx.arc(spikeX, spikeY, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    // flower
    ctx.fillStyle = '#ff8844';
    ctx.beginPath();
    ctx.arc(sx + sway, sy + h * 0.05, w * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc(sx + sway, sy + h * 0.05, w * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  drawFlag(worldSx) {
    const ctx = this.ctx;
    const sx = worldSx;
    if (sx < -60 || sx > GAME_WIDTH + 60) return;
    ctx.fillStyle = '#888';
    ctx.fillRect(sx - 3, GROUND_Y - 100, 6, 100);
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(sx, GROUND_Y - 102, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(sx - 2, GROUND_Y - 105, 3, 0, Math.PI * 2);
    ctx.fill();
    const flagWave = Math.sin(performance.now() * 0.004) * 5;
    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.moveTo(sx, GROUND_Y - 98);
    ctx.lineTo(sx + 35 + flagWave, GROUND_Y - 85);
    ctx.lineTo(sx + 30 + flagWave, GROUND_Y - 72);
    ctx.lineTo(sx, GROUND_Y - 78);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffdd57';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★', sx + 16 + flagWave * 0.5, GROUND_Y - 80);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText('终点', sx, GROUND_Y - 112);
  }

  drawPlayer(player, cameraX) {
    const ctx = this.ctx;
    const sx = player.worldX - cameraX;
    const bobY = player.isGrounded ? Math.abs(Math.sin(player.runBobPhase)) * 5 : 0;
    const py = player.y - bobY;
    // shadow
    if (player.isGrounded) {
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(sx, GROUND_Y - 2, PLAYER_WIDTH * 0.4, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // body
    const bodyGrad = ctx.createLinearGradient(0, py + PLAYER_HEIGHT * 0.3, 0, py + PLAYER_HEIGHT);
    bodyGrad.addColorStop(0, '#5b9bd5');
    bodyGrad.addColorStop(1, '#346fa0');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.roundRect(sx - PLAYER_WIDTH * 0.3, py + PLAYER_HEIGHT * 0.35, PLAYER_WIDTH * 0.6, PLAYER_HEIGHT * 0.5, 6);
    ctx.fill();
    // head
    const headY = py + PLAYER_HEIGHT * 0.15;
    const headR = PLAYER_WIDTH * 0.32;
    ctx.fillStyle = '#ffe0bd';
    ctx.beginPath();
    ctx.arc(sx, headY, headR, 0, Math.PI * 2);
    ctx.fill();
    // hat
    ctx.fillStyle = '#e85d5d';
    ctx.beginPath();
    ctx.arc(sx, headY - headR * 0.4, headR * 1.1, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(sx - headR * 1.05, headY - headR * 0.4, headR * 2.1, headR * 0.25);
    // eyes
    const eyeY = headY - headR * 0.1;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(sx - headR * 0.35, eyeY, headR * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(sx + headR * 0.35, eyeY, headR * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(sx - headR * 0.3, eyeY, headR * 0.14, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(sx + headR * 0.4, eyeY, headR * 0.14, 0, Math.PI * 2);
    ctx.fill();
    // smile
    ctx.strokeStyle = '#c97d5a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(sx, eyeY + headR * 0.3, headR * 0.2, 0, Math.PI);
    ctx.stroke();
    // legs
    const legTop = py + PLAYER_HEIGHT * 0.78;
    const legSpread = player.isGrounded ? Math.sin(player.runBobPhase * 2) * 6 : 2;
    ctx.fillStyle = '#3d5a80';
    ctx.fillRect(sx - PLAYER_WIDTH * 0.18 + legSpread, legTop, PLAYER_WIDTH * 0.16, PLAYER_HEIGHT * 0.22);
    ctx.fillRect(sx + PLAYER_WIDTH * 0.02 - legSpread, legTop, PLAYER_WIDTH * 0.16, PLAYER_HEIGHT * 0.22);
    // shoes
    ctx.fillStyle = '#333';
    ctx.fillRect(sx - PLAYER_WIDTH * 0.22 + legSpread, GROUND_Y - 7 - bobY, PLAYER_WIDTH * 0.2, 7);
    ctx.fillRect(sx + PLAYER_WIDTH * 0.02 - legSpread, GROUND_Y - 7 - bobY, PLAYER_WIDTH * 0.2, 7);
    // arms
    const armSwing = player.isGrounded ? Math.sin(player.runBobPhase * 2 + Math.PI) * 8 : -5;
    ctx.fillStyle = '#ffe0bd';
    ctx.fillRect(sx - PLAYER_WIDTH * 0.4, py + PLAYER_HEIGHT * 0.38 + armSwing * 0.5, PLAYER_WIDTH * 0.13, PLAYER_HEIGHT * 0.28);
    ctx.fillRect(sx + PLAYER_WIDTH * 0.27, py + PLAYER_HEIGHT * 0.38 - armSwing * 0.5, PLAYER_WIDTH * 0.13, PLAYER_HEIGHT * 0.28);
  }

  drawParticles(particles) {
    const ctx = this.ctx;
    for (const p of particles) {
      const alpha = p.life / p.maxLife;
      let colorStr = p.color;
      if (colorStr.startsWith('#')) {
        const r = parseInt(colorStr.slice(1,3),16);
        const g = parseInt(colorStr.slice(3,5),16);
        const b = parseInt(colorStr.slice(5,7),16);
        colorStr = `rgba(${r},${g},${b},${alpha})`;
      } else {
        colorStr = colorStr.replace(')', `,${alpha})`).replace('rgb','rgba');
      }
      ctx.fillStyle = colorStr;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI*2);
      ctx.fill();
    }
  }

  drawFloatingTexts(texts) {
    const ctx = this.ctx;
    for (const ft of texts) {
      const alpha = ft.life / ft.maxLife;
      const scale = 1 + (1 - alpha) * 0.5;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = ft.color;
      ctx.font = `bold ${Math.round(16*scale)}px "PingFang SC","Microsoft YaHei",sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }
}