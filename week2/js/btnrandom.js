/**
 * カラー設定のオブジェクトの型定義
 * @typedef {Object} ColorTheme
 * @property {string} bg - 背景色 (例: "#FF0000")
 * @property {string} text - 文字色 (例: "#FFFFFF")
 */
const COLOR_CONFIG = [
  // 1. ポップ & ビビッド
  { bg: "#FF6B6B", text: "#FFFFFF" }, // サーモンピンク
  { bg: "#4ECDC4", text: "#FFFFFF" }, // ターコイズ
  { bg: "#FFE66D", text: "#333333" }, // パステルイエロー（文字は黒）

  // 2. クール & ダーク
  { bg: "#1A535C", text: "#FFFFFF" }, // 深い青緑
  { bg: "#2D3436", text: "#FFFFFF" }, // ダークグレー
  { bg: "#6C5CE7", text: "#FFFFFF" }, // パープル

  // 3. ニュアンスカラー
  { bg: "#F7FFF7", text: "#333333" }, // ほぼ白（ミントホワイト）
  { bg: "#A8DADC", text: "#333333" }, // パウダーブルー
  { bg: "#E63946", text: "#FFFFFF" }, // インパクトレッド

  // 4. ネオン & サイバー
  { bg: "#00F5FF", text: "#000000" }, // サイアン
  { bg: "#FF007F", text: "#FFFFFF" }, // マゼンタ
];

/**
 * ランチメニューの型定義
 * @type {string[]}
 */
const LUNCH_CONFIG = [
  "🍜 こってりラーメン",
  "🍛 カツカレー",
  "🍣 回らない寿司",
  "🍔 バーガーキング",
  "🍝 サイゼリヤ",
  "🍱 ほっともっと",
  "🥩 いきなりステーキ",
  "🍕 ドミノピザ",
  "🍚 牛丼（特盛）",
  "🥗 意識高い系サラダ",
  "🥟 王将の餃子定食",
  "🥪 サブウェイ",
  "🍳 オムライス",
  "🍗 ケンタッキー",
  "🐟 焼き魚定食",
];

const SELECT_TIMER_CONFIG = {
  SPINING_TIME: 50,
  FINITH_RETRY_PUSH: 1000,
};

const { SPINING_TIME, FINITH_RETRY_PUSH } = SELECT_TIMER_CONFIG;

/**
 * 重複なしランダム生成器を作る関数
 * * @template T
 * @param {T[]} items - ランダムに選びたい配列（文字列でもオブジェクトでもOK）
 * @returns {() => T | null} - 実行すると配列の中身を1つ返す関数
 */
const createRandomBtn = (items) => {
  // 初回は影響されないように
  let lastIndex = -1;

  // 有効な配列以外は無効化
  if (!Array.isArray(items) || items.length === 0) {
    console.error(" Input must be a valid array ");
    return () => null;
  }

  // 同じ結果が出力されないように計算
  return () => {
    const offset = Math.floor(Math.random() * (items.length - 1) + 1);
    const newIndex = (lastIndex + offset) % items.length;
    lastIndex = newIndex;
    return items[newIndex];
  };
};

const lunchBtn = document.getElementById("btn-lunch");
const randomLunch = createRandomBtn(LUNCH_CONFIG);

if (lunchBtn) {
  // 連打防止用のフラグ（回ってる間は押せないようにする）
  let isSpinning = false;

  lunchBtn.addEventListener("click", () => {
    // 回ってる最中なら何もしない（ガード）
    if (isSpinning) return;

    // 1. 最終的に表示するメニューを先に決めておく
    const finalMenu = randomLunch();
    if (!finalMenu) return;

    // 2. ルーレット開始！
    isSpinning = true;
    lunchBtn.style.opacity = "0.7"; // ちょっと薄くして「考え中」っぽくする

    // 50ミリ秒ごとに、適当なメニューをパラパラ表示する
    const intervalId = setInterval(() => {
      // 演出用なので、ここは普通のランダムでOK
      const tempIndex = Math.floor(Math.random() * LUNCH_CONFIG.length);
      lunchBtn.textContent = LUNCH_CONFIG[tempIndex];
    }, SELECT_TIMER_CONFIG);

    setTimeout(() => {
      clearInterval(intervalId);
      lunchBtn.textContent = finalMenu;

      // 元に戻す
      lunchBtn.style.opacity = "1";
      isSpinning = false; // また押せるようにする
    }, FINITH_RETRY_PUSH);
  });
} else {
  console.warn("#btn-lunch not found");
}

const btnColor = document.getElementById("btn-random");
const randomPicker = createRandomBtn(COLOR_CONFIG);

if (btnColor) {
  btnColor.addEventListener("click", () => {
    const theme = randomPicker();

    if (theme) {
      // theme. と打つと bg と text が候補に出るようになります！
      btnColor.style.backgroundColor = theme.bg;
      btnColor.style.color = theme.text;
    } else {
      console.error("Failed to generate theme data");
    }
  });
} else {
  console.error("#btn-random not found");
}
