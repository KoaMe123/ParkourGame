import { GROUND_Y, TOTAL_DISTANCE } from '../config/constants.js';

export class World {
  constructor() {
    this.obstacles = [];
    this.coins = [];
    this.pits = [];
    this.platforms = [];
    this.lastObstacleWorldX = 350;
  }

  generate() {
    this.obstacles = [];
    this.coins = [];
    this.pits = [];
    this.platforms = [];
    this.lastObstacleWorldX = 350;

    let seed = 42;
    const pseudoRandom = () => {
      seed = (seed * 16807 + 0) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    let currentX = 400;
    const minGap = 160;
    const maxGap = 340;

    while (currentX < TOTAL_DISTANCE - 250) {
      const gap = minGap + pseudoRandom() * (maxGap - minGap);
      currentX += gap;
      if (currentX >= TOTAL_DISTANCE - 250) break;

      const rand = pseudoRandom();

      if (rand < 0.22) {
        const mw = 28 + pseudoRandom() * 16;
        const mh = 38 + pseudoRandom() * 14;
        this.obstacles.push({
          worldX: currentX,
          type: 'monster',
          width: mw,
          height: mh,
          alive: true,
          patrolOffset: pseudoRandom() * Math.PI * 2,
        });
        this.lastObstacleWorldX = currentX;
      } else if (rand < 0.40) {
        const pw = 22 + pseudoRandom() * 12;
        const ph = 30 + pseudoRandom() * 16;
        this.obstacles.push({
          worldX: currentX,
          type: 'plant',
          width: pw,
          height: ph,
          alive: true,
          swayOffset: pseudoRandom() * Math.PI * 2,
        });
        this.lastObstacleWorldX = currentX;
      } else if (rand < 0.55) {
        const pitWidth = 70 + pseudoRandom() * 60;
        this.pits.push({ worldX: currentX, width: pitWidth });
        if (pseudoRandom() < 0.5) {
          this.platforms.push({
            worldX: currentX + pitWidth * 0.15,
            y: GROUND_Y - 70 - pseudoRandom() * 50,
            width: pitWidth * 0.6 + pseudoRandom() * 30,
          });
        }
        this.lastObstacleWorldX = currentX + pitWidth;
        currentX += pitWidth;
      } else if (rand < 0.72) {
        const coinCount = 2 + Math.floor(pseudoRandom() * 3);
        const baseX = currentX;
        const baseY = GROUND_Y - 30 - pseudoRandom() * 90;
        for (let i = 0; i < coinCount; i++) {
          this.coins.push({
            worldX: baseX + i * 22,
            y: baseY - i * 18,
            width: 18,
            height: 18,
            collected: false,
            bobPhase: pseudoRandom() * Math.PI * 2,
          });
        }
        this.lastObstacleWorldX = currentX + coinCount * 22;
        currentX += coinCount * 22;
      } else {
        this.coins.push({
          worldX: currentX,
          y: GROUND_Y - 35 - pseudoRandom() * 100,
          width: 18,
          height: 18,
          collected: false,
          bobPhase: pseudoRandom() * Math.PI * 2,
        });
        this.lastObstacleWorldX = currentX;
      }
    }

    // 终点前奖励金币
    const bonusCoinX = TOTAL_DISTANCE - 180;
    for (let i = 0; i < 5; i++) {
      this.coins.push({
        worldX: bonusCoinX + i * 25,
        y: GROUND_Y - 50 - Math.abs(i - 2) * 20,
        width: 18,
        height: 18,
        collected: false,
        bobPhase: i * 1.2,
      });
    }
  }

  // 提供查询方法
  hasGroundAt(worldX) {
    for (const pit of this.pits) {
      if (worldX >= pit.worldX && worldX < pit.worldX + pit.width) {
        return false;
      }
    }
    return true;
  }

  hasPlatformAt(worldX, playerFootY) {
    for (const plat of this.platforms) {
      if (worldX >= plat.worldX && worldX <= plat.worldX + plat.width) {
        if (playerFootY >= plat.y - 4 && playerFootY <= plat.y + 10) {
          return plat;
        }
      }
    }
    return null;
  }
}