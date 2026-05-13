import {
  PLAYER_SCREEN_X, GROUND_Y, PLAYER_WIDTH, PLAYER_HEIGHT,
  GRAVITY, JUMP_VELOCITY, DOUBLE_JUMP_VELOCITY
} from '../config/constants.js';

export class Player {
  constructor() {
    this.worldX = PLAYER_SCREEN_X;
    this.y = GROUND_Y - PLAYER_HEIGHT;
    this.vy = 0;           // 垂直速度
    this.isGrounded = true;
    this.jumpsUsed = 0;
    this.maxJumps = 2;
    this.runBobPhase = 0;
    this.trailPositions = [];
  }

  reset() {
    this.worldX = PLAYER_SCREEN_X;
    this.y = GROUND_Y - PLAYER_HEIGHT;
    this.vy = 0;
    this.isGrounded = true;
    this.jumpsUsed = 0;
    this.runBobPhase = 0;
    this.trailPositions = [];
  }

  jump() {
    if (this.jumpsUsed < this.maxJumps) {
      if (this.jumpsUsed === 0) {
        this.vy = JUMP_VELOCITY;
        this.isGrounded = false;
        this.jumpsUsed = 1;
        return 'first';
      } else if (this.jumpsUsed === 1 && !this.isGrounded) {
        this.vy = DOUBLE_JUMP_VELOCITY;
        this.jumpsUsed = 2;
        return 'double';
      }
    }
    return null;
  }

  update(dt, hasGroundFn, hasPlatformFn, cameraX) {
    // 重力
    if (!this.isGrounded) {
      this.vy += GRAVITY * dt;
      this.y += this.vy * dt;
    }

    const playerFootY = this.y + PLAYER_HEIGHT;
    const centerX = this.worldX;

    // 检查浮空平台
    let supportedByPlatform = false;
    if (this.vy >= 0 && !this.isGrounded) {
      const plat = hasPlatformFn(centerX, playerFootY);
      if (plat && playerFootY >= plat.y - 3 && playerFootY <= plat.y + 8) {
        this.y = plat.y - PLAYER_HEIGHT;
        this.vy = 0;
        this.isGrounded = true;
        this.jumpsUsed = 0;
        supportedByPlatform = true;
      }
    }

    // 地面检测
    if (!supportedByPlatform) {
      if (this.vy >= 0 && playerFootY >= GROUND_Y) {
        if (hasGroundFn(centerX)) {
          this.y = GROUND_Y - PLAYER_HEIGHT;
          this.vy = 0;
          this.isGrounded = true;
          this.jumpsUsed = 0;
        } else if (playerFootY >= GROUND_Y + 5) {
          this.isGrounded = false;
        }
      } else if (playerFootY < GROUND_Y && this.isGrounded && !hasGroundFn(centerX)) {
        this.isGrounded = false;
        this.vy = 0;
      }
    }

    // 如果在地面上且地面存在，保持
    if (this.isGrounded && hasGroundFn(centerX) && !supportedByPlatform) {
      this.y = GROUND_Y - PLAYER_HEIGHT;
      this.vy = 0;
    } else if (this.isGrounded && supportedByPlatform) {
      const platCheck = hasPlatformFn(centerX, playerFootY);
      if (!platCheck && hasGroundFn(centerX)) {
        this.y = GROUND_Y - PLAYER_HEIGHT;
      } else if (!platCheck && !hasGroundFn(centerX)) {
        this.isGrounded = false;
        this.vy = 0;
      }
    }

    // 跑步弹跳动画
    if (this.isGrounded) {
      this.runBobPhase += 0.06; // dt 影响在 Game 中乘速度后再传，此处简单化，由外部传入速度因子
    }

    // 更新拖尾
    if (Math.abs(this.vy) > 50 || !this.isGrounded) {
      this.trailPositions.push({
        x: this.worldX - cameraX,
        y: this.y + PLAYER_HEIGHT / 2,
        life: 0.25,
      });
    }
    for (let i = this.trailPositions.length - 1; i >= 0; i--) {
      this.trailPositions[i].life -= dt;
      if (this.trailPositions[i].life <= 0) {
        this.trailPositions.splice(i, 1);
      }
    }
  }
}