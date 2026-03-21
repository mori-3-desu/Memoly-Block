import { beforeEach, describe, expect, it, vi } from "vitest";

describe("columnLogic", () => {
  let handleColumnDrop, handleClearZoneDrop;
  let revertLevelCardToTodo, finalizeLevelClear;
  let game;
  let columns;
  let dragStatus;

  beforeEach(async () => {
    document.body.innerHTML = `
      <div id="todo-column"></div>
      <div id="doing-column"></div>
      <div id="clear-column"></div>
    `;

    vi.resetModules();

    vi.doMock("../features/dragManager.js", () => ({
      revertLevelCardToTodo: vi.fn(),
      setLevelCardToDoing: vi.fn(),
      finalizeLevelClear: vi.fn(),
    }));

    ({ handleColumnDrop, handleClearZoneDrop } = await import("../logic/columnLogic.js"));
    ({ revertLevelCardToTodo, finalizeLevelClear } = await import("../features/dragManager.js"));
    ({ columns } = await import("../ui/dom.js"));
    ({ dragStatus } = await import("../utils/constants.js"));
    ({ game } = await import("../logic/state.js"));
  });

  // ── handleColumnDrop ──────────────────────────────────────────
  describe("handleColumnDrop", () => {
    it("columnがcolumns.clear・クリア済み → finalizeLevelClearが呼ばれる", () => {
      const card = document.createElement("div");
      dragStatus.activeCard = card;
      game.clearLevel(1);
      handleColumnDrop(columns.clear, 1);
      expect(finalizeLevelClear).toHaveBeenCalledWith(card);
    });

    it("columnがcolumns.clear・未クリア → revertLevelCardToTodoが呼ばれる", () => {
      dragStatus.activeCard = document.createElement("div");
      handleColumnDrop(columns.clear, 1);
      expect(revertLevelCardToTodo).toHaveBeenCalled();
    });
  });

  // ── handleClearZoneDrop ───────────────────────────────────────
  describe("handleClearZoneDrop", () => {
    it("activeCardがnull → 何も呼ばれない", () => {
      dragStatus.activeCard = null;
      handleClearZoneDrop(1);
      expect(revertLevelCardToTodo).not.toHaveBeenCalled();
      expect(finalizeLevelClear).not.toHaveBeenCalled();
    });

    it("canDropToClearがfalse → revertLevelCardToTodoが呼ばれる", () => {
      dragStatus.activeCard = document.createElement("div");
      handleClearZoneDrop(1);
      expect(revertLevelCardToTodo).toHaveBeenCalled();
    });

    it("canDropToClearがtrue → finalizeLevelClear(card)が呼ばれる", () => {
      const card = document.createElement("div");
      dragStatus.activeCard = card;
      game.clearLevel(2);
      handleClearZoneDrop(2);
      expect(finalizeLevelClear).toHaveBeenCalledWith(card);
    });
  });
});
