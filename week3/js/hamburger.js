(() => {
  const hamburgerBtn = document.getElementById("hamburger");
  const navigation = document.querySelector(".nav-container");
  const overlay = document.getElementById("overlay");

  const CLASS_NAME = "is-active";
  const TEXT_OPEN = "メニューを開く";
  const TEXT_CLOSE = "メニューを閉じる";

  const toggleGlobalNavigation = (forceClose = false) => {
    // forceCloseがtrueなら強制的に閉じ、そうでなければ現在の状態を反転
    const isActive = forceClose
      ? false
      : navigation.classList.toggle(CLASS_NAME);

    // クラスの一括制御
    const elements = [navigation, hamburgerBtn, overlay];
    elements.forEach((el) => {
      if (el) el.classList.toggle(CLASS_NAME, isActive);
    });

    // アクセシビリティ・スクロール制御
    hamburgerBtn.setAttribute("aria-expanded", isActive);
    hamburgerBtn.setAttribute("aria-label", isActive ? TEXT_CLOSE : TEXT_OPEN);
    document.body.style.overflow = isActive ? "hidden" : ""; // 背景スクロール防止
  };

  const initHamburgerPanel = () => {
    // クリックイベント
    hamburgerBtn.addEventListener("click", () => toggleGlobalNavigation());

    // オーバーレイクリックで閉じる
    if (overlay) {
      overlay.addEventListener("click", () => toggleGlobalNavigation(true));
    }

    // Escキーで閉じる
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navigation.classList.contains(CLASS_NAME)) {
        toggleGlobalNavigation(true);
      }
    });
  };

  if (!hamburgerBtn || !navigation) {
    console.error("Required elements not found");
  } else {
    initHamburgerPanel();
  }

  window.addEventListener("load", () => {
    document.body.classList.remove("preload");
  });
})();
