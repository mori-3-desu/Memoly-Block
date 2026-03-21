import { setReadyGame } from "../logic/gameFlow.js";
import { columns } from "../ui/dom.js";
import { DRAG_CONFIG, dragStatus } from "../utils/constants.js";
import {
  handleCardDrag,
  releaseLevelCard,
  updateCardPosition,
} from "./dragEngine.js";

// リストカードのクラス
const LEVEL_CARD = ".level-card";

// DOM要素をキャッシュ化
const dropZones = {
  todo: columns.todo.querySelector(".card-list"),
  doing: columns.doing.querySelector(".drop-zone"),
  clear: columns.clear.querySelector(".clear-list"),
};

// ドラッグ移動のクラス
const { DRAG_ACTIVE, DRAG_GRABBING } = DRAG_CONFIG;

// ── メイン処理 ──────────────────────────────────────────

// ドラッグの補助関数
export const setupCardDrag = (card, e) => {
  // 位置ずれ計算 (dragStatusに保存)
  const rect = card.getBoundingClientRect();
  dragStatus.shiftX = e.clientX - rect.left;
  dragStatus.shiftY = e.clientY - rect.top;

  // スタイルを付与させる関数へ
  draggingStyle(card, rect);

  // 移動計算処理に渡す
  updateCardPosition(e.clientX, e.clientY);

  // イベント登録（AbortControllerで一括解除できるように）
  document.addEventListener("pointermove", handleCardDrag, {
    signal: dragStatus.dragAbort.signal,
  });
  document.addEventListener("pointerup", releaseLevelCard, {
    signal: dragStatus.dragAbort.signal,
  });
};

// todoに戻す処理を共通化
export const revertLevelCardToTodo = () => {
  if (!dropZones.todo) return;

  dropZones.todo.append(dragStatus.activeCard);
  sortLevelCards(dropZones.todo);
};

// DOINGにセットする
export const setLevelCardToDoing = (level) => {
  if (!dropZones.doing) return;

  dropZones.doing.append(dragStatus.activeCard);
  sortLevelCards(dropZones.doing);

  setReadyGame(level);
};

// クリアゾーンに置く関数
export const finalizeLevelClear = (card) => {
  // 置かれてないなら抜ける
  if (!dropZones.clear) return;

  dropZones.clear.append(card);
  sortLevelCards(dropZones.clear);
};

// ── 部品 ────────────────────────────────────────────────

const sortLevelCards = (listElement) => {
  // リストのカードをすべて取得して配列に変換
  const cards = Array.from(listElement.querySelectorAll(LEVEL_CARD));

  // data-levelを数値で並べ替え
  cards.sort((a, b) => {
    return Number(a.dataset.level) - Number(b.dataset.level);
  });

  // スプレッド構文で描画計算を最適化
  listElement.append(...cards);
};

// スタイルを付与とDOMの移動を担当
const draggingStyle = (card, rect) => {
  // スタイルの固定と浮遊状態を作る
  Object.assign(card.style, {
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  });

  card.classList.add(DRAG_ACTIVE);
  document.body.classList.add(DRAG_GRABBING);

  document.body.append(card);
};
