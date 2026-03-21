import { beforeEach, describe, expect, it, vi } from "vitest";
import { GAME_CONFIG } from "../../utils/constants.js";
import { BOARD_CONFIG } from "../createBoard.js";

const { CLASS_BLOCK, CLASS_DOOR, DOOR_DIRECTIONS } = BOARD_CONFIG;
const { GRID_SIZE } = GAME_CONFIG;

describe("createBoard", () => {
  let createBoard;

  beforeEach(async () => {
    // boardはモジュール読み込み時にgetElementByIdで取得されるため
    // DOM準備 → resetModules → 動的importの順番が必要
    document.body.innerHTML = `<div id="simon-board"></div>`;
    vi.resetModules();
    const module = await import("../createBoard.js");
    createBoard = module.createBoard;
  });

  // ── ブロック数 ──────────────────────────────────────────
  describe("ブロック数", () => {
    it(`GRID_SIZE(${GRID_SIZE})個のブロックが生成される`, () => {
      createBoard();
      expect(document.querySelectorAll(`.${CLASS_BLOCK}`)).toHaveLength(
        GRID_SIZE,
      );
    });

    it("2回呼んでもブロック数はGRID_SIZEのまま（replaceChildrenで初期化）", () => {
      createBoard();
      createBoard();
      expect(document.querySelectorAll(`.${CLASS_BLOCK}`)).toHaveLength(
        GRID_SIZE,
      );
    });
  });

  // ── ブロックの属性 ──────────────────────────────────────
  describe("ブロックの属性", () => {
    it("各ブロックにdata-indexが0から連番で付く", () => {
      createBoard();
      const blocks = document.querySelectorAll(`.${CLASS_BLOCK}`);
      blocks.forEach((block, i) => {
        expect(block.dataset.index).toBe(String(i));
      });
    });
  });

  // ── door構造 ────────────────────────────────────────────
  describe("door構造", () => {
    it("各ブロックに4つのdoorスパンがある", () => {
      createBoard();
      const blocks = document.querySelectorAll(`.${CLASS_BLOCK}`);
      blocks.forEach((block) => {
        expect(block.querySelectorAll(`.${CLASS_DOOR}`)).toHaveLength(4);
      });
    });

    it.each(DOOR_DIRECTIONS)("door--%sクラスが存在する", (direction) => {
      createBoard();
      const firstBlock = document.querySelector(`.${CLASS_BLOCK}`);
      expect(
        firstBlock.querySelector(`.${CLASS_DOOR}--${direction}`),
      ).not.toBeNull();
    });
  });
});
