import {
  finalizeLevelClear,
  revertLevelCardToTodo,
  setLevelCardToDoing,
} from "../features/dragManager.js";
import { columns } from "../ui/dom.js";
import { dragStatus } from "../utils/constants.js";
import { game } from "./state.js";

// 離した列の位置を判定する処理
export const handleColumnDrop = (column, level) => {
  // todoやどこにも当てはまらなかったらtodoに戻す
  if (!column || column === columns.todo) {
    return revertLevelCardToTodo();
  }

  // レベルを次の関数に渡す
  if (column === columns.doing) return setLevelCardToDoing(level);
  if (column === columns.clear) return handleClearZoneDrop(level);
};

// クリアにおけるかの判定
export const handleClearZoneDrop = (level) => {
  // 掴まれていなかったら抜ける
  if (!dragStatus.activeCard) return;

  // クリアしていないレベルが置かれたらtodoエリアに戻す
  if (!game.canDropToClear(level)) {
    return revertLevelCardToTodo();
  }

  // クリアしてたらクリアゾーンへ
  finalizeLevelClear(dragStatus.activeCard);
};
