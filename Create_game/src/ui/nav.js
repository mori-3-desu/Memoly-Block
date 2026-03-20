const NAV_CONFIG = {
  NAV_CLASS: "is-active",
  TEXT_OPEN: "メニューを開く",
  TEXT_CLOSE: "メニューを閉じる",
};

const hamburgerBtn = document.querySelector(".hamburger-menu");
const navigation = document.querySelector(".nav-container");

const { NAV_CLASS, TEXT_OPEN, TEXT_CLOSE } = NAV_CONFIG;

// ── メイン処理 ──────────────────────────────────────────

// App.js準備
export const initNav = () => {
  // 要素が無くてクラッシュするのを防ぐ
  if (!hamburgerBtn || !navigation) {
    console.warn("Required elements not found");
    return;
  }

  // ハンバーガーボタンにイベントを付与
  hamburgerBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleGlobalNavigation();
  });
};

// ナビゲーションメニューの開閉処理
export const toggleGlobalNavigation = (forceClose = false) => {
  // 外部から直接呼ばれた時のために
  if (!hamburgerBtn || !navigation) return;

  // 次の状態を判断
  // 強制クローズならfalse、そうでないなら今の状態を逆にする
  const isActive = forceClose
    ? false
    : !navigation.classList.contains(NAV_CLASS);

  // 属性更新任せた！
  updateNavAttribute(isActive);

  // クリックイベントも任せた！
  toggleOutSideClickListener(isActive);
};

// ── 部品 ────────────────────────────────────────────────

// 属性更新用関数
const updateNavAttribute = (isActive) => {
  // ボタンとナビの両方に適応
  hamburgerBtn.classList.toggle(NAV_CLASS, isActive);
  navigation.classList.toggle(NAV_CLASS, isActive);

  // inert(イナート)でフォーカスとスクリーンリーダー対応
  navigation.toggleAttribute("inert", !isActive);

  // アクセシビリティの属性更新
  hamburgerBtn.setAttribute("aria-expanded", String(isActive));
  hamburgerBtn.setAttribute("aria-label", isActive ? TEXT_CLOSE : TEXT_OPEN);
};

// 画面外クリックのイベントを登録
export const toggleOutSideClickListener = (isActive) => {
  // captureを入れることによって裏のボタンより先にdocumentが検知される
  if (isActive) {
    document.addEventListener("click", handleOutSideClick, { capture: true });
  } else {
    document.removeEventListener("click", handleOutSideClick, {
      capture: true,
    });
  }
};

// 画面外クリック
export const handleOutSideClick = (e) => {
  if (!navigation.contains(e.target)) {
    // 裏のボタンのクリックイベントを止める
    e.stopPropagation();
    toggleGlobalNavigation(true);
  }
};
