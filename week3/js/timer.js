(() => {
  let animationId = null; // アニメーションid

  // 時間計算用の変数
  let startTime = 0; // 開始ボタンを押した時刻
  let elapsedTime = 0; // 停止した時の時間を覚える

  // --- 定数定義  ---
  const MS_PER_SECOND = 1000;
  const MS_PER_MINUTE = 60000; // 1000 * 60
  const MS_PER_HOUR = 3600000; // 1000 * 60 * 60
  const MS_PER_CENTI = 10; // ミリ秒を2桁(00-99)で表示するための割る数

  // 文字を切り替える
  const TEXT_START = "開始";
  const TEXT_STOP = "停止";

  const DOM = {
    hours: document.getElementById("timer-hour"),
    mins: document.getElementById("timer-minute"),
    secs: document.getElementById("timer-seconds"),
    millsecs: document.getElementById("timer-millseconds"),
  };

  const formatTime = (num) => String(num).padStart(2, "0");

  // 数字を更新する関数 (DOM操作)
  const updateTimerDisplay = (h, m, s, ms) => {
    if (DOM.hours) DOM.hours.textContent = formatTime(h);
    if (DOM.mins) DOM.mins.textContent = formatTime(m);
    if (DOM.secs) DOM.secs.textContent = formatTime(s);
    if (DOM.millsecs) DOM.millsecs.textContent = formatTime(ms);
  };

  // 時間の計算をする関数 (ロジック)
  const calcTimer = (totalMs) => {
    const msVal = Math.max(0, totalMs);

    // ★ 定数を使ったことで、「何で割っているか」が一目瞭然！
    const hours = Math.floor(msVal / MS_PER_HOUR);
    const mins = Math.floor((msVal % MS_PER_HOUR) / MS_PER_MINUTE);
    const secs = Math.floor((msVal % MS_PER_MINUTE) / MS_PER_SECOND);
    const millsecs = Math.floor((msVal % MS_PER_SECOND) / MS_PER_CENTI);

    // 100時間超えガード
    if (hours >= 100) {
      stopTimer();
      return;
    }

    updateTimerDisplay(hours, mins, secs, millsecs);
  };

  // ループさせる
  const loop = (timestamp) => {
    const totalMs = timestamp - startTime + elapsedTime;
    calcTimer(totalMs);
    animationId = requestAnimationFrame(loop);
  };

  // 停止の関数
  const stopTimer = () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    elapsedTime += performance.now() - startTime;
    if (btn) btn.textContent = TEXT_START;
  };

  // 開始の関数
  const startTimer = () => {
    // 既存アニメーションの掃除
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    startTime = performance.now();
    animationId = requestAnimationFrame(loop);
    if (btn) btn.textContent = TEXT_STOP;
  };

  const btn = document.getElementById("timer-btn");
  btn.textContent = TEXT_START;
  btn?.addEventListener("click", (e) => {
    e.preventDefault();
    // animationId があれば（動いていれば）止める、なければ動かす
    animationId ? stopTimer() : startTimer();
  });

})();