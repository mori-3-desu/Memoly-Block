/* 時間管理 */
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* 画面遷移用 */
export const TRANSITION_CONFIG = {
  ANM_OPEN: "is-active",
  ANM_CLOSE: "is-leaving",
  FALLBACK_TIME_MS: 850,
};

/* SCREEN_ID管理 */
export const SCREEN_ID = {
  SELECT: ".kanban-column",
  INFO: "info-screen",
  GAME: "game-screen",
  RESULT: "result-screen",
};

// ドラッグ中のクラス設定
export const DRAG_CONFIG = {
  DRAG_ACTIVE: "is-floating",
  DRAG_GRABBING: "is-dragging",
};

/* プレイ状態クラス、プレイ不可のロッククラス */
export const LOCKCLASS = "is-locked";
export const PLAYING = "is-playing";

// ドラッグの状態を一括管理する
export const dragStatus = {
  dragcard: null,
  dragAbort: null,
  animationId: null,
  shiftX: 0,
  shiftY: 0,
};

// TODO:完成したらあてはめる
export const GAME_STATUS = {
  CLEAR: "CLEAR",
  FAILED: "FAILED",
  SYSTEM_ERROR: "SYSTEM ERROR",
};

/* 全難易度共通設定 */
export const GAME_CONFIG = {
  GRID_SIZE: 25,
  TIME_LIMIT_MS: 30000,
  MAX_LEVEL: 3,
};

/* 難易度設定 */
export const levelSettings = {
  1: { level: 1, flashCount: 5, flashSpeed: 900 },
  2: { level: 2, flashCount: 7, flashSpeed: 700 },
  3: { level: 3, flashCount: 10, flashSpeed: 400 },
};
