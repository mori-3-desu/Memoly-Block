import { describe, it, expect, beforeEach } from "vitest";
import { GameSelect } from "../state.js";

describe("GameSelect", () => {
  let game;

  beforeEach(() => {
    game = new GameSelect();
  });

  // ── canPlaying ──────────────────────────────────────────
  describe("canPlaying", () => {
    it("初期状態でLv.1はプレイ可能", () => {
      expect(game.canPlaying(1)).toBe(true);
    });

    it("初期状態でLv.2はプレイ不可", () => {
      expect(game.canPlaying(2)).toBe(false);
    });

    it("初期状態でLv.3はプレイ不可", () => {
      expect(game.canPlaying(3)).toBe(false);
    });

    it("文字列で渡しても正しく判定できる", () => {
      expect(game.canPlaying("1")).toBe(true);
      expect(game.canPlaying("2")).toBe(false);
    });
  });

  // ── canDropToClear ──────────────────────────────────────
  describe("canDropToClear", () => {
    it("クリアしていないレベルはCLEARゾーンに置けない", () => {
      expect(game.canDropToClear(1)).toBe(false);
    });

    it("クリア後はCLEARゾーンに置ける", () => {
      game.clearedLevels.add(1);
      expect(game.canDropToClear(1)).toBe(true);
    });
  });

  // ── clearLevel ─────────────────────────────────────────
  describe("clearLevel", () => {
    it("クリアするとclearedLevelsに追加される", () => {
      game.clearLevel(1);
      expect(game.clearedLevels.has(1)).toBe(true);
    });

    it("同じレベルを2回クリアしても重複しない", () => {
      game.clearLevel(1);
      game.clearLevel(1);
      expect(game.clearedLevels.size).toBe(1);
    });

    it("Lv.1クリア後はLv.2がプレイ可能になる", () => {
      // jsdom環境でquerySelectorがnullを返す場合を考慮してcurrentLevelで確認
      game.clearLevel(1);
      expect(game.canPlaying(2)).toBe(true);
    });

    it("Lv.1クリア後もLv.1は引き続きプレイ可能", () => {
      game.clearLevel(1);
      expect(game.canPlaying(1)).toBe(true);
    });
  });

  // ── 型・エッジケース ────────────────────────────────────
  describe("エッジケース", () => {
    it("文字列の数字はclearLevelで正しく処理される", () => {
      game.clearLevel("1");
      expect(game.clearedLevels.has(1)).toBe(true);
    });

    it("文字列の数字はcanDropToClearで正しく処理される", () => {
      game.clearedLevels.add(1);
      expect(game.canDropToClear("1")).toBe(true);
    });

    it("無効な値を渡してもclearedLevelsが汚染されない", () => {
      game.clearLevel("abc");
      expect(game.clearedLevels.size).toBe(0);
    });

    it("無効な値を渡してもcurrentLevelが壊れない", () => {
      game.clearLevel("abc");
      expect(game.currentLevel).toBe(1);
    });
  });
});
