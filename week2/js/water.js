class PuddleEffect {
  constructor(wrapperId, CONFIG) {
    this.wrapper = document.getElementById(wrapperId);
    this.config = CONFIG;

    // 状態管理
    this.state = {
      delayTimer: null,
      intervalTimer: null,
      lastPos: { x: 0, y: 0 },
      rect: { left: 0, top: 0 },
    };

    // イベントハンドラのバインド（removeEventListenerできるように）
    this.handleResize = this.updateRect.bind(this);
    this.handlePointerDown = this.onPointerDown.bind(this);
    this.handlePointerMove = this.onPointerMove.bind(this);
    this.handleStop = this.stopDropping.bind(this);
    this.handleAnimationEnd = this.onAnimationEnd.bind(this);

    this.init();
  }

  init() {
    // 1. パフォーマンス対策：座標キャッシュ
    this.updateRect();
    // 【重要】passive: true でスクロールをブロックしないようにする
    window.addEventListener("resize", this.handleResize, { passive: true });
    window.addEventListener("scroll", this.handleResize, { passive: true });

    // 2. イベント移譲（ガベージコレクション対策）
    this.wrapper.addEventListener("animationend", (e) => {
      // 親で一括監視して、終わった波紋コンテナだけ消す
      if (e.target.classList.contains("puddle-container")) {
        e.target.remove();
      }
    });

    // 3. 操作イベント登録
    this.wrapper.addEventListener("animationEnd", this.handleAnimationEnd);
    this.wrapper.addEventListener("pointerdown", this.handlePointerDown);
    window.addEventListener("pointermove", this.handlePointerMove);
    window.addEventListener("pointerup", this.handleStop);
    window.addEventListener("pointerleave", this.handleStop);
  }

  // 座標情報の更新（リサイズ・スクロール時のみ実行）
  updateRect() {
    const rect = this.wrapper.getBoundingClientRect();
    this.state.rect = { left: rect.left, top: rect.top };
  }

  getRandom(min, max) {
    return Math.random() * (max - min) + min;
  }

  createPuddle(x, y) {
    const {
      MIN_SIZE_PX,
      MAX_SIZE_PX,
      RING_SCALE,
      RING_SIZE_PX,
      RIPPLE_DURATION, // 追加
      SPLASH_DURATION, // 追加
      BASE_COLOR_RGB, // 追加
    } = this.config;

    const size = this.getRandom(MIN_SIZE_PX, MAX_SIZE_PX);
    const ringSize = size * RING_SIZE_PX;
    
    const centerCircle = document.createElement("div");
    centerCircle.classList.add("drop-puddle", "puddle-center");
    centerCircle.style.width = `${size}px`; // styleプロパティへの代入は安全
    centerCircle.style.height = `${size}px`;

    const outerRing = document.createElement("div");
    outerRing.classList.add("drop-puddle", "puddle-ring");
    outerRing.style.width = `${ringSize}px`;
    outerRing.style.height = `${ringSize}px`;

    // DOMツリーに追加
    const container = document.createElement("div");
    container.classList.add("puddle-container");
    container.style.left = `${x}px`;
    container.style.top = `${y}px`;

    // ▼ CSS変数を一括注入（これでCSSをいじらずにJSだけで制御完了！）
    container.style.setProperty("--ring-scale", RING_SCALE);
    container.style.setProperty("--ripple-duration", RIPPLE_DURATION);
    container.style.setProperty("--splash-duration", SPLASH_DURATION);
    container.style.setProperty("--base-color", BASE_COLOR_RGB);

    container.appendChild(centerCircle);
    container.appendChild(outerRing);
    this.wrapper.appendChild(container);
  }

  startDropping(x, y) {
    if (this.state.intervalTimer) return;
    this.state.intervalTimer = setInterval(() => {
      const jitterX = (Math.random() - 0.5) * 20;
      const jitterY = (Math.random() - 0.5) * 20;
      this.createPuddle(x + jitterX, y + jitterY);
    }, this.config.DROP_INTERVAL);
  }

  stopDropping() {
    if (this.state.delayTimer) clearTimeout(this.state.delayTimer);
    if (this.state.intervalTimer) clearInterval(this.state.intervalTimer);
    this.state.delayTimer = null;
    this.state.intervalTimer = null;
  }

  onPointerDown(e) {
    if (e.button !== 0) return; // 左クリックのみ
    this.wrapper.setPointerCapture(e.pointerId);

    // キャッシュしたRectを使う（高速化）
    const x = e.clientX - this.state.rect.left;
    const y = e.clientY - this.state.rect.top;

    this.createPuddle(x, y);
    this.state.lastPos = { x, y };

    this.stopDropping();
    this.state.delayTimer = setTimeout(() => {
      this.startDropping(x, y);
    }, this.config.LONG_PRESS_DELAY);
  }

  onPointerMove(e) {
    if (e.buttons !== 1) return; // ドラッグ中のみ

    const x = e.clientX - this.state.rect.left;
    const y = e.clientY - this.state.rect.top;

    const dist = Math.hypot(x - this.state.lastPos.x, y - this.state.lastPos.y);

    if (dist > this.config.MOVE_THRESHOLD_PX) {
      this.stopDropping(); // 動いたら連射解除
      this.createPuddle(x, y);
      this.state.lastPos = { x, y };
    }
  }
  onAnimationEnd(e) {
    if (e.target.classList.contains("puddle-container")) {
      e.target.remove();
    }
  }

  destroy() {
    this.stopDropping();

    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("scroll", this.handleResize);
    window.removeEventListener("pointermove", this.handlePointerMove);
    window.removeEventListener("pointerup", this.handleStop);
    window.removeEventListener("pointerleave", this.handleStop);

    this.wrapper.removeEventListener("pointerdown", this.handlePointerDown);

    while (this.wrapper.firstChild) {
      this.wrapper.removeChild(this.wrapper.firstChild);
    }
  }
}

// --- 設定（ここをいじるだけでデザインが変わる！） ---
const CONFIG = {
  MIN_SIZE_PX: 20,
  MAX_SIZE_PX: 60,
  RING_SCALE: 2.5,
  RING_SIZE_PX: 2,

  // ▼ アニメーション制御
  RIPPLE_DURATION: "0.7s", // 波紋が広がる時間
  SPLASH_DURATION: "0.3s", // 中心が弾ける時間
  BASE_COLOR_RGB: "255, 255, 255", // 色（RGB）

  // ▼ 操作感度
  LONG_PRESS_DELAY: 400,
  MOVE_THRESHOLD_PX: 30,
  DROP_INTERVAL: 150,
};

// 実行
new PuddleEffect("puddle-wrapper", CONFIG);
