/**
 * ギャラリーの設定
 */
const GALLERY_CONFIG = {
  selectors: {
    cards: ".card",
    overlayImg: "img:nth-child(2)",
    activeClass: "is-visible"
  },
  observer: {
    root: null,
    rootMargin: "-20% 0px", // 画面の下から20%食い込んだら発火
    threshold: 0
  }
};

// スクロール位置のリセット（演出優先）
if (history.scrollRestoration) {
  history.scrollRestoration = "manual";
}

/**
 * アニメーション実行関数
 */
const showImage = (target) => {
  const { overlayImg, activeClass } = GALLERY_CONFIG.selectors;
  
  // クラス付与
  target.classList.add(activeClass);

  const img = target.querySelector(overlayImg);

  // アニメーション完了後の軽量化処理
  if (img) {
    img.addEventListener(
      "transitionend",
      () => {
        img.style.clipPath = "none";
      },
      { once: true }
    );
  }
};

/**
 * 監視・実行メインロジック
 */
const imgBox = document.querySelectorAll(GALLERY_CONFIG.selectors.cards);

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      showImage(entry.target);
      observer.unobserve(entry.target);
    }
  });
}, GALLERY_CONFIG.observer);

imgBox.forEach((box) => observer.observe(box));