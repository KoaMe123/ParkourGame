import { PLAYER_WIDTH, PLAYER_HEIGHT, GROUND_Y } from '../config/constants.js';

/**
 * 检查玩家与世界元素的碰撞，返回事件对象或null
 * 事件可能包含 type: 'monster' | 'plant_kill' | 'plant_side' | 'coin' | 'fall' | 'pit' | 'win' 等
 */
export function checkCollisions(player, world, cameraX, FLAG_WORLD_X, flagReached) {
  const pLeft = player.worldX - PLAYER_WIDTH / 2;
  const pRight = player.worldX + PLAYER_WIDTH / 2;
  const pTop = player.y;
  const pBottom = player.y + PLAYER_HEIGHT;

  const events = [];

  // 终点检测
  if (player.worldX >= FLAG_WORLD_X && !flagReached) {
    events.push({ type: 'win' });
    return events;
  }

  // 掉落检测
  if (player.y > 400 + 60) { // GAME_HEIGHT = 400
    events.push({ type: 'fall' });
    return events;
  }
  if (!player.isGrounded && !world.hasGroundAt(player.worldX) && player.y + PLAYER_HEIGHT > GROUND_Y + 35 &&
      !world.hasPlatformAt(player.worldX, player.y + PLAYER_HEIGHT)) {
    events.push({ type: 'pit' });
    return events;
  }

  // 障碍物碰撞
  for (const obs of world.obstacles) {
    if (!obs.alive) continue;
    const oLeft = obs.worldX - obs.width / 2;
    const oRight = obs.worldX + obs.width / 2;
    const oTop = GROUND_Y - obs.height;
    const oBottom = GROUND_Y;

    if (pRight > oLeft && pLeft < oRight && pBottom > oTop && pTop < oBottom) {
      if (obs.type === 'monster') {
        events.push({ type: 'monster' });
        return events; // 立即死亡
      } else if (obs.type === 'plant') {
        const playerFootAtContact = pBottom;
        const plantTopY = oTop;
        if (playerFootAtContact >= plantTopY - 2 &&
            playerFootAtContact <= plantTopY + 10 &&
            player.vy >= -30) {
          // 踩死植物
          obs.alive = false;
          events.push({ type: 'plant_kill', worldX: obs.worldX, worldY: oTop });
        } else {
          events.push({ type: 'plant_side' });
          return events;
        }
      }
    }
  }

  // 金币碰撞
  for (const coin of world.coins) {
    if (coin.collected) continue;
    const cLeft = coin.worldX - coin.width / 2;
    const cRight = coin.worldX + coin.width / 2;
    const cTop = coin.y - coin.height / 2;
    const cBottom = coin.y + coin.height / 2;

    if (pRight > cLeft && pLeft < cRight && pBottom > cTop && pTop < cBottom) {
      coin.collected = true;
      events.push({ type: 'coin', worldX: coin.worldX, worldY: coin.y });
    }
  }

  return events;
}