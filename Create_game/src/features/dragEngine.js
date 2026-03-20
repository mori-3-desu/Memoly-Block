import { handleColumnDrop } from "../logic/columnLogic.js";
import { game } from "../logic/state.js";
import { cards } from "../ui/dom.js";
import { DRAG_CONFIG, dragStatus, SCREEN_ID } from "../utils/constant.js";
import { setupCardDrag } from "./dragManager.js";

const { SELECT } = SCREEN_ID;
const { DRAG_ACTIVE, DRAG_GRABBING } = DRAG_CONFIG;

// ── メイン処理 ──────────────────────────────────────────

export const initDrag = () => {
  cards.forEach((c) => {
    c.addEventListener("pointerdown", grabLevelCard);
  });
};

// 掴んだ位置を計算
const grabLevelCard = (e) => {
  const targetCard = e.currentTarget; // 掴んだカード
  const level = targetCard.dataset.level; // 掴んだカードのレベルを取得

  // 遊べる難易度でなければ抜ける　これだけだとUX不親切なので教えてあげる処理を追加しようかな
  if (!game.canPlaying(level)) {
    dragStatus.activeCard = null; // 条件に合わなければ解除
    return;
  }

  dragStatus.activeCard = targetCard; // 掴んだカードを記憶させる
  dragStatus.dragAbort = new AbortController();

  // e (イベントオブジェクト) を渡して計算できるようにする
  setupCardDrag(dragStatus.activeCard, e);
};

// 要素が掴まれたらカーソルについていくように(スマホなら指に合わせる)
export const handleCardDrag = (e) => {
  // 何も掴んでいなければ抜ける
  if (!dragStatus.activeCard) return;
  e.preventDefault(); // スマホの画面スクロール防止
  updateCardPosition(e.clientX, e.clientY);
};

// 離した時の処理
export const releaseLevelCard = (e) => {
  // 何も掴まれてなかったら抜ける
  if (!dragStatus.activeCard) return;

  // 下にある要素を探すため一時的に非表示
  dragStatus.activeCard.style.display = "none";
  const dropTarget = document.elementFromPoint(e.clientX, e.clientY);
  dragStatus.activeCard.style.display = "";

  const column = dropTarget?.closest(SELECT);
  const level = Number(dragStatus.activeCard.dataset.level);

  // カラムに置かれたときの判定処理に渡す
  handleColumnDrop(column, level);

  // 離した時のスタイルを共通化
  resetDragging();
};

// ── 部品 ────────────────────────────────────────────────

// マウスや指をセンターに合わせる計算処理
export const updateCardPosition = (cardX, cardY) => {
  // dragStatusから値を取得して使用する
  if (!dragStatus.activeCard) return;

  if (dragStatus.animationId) {
    cancelAnimationFrame(dragStatus.animationId);
  }

  dragStatus.animationId = requestAnimationFrame(() => {
    const x = cardX - dragStatus.shiftX;
    const y = cardY - dragStatus.shiftY;

    // GPUを使う "translate3d"（Z軸を0にすることで強制的にGPUを起動させる）
    dragStatus.activeCard.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  });
};

// 離した時のスタイルをリセットする処理
export const resetDragging = () => {
  if (!dragStatus.activeCard) return;

  // 上記で付けたスタイルをすべてはがす(HTMLにスタイルは書いていないので採用)
  dragStatus.activeCard.removeAttribute("style");

  dragStatus.activeCard.classList.remove(DRAG_ACTIVE);
  document.body.classList.remove(DRAG_GRABBING);

  // 最後に参照を消す
  dragStatus.activeCard = null;

  // 描画予約を消し去る
  if (dragStatus.animationId) {
    cancelAnimationFrame(dragStatus.animationId);
    dragStatus.animationId = null;
  }

  if (dragStatus.dragAbort) {
    dragStatus.dragAbort.abort();
    dragStatus.dragAbort = null;
  }
};
