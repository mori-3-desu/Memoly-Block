// ボタンを取得
const btn = document.getElementById("fade-btn");
const startScreen = document.getElementById("title");

if (btn) {
  // クリックしたら要素を付与
  btn.addEventListener("click", () => {
    if (!startScreen) console.error(" title not found ");
    startScreen.classList.add("fade-out");
  });
} else {
    console.error(" fade-btn not found ")
}

if (!startScreen) console.error(" title not found");