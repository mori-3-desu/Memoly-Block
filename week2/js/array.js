/* --- 設定・データ --- */
const COLOR_CONFIG = [
  { bg: "#FF6B6B" },
  { bg: "#4ECDC4" },
  { bg: "#FFE66D" },
  { bg: "#1A535C" },
  { bg: "#2D3436" },
  { bg: "#6C5CE7" },
  { bg: "#F7FFF7" },
  { bg: "#A8DADC" },
  { bg: "#E63946" },
  { bg: "#00F5FF" },
  { bg: "#FF007F" },
];

const CONFIG = {
  ROWS: 6,
  COLS: 6,
  TOTAL: 36,
  INTERVAL: 50,
  RESIZE: 500,
  RESET: 2000,
};

const { ROWS, COLS, TOTAL, INTERVAL, RESIZE, RESET } = CONFIG;

/* --- 状態管理用フラグ --- */
let isAnimating = false; // アニメーション中かどうか
let isAborted = false;

/* --- DOM要素 --- */
const board = document.getElementById("board");
const btn = document.getElementById("btn");

/* --- 1. 盤面生成 --- */
const createBoard = () => {
  if (!board) return;

  const fragment = document.createDocumentFragment();
  for (let i = 0; i < CONFIG.TOTAL; i++) {
    const block = document.createElement("div");
    block.classList.add("block");
    block.dataset.index = i;
    fragment.appendChild(block);
  }
  board.replaceChildren(fragment);
};

/* --- 2. ユーティリティ関数 --- */
// 色生成
const createColorGenerator = (items) => {
  // 初回は影響されないよう-1
  let lastIndex = -1;
  return () => {
    // 配列じゃなかったり空だった場合はデフォルトで色を採用
    if (!Array.isArray(items) || items.length === 0) return { bg: "#ccc" };

    // 絶対に被らない計算
    const offset = Math.floor(Math.random() * (items.length - 1)) + 1;
    // ここで配列の数の余りを出すことで被らないようになっている
    const newIndex = (lastIndex + offset) % items.length;
    lastIndex = newIndex;
    return items[newIndex];
  };
};

// カラー定義(うえのユーリティ関数のおかげで拡張性がある)
const getRandomColor = createColorGenerator(COLOR_CONFIG);

// 螺旋計算
const getSpiralIndices = (rows, cols) => {
  const result = [];
  let top = 0,
    bottom = rows - 1,
    left = 0,
    right = cols - 1;

  while (top <= bottom && left <= right) {
    for (let i = left; i <= right; i++) result.push(top * cols + i);
    top++;
    for (let i = top; i <= bottom; i++) result.push(i * cols + right);
    right--;
    if (top <= bottom) {
      for (let i = right; i >= left; i--) result.push(bottom * cols + i);
      bottom--;
    }
    if (left <= right) {
      for (let i = bottom; i >= top; i--) result.push(i * cols + left);
      left++;
    }
  }
  return result;
};

// アクセシビリティ設定（動きを減らす設定の確認）
const shouldSkipAnimation = () => {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

// アニメーションを初期に戻す関数
const resetBoard = async () => {
  const waitTime = isAborted ? 0 : RESET;

  await new Promise((resolve) => setTimeout(resolve, waitTime));
  const blocks = document.querySelectorAll(".block");

  blocks.forEach((block) => {
    block.style.backgroundColor = "";
    block.style.transition = isAborted ? "none" : "background 0.5s";
  });
};

/* --- 3. アニメーション実行 --- */
const startSpiralAnimation = async () => {
  // アニメーション中なら中断（連打防止）
  if (isAnimating) return;

  // アクセシビリティ配慮
  if (shouldSkipAnimation()) {
    console.log("Skip Animation");
    return;
  }

  isAnimating = true; // フラグON
  isAborted = false; // 停止フラグをoffに

  if (btn) btn.disabled = true; // ボタンも無効化すると親切

  const blocks = document.querySelectorAll(".block");
  // 万が一ブロックがない場合は再生成
  if (blocks.length === 0) createBoard();

  const spiralIndices = getSpiralIndices(ROWS, COLS);

  try {
    for (const index of spiralIndices) {
      const block = blocks[index];

      // リサイズされたらアニメーションを中断する。
      if (isAborted) {
        throw new Error("ABORT_BY_RESIZE");
      }

      if (block) {
        const color = getRandomColor();

        // 色を取得できなかった場合の例外処理
        if (!color || !color.bg) {
          throw new Error("Failed to get color");
        }
        block.style.backgroundColor = color.bg;
        block.style.transition = "background 0.3s";
      }
      await new Promise((resolve) => setTimeout(resolve, INTERVAL));
    }
  } catch (e) {
    if (e.message === "ABORT_BY_RESIZE") {
      console.log("Aborted due to resizing");
    } else {
      console.error("Failed to retrieve color:", e.message);
    }
  } finally {
    await resetBoard(); // リセット関数を呼び出す
    isAnimating = false; // フラグOFF
    if (btn) btn.disabled = false;
  }
};

/* --- 4. コントローラー & イベント --- */

// リサイズ時の処理（デバウンス付き）
const handleResize = () => {
  let resizeTimer; // リサイズ用タイマー

  const handleUpdate = () => {
    if (isAnimating) {
      isAborted = true;
    }

    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {
      // リサイズ中はアニメーションを止めるか、盤面を作り直す
      createBoard();
    }, RESIZE); // 0.5秒操作が止まったら実行}
  };

  const observer = new ResizeObserver(handleUpdate);
  observer.observe(document.body);
};

// 初期化関数
function initModule() {
  createBoard();

  // ボタンイベント
  if (btn) {
    btn.addEventListener("click", startSpiralAnimation);
  }

  handleResize();
}

// 実行！
initModule();
