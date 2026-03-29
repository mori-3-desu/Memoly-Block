import { createBoard } from "../ui/createBoard.js";
import { changeScreen } from "../ui/screenManager.js";
import { delay, levelSettings, SCREEN_ID } from "../utils/constants.js";
import { flashAnimation } from "./gameLogic.js";
import { startGame, updateGameCounter } from "./gameManager.js";
import { resetTimerUI, stopTimer } from "./timer.js";

// 時間設定
const IDLE = 1800; // フラッシュ前に前置きさせる

// DOM要素の取得
const levelNum = document.querySelector(".level-num"); // レベルに応じて文字を変更するクラス
const countdownTimer = document.getElementById("countdown-text"); // カウントダウン
const counterMax = document.getElementById("flash-count-max"); // maxを取得
const infoContainer = document.querySelector(".info-container");

// カウントダウンで使うクラス
const CLASS_COUNT = "countdown";
const CLASS_GO = "go-anim";

// カウントダウンの設定
const COUNT_DOWN_CONFIG = {
  COUNT_START_SEC: 3,
  COUNT_FINISH_SEC: 0,
  TIMER_MS: 1000,
};

// GO!の文字
const GO_TEXT = "GO!";

const { INFO, GAME } = SCREEN_ID;
const { COUNT_START_SEC, COUNT_FINISH_SEC, TIMER_MS } = COUNT_DOWN_CONFIG;

let gameController = null; // 非同期の競合を防ぐためにAbortControllerを採用している

// ── メイン処理 ──────────────────────────────────────────

// ゲーム開始前の司令塔
export const setReadyGame = async (level) => {
  gameController?.abort();
  gameController = new AbortController();
  const { signal } = gameController;

  const config = validateLevelConfig(level);
  if (!config) return;

  resetGameStates(level, config);
  await changeScreen(INFO);
  waitStartClick(config, signal);
};

// 設定のバリデーションチェック
export const validateLevelConfig = (level) => {
  const config = levelSettings[level];
  if (!config) return null;

  const { flashCount, flashSpeed } = config;

  // Numberの型チェックでORで確認していたけど冗長だと判断
  // 上記で分割代入を使い、何を検証するかを明示してeveryで完結に
  if (![flashCount, flashSpeed].every(Number.isInteger)) {
    console.error(`[Config] Invalid levelSettings for level ${level}:`, config);
    return null;
  }
  return config;
};

// ゲーム開始前のユーザー入力待機画面処理
const waitStartClick = (config, signal) => {
  if (!config?.flashCount) return;

  // クリックした場所に合わせて処理を変える
  const handleClick = async (e) => {
    const titleBtn = e.target.closest(".btn-title-back");

    if (titleBtn) {
      infoContainer.removeEventListener("click", handleClick);
      await changeScreen(titleBtn.dataset.target);
      return;
    }

    // ゲーム起動処理担当
    await launchGameSequence(config, signal);
  };

  infoContainer.addEventListener("click", handleClick, { once: true, signal });
};

// 起動処理担当
export const launchGameSequence = async (config, signal) => {
  createBoard();
  await changeScreen(GAME);

  if (signal?.aborted) return;
  await playCountdownAnimation(config, signal);
};

// カウントダウンからフラッシュまで
export const playCountdownAnimation = async (config, signal) => {
  await gameStartCountdown(signal);
  await presentPattern(config, signal);
};

// カウントダウンメイン処理
export const gameStartCountdown = async (signal) => {
  for (let i = COUNT_START_SEC; i > COUNT_FINISH_SEC; i--) {
    upDateDisplay(i);

    countdownTimer.classList.remove(CLASS_COUNT);
    void countdownTimer.offsetWidth; // 今の状態を再計算させる(箱は残り続ける為ブラウザはやり直さないよとさぼってしまう)
    countdownTimer.classList.add(CLASS_COUNT);

    if (signal?.aborted) return;
    await delay(TIMER_MS);
  }

  if (signal?.aborted) return;
  await displayGoText();
};

// 光らせてスタートゲームに渡すまでを担当
export const presentPattern = async (config, signal) => {
  stopTimer(); // 前のタイマーが残っている場合を考えてここで一度タイマーを止めておく

  if (signal?.aborted) return;
  const answerSequence = await flashAnimation(config, signal);

  // nullが返ってきたり、中断されたら終了
  if (!answerSequence || signal?.aborted) return;
  startGame(config, answerSequence, signal);
};

// ── 部品 ────────────────────────────────────────────────

// 状態リセット専用関数
const resetGameStates = (level, config) => {
  updateLevelDisplay(level);
  updateFlashCountMax(config.flashCount);
  resetTimerUI(); // 初期表示が00:00にならないよう開始前にリセットする
  updateGameCounter(0); // 0を代入するのは前のゲーム結果のままになるため
};

// GO！を出す処理
export const displayGoText = async () => {
  // カウントダウン要素が無かったら抜ける
  if (!countdownTimer) return;

  // すぐにフラッシュを始めるとユーザーが困惑するので待機時間を設けている
  upDateDisplay(GO_TEXT);
  countdownTimer.classList.add(CLASS_GO);
  await delay(IDLE);
  countdownTimer.classList.remove(CLASS_GO);

  // 空文字で消す
  upDateDisplay("");
};

// カウントダウンをディスプレイに反映させる関数
export const upDateDisplay = (count) => {
  // カウントダウンが無ければ抜ける
  if (!countdownTimer) return;

  countdownTimer.textContent = count;
};

// レベルに応じて表示を変える
const updateLevelDisplay = (level) => {
  if (!levelNum) return;
  levelNum.textContent = level;
};

// レベルに応じてカウントの表示を変える
const updateFlashCountMax = (count) => {
  if (!counterMax) return;
  counterMax.textContent = count;
};
