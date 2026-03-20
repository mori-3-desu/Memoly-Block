const sensor = document.getElementById("sensor");
const monitor = document.querySelector(".container");
const btn = document.querySelector(".power-btn");

// 設定：10秒
const LITING_CLASS_NAME = "is-active";
const AUTO_OFF_DELAY = 10000;
const GUARD_TIME = 1000;
let timerId = null;
let lastBtnTime = 0;

// ==========================================
// 🛠️ 共通ロジック（機能の部品化）
// ==========================================

/**
 * 1. ライトをONにして、自動消灯タイマーをセット（リセット）する
 * （センサーもボタンのON時もこれを使う）
 */
const turnOnWithTimer = () => {
  monitor.classList.add(LITING_CLASS_NAME);

  // 前の予約があれば消す（リセット処理）
  if (timerId) clearTimeout(timerId);

  // 新しく消灯予約
  timerId = setTimeout(() => {
    turnOff(); // 時間が来たら消す関数を呼ぶ
  }, AUTO_OFF_DELAY);
};

/**
 * 2. ライトをOFFにして、タイマーも解除する
 * （ボタンで消す時や、自動消灯時に使う）
 */
const turnOff = () => {
  monitor.classList.remove(LITING_CLASS_NAME);

  // もし手動で消したら、残っているタイマーもキャンセルする
  if (timerId) {
    clearTimeout(timerId);
    timerId = null;
  }
};

// ==========================================
// 🖱️ イベントリスナー（使い分け）
// ==========================================

// センサーの挙動：ひたすら「ON & タイマー更新」
// 触れるたびに時間が延長される（消すことはしない）
const sensorEvents = ["mouseenter", "touchstart"];

sensorEvents.forEach((evt) => {
  sensor.addEventListener(evt, turnOnWithTimer);
});

// ボタンの挙動：「トグル（ON/OFF切り替え）」
// ONにする時はタイマーをつける。OFFにする時は即座に消す。
if (btn) {
  sensorEvents.forEach((evt) => {
    btn.addEventListener(evt, () => {
      // 実行時間を取得
      const now = Date.now();

      // 10秒たってなかったら無視して終了
      if (now - lastBtnTime < GUARD_TIME) {
        return;
      }
      // 実効時間を保存
      lastBtnTime = now;

      const isOn = monitor.classList.contains(LITING_CLASS_NAME);
      
      let light = isOn; // ライトがついた時の説明変数
      light = isOn ? turnOff() : turnOnWithTimer();
    });
  });
}
