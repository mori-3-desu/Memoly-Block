const btn = document.getElementById("btn");
const showContent = document.querySelector(".show-element");

/** * UI設定定数
 * マジックナンバーをなくして管理しやすくする
 */
const UI_CONFIG = {
  TEXT_OPEN: "↑", // 開くときのボタン文字
  TEXT_CLOSE: "↓", // 閉じるときのボタン文字
  CLASS_NAME: "is-open",
};

// ここで展開しておくことでコードが読みやすくなる
const { TEXT_OPEN, TEXT_CLOSE, CLASS_NAME } = UI_CONFIG;

/**
 * ボトムパネルの初期化とイベント設定
 */
const initBottomPanel = () => {
  // 初期のボタン要素をつける
  btn.textContent = TEXT_OPEN;

  btn.addEventListener("click", () => {
    // クラスを切り替える（トグル）
    showContent.classList.toggle(CLASS_NAME);

    //「今、開いているか？」を取得
    const isOpen = showContent.classList.contains(CLASS_NAME);

    // 状態に合わせて属性と文字を更新
    btn.setAttribute("aria-expanded", isOpen);
    btn.textContent = isOpen ? TEXT_CLOSE : TEXT_OPEN;
  });
};

// 安全装置：要素が見つからなければここで処理を終了（エラー防止）
if (!btn || !showContent) {
  console.error("必要な要素が見つかりませんでした");
  // ここで return すれば、下の addEventListener は実行されないので安全！
} else {
  // 要素があるときだけイベントを設定
  initBottomPanel();
}
