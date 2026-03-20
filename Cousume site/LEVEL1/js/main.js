/**
 * 指揮官: モジュールの初期化
 */
function initModule() {
  // 視覚効果を減らす設定がONなら何もしない（アクセシビリティ対応）
  if (shouldSkipAnimation()) return;

  // 監視のセットアップ
  setupController();

  // 初回描画の予約
  requestAnimationFrame(() => {
    renderSnowflakes();
    initStarDecoration();
  });
}

/**
 * 画面遷移とアニメーション制御
 */
function setupScreenTransition() {
  const body = document.body;
  const titleScreen = document.getElementById("title");
  
  // ここで1回だけ取得して「キャッシュ」しておく 
  // これで、クリックのたびにquerySelectorが走るのを防げます
  const animTargets = [".title-name", ".content-wrapper", ".button-wrapper"].map(
    (s) => titleScreen.querySelector(s)
  );

  const btns = [
    document.getElementById("btn-campaign"),
    document.getElementById("clear-btn"),
  ];

  btns.forEach((btn) => {
    if (!btn) return;

    btn.addEventListener("click", () => {
      const isResultMode = body.classList.toggle('is-active');

      if (!isResultMode) {
        // 引数として「保存しておいた要素たち」を渡す
        resetAnimations(titleScreen, animTargets);
      }
    });
  });
}

/**
 * アニメーションのリセット処理
 * @param {HTMLElement} titleScreen - タイトル画面の親要素
 * @param {HTMLElement[]} targets - アニメーション対象の要素リスト（キャッシュ済み）
 */
const resetAnimations = (titleScreen, targets) => {
  if (!titleScreen) return;

  // ガード処理
  titleScreen.style.pointerEvents = "none";
  setTimeout(() => {
    titleScreen.style.pointerEvents = "auto";
  }, 2000);

  // 渡された targets をそのまま使う
  targets.forEach((el) => {
    if (!el) return;
    el.style.animation = "none";
    void el.offsetWidth;
    el.style.animation = "";
  });
};

// DOMContentLoaded イベントで囲むと、スクリプトの読み込み位置に依存せず安全に起動できる
document.addEventListener('DOMContentLoaded', () => {
  initModule();
  setupScreenTransition(); // これも初期化の一部ならここで呼ぶか、initModule内で呼ぶと綺麗
});