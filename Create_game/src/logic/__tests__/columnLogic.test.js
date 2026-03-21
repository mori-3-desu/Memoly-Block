import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// 今回は単体テストなので別で定義している関数をモック化して実行している
describe("columnLogic", () => {
  let handleColumnDrop, handleClearZoneDrop;
  let revertLevelCardToTodo, setLevelCardToDoing, finalizeLevelClear;
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

    vi.doMock("../../features/dragManager.js", () => ({
      revertLevelCardToTodo: vi.fn(),
      setLevelCardToDoing: vi.fn(),
      finalizeLevelClear: vi.fn(),
    }));

    vi.doMock("../state.js", () => ({
      game: { canDropToClear: vi.fn() },
    }));

    ({ handleColumnDrop, handleClearZoneDrop } =
      await import("../columnLogic.js"));
    ({ revertLevelCardToTodo, setLevelCardToDoing, finalizeLevelClear } =
      await import("../../features/dragManager.js"));
    ({ game } = await import("../state.js"));
    ({ columns } = await import("../../ui/dom.js"));
    ({ dragStatus } = await import("../../utils/constants.js"));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── handleColumnDrop ──────────────────────────────────────────
  describe("handleColumnDrop", () => {
    it("columnがnull → revertLevelCardToTodoが呼ばれる", () => {
      handleColumnDrop(null, 1);
      expect(revertLevelCardToTodo).toHaveBeenCalled();
    });

    it("columnがcolumns.todo → revertLevelCardToTodoが呼ばれる", () => {
      handleColumnDrop(columns.todo, 1);
      expect(revertLevelCardToTodo).toHaveBeenCalled();
    });

    it("columnがcolumns.doing → setLevelCardToDoing(level)が呼ばれる", () => {
      handleColumnDrop(columns.doing, 2);
      expect(setLevelCardToDoing).toHaveBeenCalledWith(2);
    });

    it("columnがcolumns.clear・クリア済み → finalizeLevelClearが呼ばれる", () => {
      const card = document.createElement("div");
      dragStatus.activeCard = card;
      game.canDropToClear.mockReturnValue(true);
      handleColumnDrop(columns.clear, 1);
      expect(finalizeLevelClear).toHaveBeenCalledWith(card);
    });

    it("columnがcolumns.clear・未クリア → revertLevelCardToTodoが呼ばれる", () => {
      dragStatus.activeCard = document.createElement("div");
      game.canDropToClear.mockReturnValue(false);
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
      game.canDropToClear.mockReturnValue(false);
      handleClearZoneDrop(1);
      expect(revertLevelCardToTodo).toHaveBeenCalled();
    });

    it("canDropToClearがtrue → finalizeLevelClear(card)が呼ばれる", () => {
      const card = document.createElement("div");
      dragStatus.activeCard = card;
      game.canDropToClear.mockReturnValue(true);
      handleClearZoneDrop(1);
      expect(finalizeLevelClear).toHaveBeenCalledWith(card);
    });
  });
});
