// src/App.js (Reactの App.tsx を再現)
import { initNav } from "./ui/nav.js";
import { initScreen } from "./ui/screenManager.js";
import { initDrag } from "./features/dragEngine.js";
import { initResultBtn } from "./logic/gameResultFlow.js";

// アプリの本体をエクスポートする
export const App = () => {
  try {
    initNav();
    initScreen();
    initDrag();
    initResultBtn();
  } catch (error) {
    console.error("Failed to start the app:", error);
  }
};