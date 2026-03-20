import { GAME_CONFIG } from "../utils/constants.js";

const { TIME_LIMIT_MS } = GAME_CONFIG;

// 時間計算用定数
const MS_PER_SECOND = 1000;
const MS_PER_MS = 10;

// 画面の要素をキャッシュしておく
const TIMER_DISPLAY = {
  sec: document.getElementById("timer-seconds"),
  ms: document.getElementById("timer-millseconds"),
};

// rAFと開始時間用変数
let animationId = null;
let timeUpCallBack = null;

// ── メイン処理 ──────────────────────────────────────────

// タイマーを動かす
export const startTimer = (onTimeUp, signal) => {
  // もし関数以外が渡されたり存在しなかったらエラーを出してsuccessをfalseにする
  if (typeof onTimeUp !== "function") {
    console.error("Timer Start failed: onTimeUp must be a function.");
    return false;
  }

  const startAt = performance.now(); // 今の時間を記録
  timeUpCallBack = onTimeUp;

  // 外部から中断されたら即座に止める
  signal?.addEventListener(
    "abort",
    () => {
      stopTimer();
    },
    { once: true, signal },
  );

  animationId = requestAnimationFrame((t) => loop(t, signal, startAt));
  return !!animationId; // IDがあればtrue(animationId !== nullと同じ意味)
};

export const stopTimer = () => {
  // タイマーを確実に消す
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  timeUpCallBack = null;
};

// 前のタイマーUIが残らないようにリセットしておく
export const resetTimerUI = () => {
  // どちらか片方が書けていたら動かさない
  if (!TIMER_DISPLAY.sec || !TIMER_DISPLAY.ms) return;

  const seconds = Math.floor(TIME_LIMIT_MS / MS_PER_SECOND);
  TIMER_DISPLAY.sec.textContent = String(seconds).padStart(2, "0");
  TIMER_DISPLAY.ms.textContent = "00";
};

// ── 部品 ────────────────────────────────────────────────

// ループさせる
const loop = (timestamp, signal, startAt) => {
  if (signal?.aborted) return; // 外部から止められたら終了

  const elapsed = timestamp - startAt;
  const remaining = Math.max(0, TIME_LIMIT_MS - elapsed);

  // 計算処理に渡す
  calcTimer(remaining);

  // calcTimerの判定と被ってloopの予約をされてしまうのを防ぐために二重防御
  if (remaining > 0 && !signal?.aborted) {
    animationId = requestAnimationFrame((t) => loop(t, signal, startAt));
  }
};

// タイマーを計算し0になったらゲームオーバーに渡す
const calcTimer = (remaining) => {
  const safeRemaining = Math.max(0, remaining);

  const sec = Math.floor(safeRemaining / MS_PER_SECOND);
  const ms = Math.floor((safeRemaining % MS_PER_SECOND) / MS_PER_MS);

  // 画面更新処理に渡す
  updateTimerDisplay(sec, ms);

  // タイムオーバーでゲーム終了
  if (safeRemaining <= 0) {
    // timeUpCallBackをクリアしてから実施
    if (timeUpCallBack) {
      const callBack = timeUpCallBack;
      timeUpCallBack = null;
      callBack();
    }
    stopTimer();
  }
};

// タイマーを画面に反映
const updateTimerDisplay = (s, m) => {
  if (TIMER_DISPLAY.sec) TIMER_DISPLAY.sec.textContent = formatTime(s);
  if (TIMER_DISPLAY.ms) TIMER_DISPLAY.ms.textContent = formatTime(m);
};

// 数値を文字列に変換し、文字列が2文字になるまで先頭を0で埋める
const formatTime = (num) => String(num).padStart(2, "0");
