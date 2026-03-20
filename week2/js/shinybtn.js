/**
 * ボタンにアニメーションをつける共通関数
 * @param {string | HTMLElement} target
 * @param {string} className
 */

const TIMER_CONFIG = {
  WAIT: 2000,
  INTERVAL: 500,
};

const { WAIT, INTERVAL } = TIMER_CONFIG;

// グローバルフラグ：これですべての動作を監視する
let isAnimation = false;

/**
 * 1. アニメーション完了を保証するユーティリティ
 */
const waitAnimation = async (el) => {
  const animations = el.getAnimations({ subtree: true });
  if (animations.length === 0) {
    return new Promise((resolve) => setTimeout(resolve, WAIT));
  }
  await Promise.all(animations.map((anim) => anim.finished));
};

/**
 * 2. 実行関数（純粋なアニメーション実行）
 */
const runAnimation = async (target, className) => {
  const btn = typeof target === "string" ? document.getElementById(target) : target;
  if (!btn || btn.getAttribute("aria-disabled") === "true") return;

  btn.setAttribute("aria-disabled", true);
  btn.classList.add(className);

  await waitAnimation(btn);

  btn.classList.remove(className);
  btn.removeAttribute("aria-disabled");
};

/**
 * 3. 登録関数（クリックイベントの設定）
 */
const setAnimationBtn = (target, className) => {
  const btn = typeof target === "string" ? document.getElementById(target) : target;
  if (!btn) return;

  btn.addEventListener(
    "click",
    async () => {;

      // 2. 自分の連打防止
      if (btn.classList.contains(className)) return;

      // 3. ★ここで「使用中」フラグを立てる！
      isAnimation = true;

      try {
        await runAnimation(target, className);
      } finally {
        // 4. ★終わったら確実にフラグを下ろす
        isAnimation = false;
      }
    },
    { capture: true },
  );
};

// ボタン等間隔で順番に光らせる関数
const allAnimationBtn = async (sequence) => {
  // 二重起動防止
  if (isAnimation) return;

  // フラグON
  isAnimation = true;
  document.body.style.pointerEvents = "none";
  try {
    for (const item of sequence) {
      await new Promise((resolve) => setTimeout(resolve, INTERVAL));
      await runAnimation(item.id, item.className);
    }
  } finally {
    document.body.style.pointerEvents = "auto";
    isAnimation = false;
    
  }
};

// --- 実行 ---

// 単発実行用
setAnimationBtn("btn", "is-shiny");
setAnimationBtn("btn-god", "is-god");
setAnimationBtn("btn-rainbow", "is-rainbow");

const all = document.getElementById("btn-all");
if (all) {
  all.addEventListener("click", () => {
    // ここでチェックが効くようになります
    if (isAnimation) return;
    
    const btnPattern = [
      { id: "btn", className: "is-shiny" },
      { id: "btn-god", className: "is-god" },
      { id: "btn-rainbow", className: "is-rainbow" },
    ];

    allAnimationBtn(btnPattern);
  });
}