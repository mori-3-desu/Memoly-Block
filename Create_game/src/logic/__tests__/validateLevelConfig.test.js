import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { levelSettings } from "../../utils/constants.js";

describe("validateLevelConfig", () => {
  let validateLevelConfig;

  beforeEach(async () => {
    // モジュールキャッシュをリセットして毎回クリーンな状態でimport
    vi.resetModules();
    const module = await import("../gameFlow.js");
    validateLevelConfig = module.validateLevelConfig;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── 正常系 ──────────────────────────────────────────────
  describe("正常系", () => {
    it.each([1, 2, 3])("Lv.%iの設定を正しく返す", (level) => {
      expect(validateLevelConfig(level)).toEqual(levelSettings[level]);
    });
  });

  // ── 存在しないレベル ────────────────────────────────────
  describe("異常系", () => {
    it.each([0, 99, "abc"])("無効な値 %s はnullを返す", (level) => {
      expect(validateLevelConfig(level)).toBeNull();
    });
  });

  // ── 型チェック ──────────────────────────────────────────
  describe("型チェック", () => {
    it("flashCountが文字列のときnullを返す", async () => {
      vi.doMock("../../utils/constants.js", async (importOriginal) => {
        const actual = await importOriginal();
        return {
          ...actual,
          levelSettings: {
            ...actual.levelSettings,
            1: { level: 1, flashCount: "5", flashSpeed: 900 },
          },
        };
      });

      vi.resetModules();
      const { validateLevelConfig: fn } = await import("../gameFlow.js");
      expect(fn(1)).toBeNull();
    });

    it("flashSpeedが文字列のときnullを返す", async () => {
      vi.doMock("../../utils/constants.js", async (importOriginal) => {
        const actual = await importOriginal();
        return {
          ...actual,
          levelSettings: {
            ...actual.levelSettings,
            1: { level: 1, flashCount: 5, flashSpeed: "900" },
          },
        };
      });

      vi.resetModules();
      const { validateLevelConfig: fn } = await import("../gameFlow.js");
      expect(fn(1)).toBeNull();
    });
  });
});
