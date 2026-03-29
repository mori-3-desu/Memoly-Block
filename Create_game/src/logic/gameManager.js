import { board } from "../ui/dom.js";
import { changeScreen } from "../ui/screenManager.js";
import { GAME_STATUS, PLAYING, SCREEN_ID, delay } from "../utils/constants.js";
import { handleClearScreen, handleGameOverScreen } from "./gameResultFlow.js";
import { startTimer, stopTimer } from "./timer.js";

const counter = document.getElementById("flash-count"); // カウンターを取得

let gameController = null; // クラスはがし用、アボートだと記述も少なく安全にはがせる
let currentAnswer = null; // 判定が終わったら配列を解放させる
let currentStep = 0; // 何番目を追いかけてるか
let currentConfig = null; // 設定を預かる変数

const CLASS_BLOCK = "block"; // ブロックのクラス
const { CLEAR, FAILED, SYSTEM_ERROR } = GAME_STATUS; // リザルト結果の画面を変える
const { RESULT } = SCREEN_ID; // リザルト画面へ飛ばす

// 開始前に必要な設定を定義する関数
const initGameState = (config, answerSequence) => {
  currentAnswer = answerSequence; // 正解の配列を代入
  currentStep = 0; // ゲーム開始時にリセット
  currentConfig = config; // 設定を全体で共有
};

// ゲームの開始の司令塔
export const startGame = (config, answerSequence, signal) => {
  // is-playingがもし付与されていなかった時の安全装置
  if (!board.classList.contains(PLAYING)) {
    console.warn("Warning: PLAYING is not found Forcibly apply and proceed.");
    board.classList.add(PLAYING);
  }

  gameController?.abort();
  gameController = new AbortController();

  initGameState(config, answerSequence);

  // タイマーを始動させる、0になったらゲームオーバーを呼ぶ(密結合を防止するためにここでendGameを呼ぶ)
  const success = startTimer(() => {
    if (signal?.aborted) return;
    endGame(FAILED);
  }, signal);

  // タイマーが正常に動作しなかった時、エラーで強制進行させる
  if (!success) {
    console.error("Timer failed to start!");
    endGame(SYSTEM_ERROR);
    return;
  }

  board.addEventListener("click", handleBlockClick, {
    signal: gameController.signal,
  });
};

// エフェクトとアニメーションの時間を定義
const BLOCK_EFFECT = {
  CORRECT: { class: "correct-effect", duration: 600 },
  MISS: { class: "miss-effect", duration: 200 },
};

// エフェクトを再生する関数
const playBlockEffect = async (block, effect) => {
  block.classList.add(effect.class);
  await delay(effect.duration);
  block.classList.remove(effect.class);
};

// 無効なクリックをガードし、クリックされたブロックを返す
const getClickedBlock = (e) => {
  if (!currentAnswer || !board.classList.contains(PLAYING)) return null;
  const target = e.target;
  if (!target.classList.contains(CLASS_BLOCK)) return null;
  return target;
};

// クリックされたブロックが正解かどうかを返す
const judgeSelection = (clickedIndex) => {
  return clickedIndex === currentAnswer[currentStep];
};

// ブロックのクリックを受け取り、判定・エフェクト・ゲーム進行を制御する
const handleBlockClick = async (e) => {
  const target = getClickedBlock(e);
  if (!target) return;

  const clickedIndex = Array.from(board.children).indexOf(target); // クリックされたブロックの番号を取得
  const isCorrect = judgeSelection(clickedIndex); // 判定の結果を受け取る

  if (isCorrect) {
    playBlockEffect(target, BLOCK_EFFECT.CORRECT);
    currentStep++;
    updateGameCounter(currentStep);
    if (currentStep === currentAnswer.length) endGame(CLEAR);
  } else {
    await playBlockEffect(target, BLOCK_EFFECT.MISS);
    endGame(FAILED);
  }
};

// タイマー停止・イベント除去・プレイ中クラス除去を行う
const cleanupGame = () => {
  stopTimer();
  gameController?.abort();
  gameController = null;
  board.classList.remove(PLAYING);
};

// 状態変数を解放し、参照していたレベルを返す
// 古い参照を残さないため(メモリリーク防止)
const releaseState = () => {
  const playedLevel = currentConfig?.level;
  currentAnswer = null;
  currentStep = 0;
  currentConfig = null;
  return playedLevel;
};

// ゲーム終了のオーケストレーター
export const endGame = async (result) => {
  cleanupGame();
  const playedLevel = releaseState();
  const gameStatus = result || SYSTEM_ERROR;

  switch (gameStatus) {
    case CLEAR:
      handleClearScreen(gameStatus, playedLevel);
      break;

    case FAILED:
    case SYSTEM_ERROR:
      handleGameOverScreen(gameStatus, playedLevel);
      break;

    default:
      console.error("Unexpected Error", gameStatus, playedLevel);
      break;
  }
  await changeScreen(RESULT);
};

// カウンターを更新する関数
export const updateGameCounter = (count) => {
  if (counter) {
    counter.textContent = `${count}`;
  }
};
