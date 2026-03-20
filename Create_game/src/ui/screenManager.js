import { TRANSITION_CONFIG } from "../utils/constants.js";
import { toggleGlobalNavigation } from "./nav.js";

const { ANM_OPEN, ANM_CLOSE, FALLBACK_TIME_MS } = TRANSITION_CONFIG;

// ── メイン処理 ──────────────────────────────────────────

export const initScreen = () => {
  // data-targetを持っているすべてのボタンを一括で取得
  const screenBtns = document.querySelectorAll("[data-target]");

  // data-targetを見てそれぞれの画面に飛ばす汎用関数
  if (screenBtns.length === 0) {
    console.error("Target element missing");
  } else {
    screenBtns.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault(); // ブラウザの副作用を止める
        e.stopPropagation(); // 親のイベント伝播を防ぐ(余計な処理をさせない)

        // クリックしたボタンのカスタムデータ要素をセット
        const targetId = e.currentTarget.dataset.target;

        // メニューがあれば閉じる
        toggleGlobalNavigation?.(true);

        await changeScreen(targetId);
      });
    });
  }
};

// 3. 切り替えのフロー管理（オーケストレーター）
export const changeScreen = async (targetScreenId) => {
  // 現在の画面と切り替える画面を取得
  const currentScreen = document.querySelector(`.screen.${ANM_OPEN}`);
  const targetScreen = document.getElementById(targetScreenId);

  // 画面が同じなら何もしない
  if (!targetScreen || currentScreen === targetScreen) return;

  // 現在のスクリーンIDを記録する(navbtnをヘッダーに分けたため)
  document.body.dataset.currentScreen = targetScreenId;

  // 退場フェーズ
  if (currentScreen) {
    await leaveScreen(currentScreen);
  }

  // 入場フェーズ
  await enterScreen(targetScreen);
};

// ── 部品 ────────────────────────────────────────────────

// 2. 画面を消す（退場）の責務
export const leaveScreen = async (screen) => {
  // screenが渡されなかったら抜ける
  if (!screen) return;

  screen.classList.remove(ANM_OPEN);
  screen.classList.add(ANM_CLOSE);

  // 画面を切り替えるクラスに合わせる
  const animTarget = screen.querySelector(".js-anim-wait");
  if (animTarget) {
    await waitAnimation(animTarget, FALLBACK_TIME_MS);
  }

  screen.classList.remove(ANM_CLOSE);
};

// 1. 画面を出す（入場）の責務
export const enterScreen = async (screen) => {
  // screenが渡されなかったら抜ける
  if (!screen) return;

  // アニメーションが長いクラスに合わせる
  screen.classList.add(ANM_OPEN);
  const animTarget = screen.querySelector(".js-anim-wait");

  if (animTarget) {
    await waitAnimation(animTarget, FALLBACK_TIME_MS);
  }
};

// アニメーション待機関数
export const waitAnimation = (element, fallbackMs) => {
  // タイマーの二重起動防止
  return new Promise((resolve) => {
    let timerId;
    let isDone = false; // 完了したのフラグ

    const done = () => {
      // 完了済みなら抜ける
      if (isDone) return;
      isDone = true;
      clearTimeout(timerId);
      element?.removeEventListener("animationend", done);
      resolve();
    };

    element?.addEventListener("animationend", done); // 一度実行したら消す、doneで画面が進まないのを防止
    timerId = setTimeout(done, fallbackMs); // 要素が消えたり、ブラウザを切り替えてもfallbackMsが実行される
  });
};
