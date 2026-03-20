import { GAME_CONFIG } from "../utils/constants.js";
import { board } from "./dom.js";

/* 盤面のクラス */
const BOARD_CONFIG = {
  TYPE_DIV: "div",
  TYPE_SPAN: "span",
  CLASS_BLOCK: "block",
  CLASS_DOOR: "door",
  DOOR_DIRECTIONS: ["top", "right", "bottom", "left"],
};

const { GRID_SIZE } = GAME_CONFIG;
const { TYPE_DIV, TYPE_SPAN, CLASS_BLOCK, CLASS_DOOR, DOOR_DIRECTIONS } =
  BOARD_CONFIG;

// 盤面生成
export const createBoard = () => {
  // idが無かったら抜ける
  if (!board) return;

  // 仮の箱を用意
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < GRID_SIZE; i++) {
    const block = document.createElement(TYPE_DIV);
    block.classList.add(CLASS_BLOCK);
    block.dataset.index = i; // クリック時にどのブロックが選択されたか識別するためにindexを付与

    // 二重forに見えるが計算量はO(n × 4)なのでパフォーマンスは問題ない
    // この処理は正解のクリック時の演出を少しリッチにするために追加している
    DOOR_DIRECTIONS.forEach((side) => {
      const door = document.createElement(TYPE_SPAN);
      door.classList.add(CLASS_DOOR, `${CLASS_DOOR}--${side}`);
      block.appendChild(door);
    });
    fragment.appendChild(block);
  }

  // 今の盤面を消して一気に生成する
  board.replaceChildren(fragment);
};
