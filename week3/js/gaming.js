/* =========================================
   🛑 設定・定数エリア (Configuration)
   ここを変えるだけで全体の挙動を調整できます
   ========================================= */

// 盤面のサイズ設定
const BOARD_CONFIG = {
  COUNT: 48, // キーの総数
  COLS: 12, // 横の列数
  ROWS: 4, // 縦の行数
};

// 分割代入で使いやすくしておく
const { COUNT, COLS, ROWS } = BOARD_CONFIG;

// キーのレイアウト定義
const KEY_LAYOUT = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "0",
  "-",
  "⏻",
  "Q",
  "W",
  "E",
  "R",
  "T",
  "Y",
  "U",
  "I",
  "O",
  "P",
  "@",
  "[",
  "A",
  "S",
  "D",
  "F",
  "G",
  "H",
  "J",
  "K",
  "L",
  ";",
  ":",
  "]",
  "Z",
  "X",
  "C",
  "V",
  "B",
  "N",
  "M",
  ",",
  ".",
  "/",
  "\\",
  "SHT",
];

// 特定のキー文字
const CHAR_POWER = "⏻";
const CHAR_POWER_COLOR = "#ff4757"; // 電源ボタンの色

// ⏱ アニメーション調整用の重要定数（マジックナンバーの排除）
// スネークが走る速度（数値が小さいほど速い）
// 30ms = 1秒間に約33回更新 (33fps)
const FRAME_INTERVAL_MS = 30;

// スネーク終了後、ウェーブに切り替わるまでの待機時間
// CSSの transition: 0.2s に合わせるため、少し余裕を持って設定
const TRANSITION_WAIT_MS = 200;

/* =========================================
   📦 状態管理変数 (State Management)
   変化する値はここで管理します
   ========================================= */

let isPowerOn = false; // 電源が入っているか？
let animationId = null; // requestAnimationFrameの停止用ID
let lastTime = 0; // 前回のフレーム描画時刻（デルタタイム計算用）
let waveTimeoutId = null; // 発火防止
let snakeIndex = 0; // 現在スネークが光らせているキーのインデックス
let snakeOrder = []; // 計算された「光る順番」のリスト
let cachedBlocks = []; // ★DOM要素のキャッシュ（高速化のため毎回検索しない）

/* =========================================
   🛠 関数群 (Functions)
   ========================================= */

/**
 * 1つのキー要素(div)を作成する関数
 * @param {string} char - キーに表示する文字
 * @returns {HTMLElement} 作成されたdiv要素
 */
const createKeyElement = (char) => {
  const div = document.createElement("div");
  div.classList.add("block");
  div.textContent = char;

  // 電源ボタンだけ特別色にする
  if (char === CHAR_POWER) {
    div.style.color = CHAR_POWER_COLOR;
  }
  return div;
};

/**
 * 盤面全体を生成する関数
 * 計算コストの高いDOM操作を一回で終わらせ、キャッシュを作成します
 */
const createKeyBoard = () => {
  const board = document.querySelector(".board");
  board.textContent = ""; // 既存の中身をクリア
  const fragment = document.createDocumentFragment(); // 高速化のためのフラグメント

  KEY_LAYOUT.forEach((char, index) => {
    const el = createKeyElement(char);

    // CSSアニメーション用に「列」と「行」の番号を埋め込む
    // index % 12 => 列番号 (0~11)
    // Math.floor(index / 12) => 行番号 (0~3)
    el.style.setProperty("--col", index % COLS);
    el.style.setProperty("--row", Math.floor(index / COLS));

    fragment.appendChild(el);
  });

  board.appendChild(fragment);

  // ★重要：生成直後にDOMを取得して保存しておく
  // これにより、アニメーションループ中に重い querySelectorAll を実行せずに済む
  cachedBlocks = document.querySelectorAll(".block");
};

/**
 * スネーク（一筆書き）のルートを計算する数学関数
 * @returns {Array<number>} 光る順番のインデックス配列
 */
const getSnakeOrder = () => {
  const result = [];

  for (let i = 0; i < COUNT; i++) {
    // 1. 下から数えた行番号を計算
    const rowFromBottom = Math.floor(i / COLS);

    // 2. 実際の行番号（上から0,1,2...）に変換
    // 配列操作は上からが基準のため
    const currentRow = ROWS - 1 - rowFromBottom;

    // 3. 基本の列番号
    const colIndex = i % COLS;

    // 4. 進行方向の決定（ここがスネークの肝！）
    // 偶数段は「右から左」、奇数段は「左から右」へ
    const targetCol =
      rowFromBottom % 2 === 0
        ? COLS - 1 - colIndex // 反転（最大値 - 現在地）
        : colIndex; // そのまま

    // 5. 最終的な配列インデックスに変換して格納
    result.push(currentRow * COLS + targetCol);
  }
  return result;
};

/**
 * メインのアニメーションループ
 * requestAnimationFrame と Delta Time を使用した高精度タイマー
 * @param {number} timestamp - ブラウザから渡される現在時刻
 */
const loop = (timestamp) => {
  if (!lastTime) lastTime = timestamp;

  // 前回の描画から何ミリ秒経過したか計算
  const elapsed = timestamp - lastTime;

  // 設定した間隔(30ms)以上経過していたら処理を実行
  // これによりPCの性能や画面リフレッシュレートに依存せず速度が一定になる
  if (elapsed > FRAME_INTERVAL_MS) {
    // まだ光らせるキーが残っている場合
    if (snakeIndex < snakeOrder.length) {
      const targetIndex = snakeOrder[snakeIndex];
      // キャッシュから高速に要素を取得
      const key = cachedBlocks[targetIndex];

      if (key) {
        key.classList.add("mode-snake");
      }

      snakeIndex++;
      lastTime = timestamp; // 時間を更新
    } else {
      // 全てのキーを光らせ終わった場合
      // CSSの光るアニメーション(transition)が終わるのを待ってから
      // レインボーモード(Wave)へ切り替える
      waveTimeoutId = setTimeout(() => {
        switchToWaveMode();
      }, TRANSITION_WAIT_MS);

      return; // ループをここで終了させる
    }
  }

  // 次のフレーム描画を予約
  animationId = requestAnimationFrame(loop);
};

/**
 * スネークモードからウェーブモードへの切り替え
 */
const switchToWaveMode = () => {
  // 電源が切られていたら何もしない（安全装置）
  if (!isPowerOn) return;

  // キャッシュを使って高速にクラスを書き換え
  cachedBlocks.forEach((b) => {
    b.classList.remove("mode-snake");
    b.classList.add("mode-wave");
  });

  // アニメーションループを確実に停止
  cancelAnimationFrame(animationId);
  animationId = null;
};

/* =========================================
   🎮 操作・イベント (Control)
   ========================================= */

/**
 * 起動処理
 */
const startGamingAnimation = () => {
  if (isPowerOn) return; // 既にONなら無視
  isPowerOn = true;

  // 安全策：まだキーボードが生成されていなければ作る
  if (cachedBlocks.length === 0) createKeyBoard();

  // 既存のクラスをリセット
  cachedBlocks.forEach((b) => b.classList.remove("mode-snake", "mode-wave"));

  // 変数の初期化
  snakeOrder = getSnakeOrder();
  snakeIndex = 0;
  lastTime = 0;

  // ループ開始
  animationId = requestAnimationFrame(loop);
};

/**
 * 停止処理（シャットダウン）
 */
const shutdownAnimation = () => {
  isPowerOn = false;

  // 実行中のアニメーションがあればキャンセル
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  if (waveTimeoutId) {
    clearTimeout(waveTimeoutId);
    waveTimeoutId = null;
  }

  // 全てのキーを消灯
  cachedBlocks.forEach((block) => {
    block.classList.remove("mode-snake", "mode-wave");

    // transitionの残りで変に光るのを防ぐための強制リセット技
    block.style.transition = "none";
    block.offsetHeight; // リフロー（再描画）を強制発生させる
    block.style.transition = "";
  });
};

/* =========================================
   🎮 共通アクション (Action)
   ========================================= */
// 起動・停止を切り替えるだけの純粋な関数
const togglePower = () => {
  isPowerOn ? shutdownAnimation() : startGamingAnimation();
};

/* =========================================
   🖱️ 1. マウス操作 (Click Event)
   ========================================= */
window.addEventListener("click", (e) => {
  // クリックされた要素が .block か確認
  const keyElement = e.target.closest(".block");
  if (!keyElement) return;

  // 画面上の電源ボタンが押された場合
  if (keyElement.textContent === CHAR_POWER) {
    togglePower();
  }
});

/* =========================================
   ⌨️ 2. キーボード操作 (Keydown Event)
   ========================================= */
window.addEventListener("keydown", (e) => {
  // ★ここで物理キーを判定します
  // "Backspace" が BSキーです
  // "Enter" も追加しておくと便利かもしれません
  if (e.key === "Backspace" || e.key === "Enter") {
    // BSキーはブラウザの「戻る」が発動する場合があるので防ぐ
    e.preventDefault();

    togglePower();
  }
});

// 初期化実行
createKeyBoard();

// 今回は間に合わなかったのでリサイズ対応等を入れる
