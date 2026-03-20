export const board = document.getElementById("simon-board"); // 盤面のID
export const cards = document.querySelectorAll(".level-card[data-level]"); // ドラッグ対象要素をすべて取得

// おける列をすべて取得
export const columns = {
  todo: document.getElementById("todo-column"),
  doing: document.getElementById("doing-column"),
  clear: document.getElementById("clear-column"),
};
