import { describe, expect, it } from "vitest";
import { GAME_CONFIG } from "../../utils/constants.js";
import { generateSequence } from "../gameLogic.js";

const { GRID_SIZE } = GAME_CONFIG;

describe("generateSequence", () => {
  // ── 配列の長さ ──────────────────────────────────────────
  describe("配列の長さ", () => {
    it("countと同じ長さの配列を返す", () => {
      const result = generateSequence(5, GRID_SIZE, 0);
      expect(result).toHaveLength(5);
    });

    it("countが0のとき空配列を返す", () => {
      const result = generateSequence(0, GRID_SIZE, 0);
      expect(result).toHaveLength(0);
    });
  });

  // ── インデックスの範囲 ──────────────────────────────────
  describe("インデックスの範囲", () => {
    it("すべての値が0以上length-1以内に収まる", () => {
      const length = GRID_SIZE;
      const result = generateSequence(10, length, 0);
      result.forEach((index) => {
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(length);
      });
    });
  });

  // ── 連続重複なし ────────────────────────────────────────
  describe("連続重複なし", () => {
    it("同じインデックスが連続して出現しない", () => {
      // ランダムなので複数回試行して確認する
      for (let i = 0; i < 20; i++) {
        const result = generateSequence(10, GRID_SIZE, 0);
        for (let j = 0; j < result.length - 1; j++) {
          expect(result[j]).not.toBe(result[j + 1]);
        }
      }
    });
  });
});
