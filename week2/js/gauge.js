/**
 * ============================================================================
 * Loading Screen Control Module (Educational Edition)
 * ============================================================================
 * * このモジュールは、以下の変遷を経て現在の形になりました。
 * * 1. [v1] Simple Timeout: 時間経過で強制的に消す（通信遅延に対応できない）
 * 2. [v2] Promise.all: 通信と演出の両方を待つ（エラーハンドリングがない）
 * 3. [v3] Retry & Timeout: エクスポネンシャルバックオフとタイムアウト制御を実装（Current）
 * * 後半に「なぜDOMを完全に削除(remove)する必要があるのか」の詳細な技術解説を含んでいます。
 */

const TIMER_CONFIG = {
  LOADING_FADE: 5000, // 演出用の最低待機時間
  HEAVY_TASK: 10000, // 重い処理の想定時間
  TIME_OUT: 20000, // タイムアウトまでの時間
  IDLE: 1000, // リトライ時の待機係数
};

const { LOADING_FADE, HEAVY_TASK, TIME_OUT, IDLE } = TIMER_CONFIG;

/* ----------------------------------------------------------------------------
 * Utility
 * ---------------------------------------------------------------------------- */
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ----------------------------------------------------------------------------
 * [Legacy v1] Simple Timeout Implementation
 * 問題点: 処理が終わっていなくても、時間になれば強制的に画面が開いてしまう
 * ---------------------------------------------------------------------------- */
/*
window.addEventListener("load", () => {
  const loading = document.getElementById("loading-screen");
  if (loading) {
    // 時間管理のみで制御
    setTimeout(() => {
      loading.classList.add("fade-out");
      // remove処理なし（GCやアクセシビリティの問題が残る）
    }, LOADING_FADE);
  }
});
*/

/* ----------------------------------------------------------------------------
 * [Legacy v2] Async/Await Simple Implementation
 * 問題点: エラー時のリトライがなく、サーバーダウン時にユーザーが詰む
 * ---------------------------------------------------------------------------- */
/*
window.addEventListener("load", async () => {
  const loading = document.getElementById("loading-screen");
  if (!loading) return;

  // 演出と読み込みを待つが、リトライ機能がない
  await wait(LOADING_FADE); 
  loading.classList.add("fade-out");
  
  loading.addEventListener("transitionend", () => {
    loading.remove();
  }, { once: true });
});
*/

/* ----------------------------------------------------------------------------
 * [Production v3] Advanced Retry & Timeout Logic
 * 特長:
 * - Promise.raceによるタイムアウト制御
 * - 指数関数的バックオフによるリトライ
 * - ユーザーへのエラー通知UI
 * ---------------------------------------------------------------------------- */

// 実際の重い処理（API通信などを想定）
const heavyTask = async () => {
  console.log("running heavy task...");
  await wait(HEAVY_TASK);

  // テスト用：20%の確率で失敗させる
  if (Math.random() < 0.2) throw new Error("Server error");
  return "Complete loading!";
};

// タイムアウト制御ラッパー
const withTimeout = (promise, ms) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), ms),
  );
  return Promise.race([promise, timeout]);
};

// アプリケーション初期化フロー
const initializeApp = async () => {
  const loading = document.getElementById("loading-screen");
  if (!loading) return;

  const maxRetries = 3;

  for (let i = 1; i <= maxRetries; i++) {
    try {
      console.log(`${i} count running`);

      // 演出(5s) と 通信処理(Timeout付き) を並列実行
      await withTimeout(
        Promise.all([wait(LOADING_FADE), heavyTask()]),
        TIME_OUT,
      );

      // 成功時
      completeLoading(loading);
      break;
    } catch (e) {
      console.warn(`${i} count error:`, e.message);

      // リトライ上限到達時
      if (i < maxRetries) {
        // バックオフ待機 (1秒, 2秒, 3秒...)
        await wait(IDLE * Math.pow(2, i));
        continue;
      }
    }
    // ここで「リロードする」という具体的な処理を渡す
    showErrorToUser(loading, () => location.reload());
  }
};

/**
 * ローディング完了処理
 * @param {HTMLElement} element
 */
const completeLoading = (element) => {
  if (!element) return;

  element.classList.add("fade-out");

  // アニメーション終了後にDOMから完全削除
  element.addEventListener(
    "transitionend",
    () => {
      element.remove();
      console.log("Success loading & Removed from DOM");
    },
    { once: true },
  );
};

// エラー画面のエレメントを作成
const showErrorToUser = (element, onRetry) => {
  element.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.classList.add("error-msg");

  const message = document.createElement("p");
  message.textContent = "Connection failed";

  const button = document.createElement("button");
  button.textContent = "Retry";

  // 具体的な処理（リロードなど）は外から渡された関数に任せる
  button.addEventListener("click", onRetry);
  // 組み立て（Append）
  wrapper.appendChild(message);
  wrapper.appendChild(button);
  // 最後に1回だけDOMに追加（ここで描画が走る）
  element.appendChild(wrapper);

  // 必要ならフェードインさせるクラス操作
  element.classList.remove("fade-out");
};

// 二重発火防止のため { once: true } を付与
window.addEventListener("load", initializeApp, { once: true });

/**
 * ============================================================================
 * 【技術解説】なぜ remove() でDOMを消し去る必要があるのか？
 * ============================================================================
 * * 単に opacity: 0 で見えなくするだけでは、「見えない亡霊（Ghost Element）」が残り、
 * 以下の4つの重大なデグレ（不具合）を引き起こします。
 * * 1. 「透明な壁」問題（操作不能）
 * - 症状: ゲーム開始ボタンなどが押せない。
 * - 原因: 最前面にある透明なローディング画面がクリックを吸ってしまう。
 * - 解決: remove() で要素自体を消せば、物理的に壁がなくなる。
 * (pointer-events: none は解決策の1つだが、下記の2,3,4を防げない)
 * ============================================================================
 * * 2. アクセシビリティの欠損（Tabキー迷子）
 * - 症状: ローディング後、Tabキー操作でフォーカスが透明な要素に吸われる。
 * - リスク: スクリーンリーダー利用者が混乱する。
 * ============================================================================
 * * 3. レイアウト崩れ（Flex/Gridの影響）
 * - 症状: ゲーム画面のセンタリングが微妙にズレる。
 * - 原因: display: none 以外の非表示方法では、要素の「計算上のサイズ」が残るため。
 * ============================================================================
 * * 4. パフォーマンス（メモリリーク）
 * - 症状: スマホでの動作が重くなる。
 * - 原因: ブラウザは非表示の要素もDOMツリーにある限り管理・計算し続ける。
 * - 解決: remove() でDOMツリーから切り離すことで、ガベージコレクション(GC)を促す。
 * * 結論:
 * 「アニメーションを見届けてから remove() する」ことは、単なる後片付けではなく、
 * アプリケーションの堅牢性を保つための必須実装です。
 * ============================================================================
 * 【ガベージコレクション(GC)とremove()の関係】
 * ガベージコレクション(GC)は、不要になったメモリ領域を自動的に解放する機能です。
 * C++などの言語とは異なり、JavaScriptでは自動で行われますが、万能ではありません。
 *  重要: ブラウザのGCは「どこからも参照されていないもの」だけをゴミとみなします。
 * DOMツリー（画面）に要素が残っていると、GCは「まだ使っている」と判断し、
 * メモリを解放できません。
 * そのため、remove() で明示的に切り離すことが、メモリリークを防ぐための
 * 「GCへのゴミ出し依頼」になります
 * ============================================================================
 */
