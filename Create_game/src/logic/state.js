import { LOCKCLASS } from "../utils/constants.js";

export class GameSelect {
  // 初期値
  movingDrag = "";

  constructor() {
    this.clearedLevels = new Set(); // クリアした時の配列
    this.currentLevel = 1; // プレイ可能レベル
  }

  // レベルをクリアした時の処理
  clearLevel(level) {
    const numLevel = Number(level);

    // 既にクリアしてたら何もしない
    if (this.clearedLevels.has(numLevel)) return;

    this.clearedLevels.add(numLevel);
    this.unlockNextLevel(numLevel + 1);
  }

  // クリア列におけるかの判定
  canDropToClear(level) {
    return this.clearedLevels.has(Number(level));
  }

  // 次のレベルを解除する処理
  unlockNextLevel(nextlevel) {
    const nextCard = document.querySelector(
      `.level-card[data-level="${nextlevel}"]`,
    );

    // 解放するカードがなかったら全クリなので終了
    if (!nextCard) return;

    nextCard.classList.remove(LOCKCLASS);
    this.currentLevel = nextlevel; // プレイ可能レベルを更新
  }

  // プレイ可能なレベル
  canPlaying(level) {
    const numLevel = Number(level);

    // クリア済みか進行しているレベル以下なら遊べる
    return this.clearedLevels.has(numLevel) || numLevel <= this.currentLevel;
  }
}

export const game = new GameSelect();
