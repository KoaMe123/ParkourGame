// 画布尺寸
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 400;
export const GROUND_Y = 335; // 地面顶部Y坐标

// 游戏距离
export const TOTAL_DISTANCE = 3200;
export const PLAYER_SCREEN_X = 140;

// 物理参数
export const GRAVITY = 850;           // px/s²
export const JUMP_VELOCITY = -470;    // 第一跳
export const DOUBLE_JUMP_VELOCITY = -400; // 二段跳
export const INITIAL_SCROLL_SPEED = 160;
export const MAX_SCROLL_SPEED = 380;

// 玩家尺寸
export const PLAYER_WIDTH = 32;
export const PLAYER_HEIGHT = 48;

// 游戏状态枚举
export const STATE = {
  READY: 'ready',
  PLAYING: 'playing',
  DEAD: 'dead',
  WIN: 'win'
};