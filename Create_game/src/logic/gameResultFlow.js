import { GAME_CONFIG, GAME_STATUS } from "../utils/constant.js";
import { setReadyGame } from "./gameFlow.js";
import { game } from "./state.js";

// -------------------------------------------------------------
// 定数宣言
// -------------------------------------------------------------
const { CLEAR, FAILED, SYSTEM_ERROR } = GAME_STATUS;
const { MAX_LEVEL } = GAME_CONFIG;

const resultTitle = document.querySelector(".result-title"); // リザルトの結果で文字を変える
const HIDDEN_CLASS = "is-hidden"; // nextボタンを隠すためのクラス

// 個別に取得してるのはゲームオーバー時や最大レベル到達時にnextボタンを出さないため
const resultSelectBtns = {
  next: document.querySelector(".game-next-btn"),
  retry: document.querySelector(".game-retry-btn"),
};

// リザルト結果によってUIを変える
const RESULT_UI_CONFIG = {
  [CLEAR]: {
    themeClass: "clear-color",
    buttons: { next: true },
  },
  [FAILED]: {
    themeClass: "failed-color",
    buttons: { next: false },
  },
  [SYSTEM_ERROR]: {
    themeClass: "failed-color",
    buttons: { next: false },
  },
};

// ── メイン処理 ──────────────────────────────────────────

// リザルトボタン起動
export const initResultBtn = () => {
  // レベルで行き先が決まるボタンを取得
  [resultSelectBtns.next, resultSelectBtns.retry].forEach((btn) => {
    btn.addEventListener("click", (e) => {
      // 現在のレベルを整数として解析、間違えて数字の文字列"1.5"を渡されても1に、文字列はNaNに
      const level = Number.parseInt(e.currentTarget.dataset.level, 10);

      // 有効な数字かつレベルが一以上かチェック
      if (!level || level < 1) {
        console.warn(
          `[Navigation] Missing or invalid data-level. Defaulting to 1.`,
        );
        setReadyGame(1); // レベル1を設定する、ここはあえて数字を残している
        return;
      }

      // 正常なデータならレベルを代入してreadyへ
      setReadyGame(level);
    });
  });
};

// CLEARの処理
export const handleClearScreen = (status, level) => {
  // クリア以外が渡されてないかここでもう一回確認(違うステータスで動くのを防ぐ)
  if (status !== CLEAR) {
    console.error("Unexpected Error", status);
    return;
  }

  setButtonNavigation(status, level); // レベルボタンの行き先をセット
  game.clearLevel(level); // CLEARしたらレベル解除と鍵解放のクラスを使う
  updateResultText(status); // datasetを見て判断
};

// ゲームオーバー時の処理
export const handleGameOverScreen = (status, level) => {
  // 失敗のステータスのみを集める
  const FAILED_STATUS_LIST = [FAILED, SYSTEM_ERROR];

  // 定義済みのステータスが無ければエラーを出す
  if (!FAILED_STATUS_LIST.includes(status)) {
    console.error(`[GameOver] "${status}" is not a failure status.`);
    return;
  }

  setButtonNavigation(status, level); // レベルボタンの行き先をセット
  updateResultText(status); // 正常なステータスならUI更新へ
};

// ── 部品 ────────────────────────────────────────────────

// ボタンの行き先をセットする
const setButtonNavigation = (status, level) => {
  const currentLevel = Number(level); // 1はtrueになってしまうので数値型に変換する
  const isLastLevel = currentLevel >= MAX_LEVEL; // 最大レベルに到達しているか

  // リトライボタンに今の難易度をセット
  resultSelectBtns.retry.dataset.level = level;
  resultSelectBtns.next.dataset.level = isLastLevel
    ? currentLevel
    : currentLevel + 1; // いきなりレベル2つ上がらないのであえて数字を残してます

  setNavigationResultBtn(status, isLastLevel);
};

// リザルトボタンに行き先をあてはめる
const setNavigationResultBtn = (status, isLastLevel) => {
  const config = RESULT_UI_CONFIG[status]; // 設定を取得

  // 設定データがないので抜ける
  if (!config) {
    console.error(
      `[ResultUI] Unexpected Status: "${status}". Check resultSelectBtns or RESULT_UI_CONFIG.`,
    );
    return;
  }

  // 隠すべき理由を説明変数にする
  const isReachedMax = !config.buttons.next || isLastLevel;

  // 上限のレベルと失敗時はnextボタンを外す
  resultSelectBtns.next.classList.toggle(HIDDEN_CLASS, isReachedMax);
};

// 結果によって文字を変える処理
const updateResultText = (status) => {
  const config = RESULT_UI_CONFIG[status];

  // 設定データがないので抜ける
  if (!config) {
    console.error(
      `[ResultText] Unexpected Status: "${status}". Check GAME_STATUS or RESULT_UI_CONFIG.`,
    );
    return;
  }

  // テキストの更新し、一度つけ外してからマッピングしたクラスをつける
  resultTitle.textContent = status;
  resultTitle.className = `result-title ${config.themeClass}`;
};
